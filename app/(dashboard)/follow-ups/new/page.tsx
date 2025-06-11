"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/client/components/ui/card";
import { Button } from "@/lib/client/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/lib/client/components/ui/form";
import { Input } from "@/lib/client/components/ui/input";
import { Textarea } from "@/lib/client/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/client/components/ui/select";
import { useToast } from "@/lib/client/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
// Removed Tabs imports as they are not used in the final version of this form.
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/client/components/ui/tabs";

import { useAuthStore } from "@/lib/store";
import { checkPermission } from "@/lib/permissions";
import { apiClient } from "@/lib/client/api/api-client";
import { IMember } from "@/models/member";
import { IAttendee } from "@/models/attendee";
import { IUser } from "@/models/user";


const followUpFormSchema = z.object({ // Renamed from newPersonSchema for clarity
  personType: z.enum(['Unregistered Guest', 'New Convert', 'Attendee', 'Member']),
  newAttendee_firstName: z.string().optional(),
  newAttendee_lastName: z.string().optional(),
  newAttendee_email: z.string().email().optional().or(z.literal('')),
  newAttendee_phoneNumber: z.string().optional(),
  newAttendee_whatsappNumber: z.string().optional(),
  newAttendee_address: z.string().optional(),
  newAttendee_visitDate: z.string().optional(),
  newAttendee_invitedFor: z.string().optional(),

  memberId: z.string().optional(),
  attendeeId: z.string().optional(),

  eventId: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().min(1,"Assigned to is required"),
  centerId: z.string().optional(),
  clusterId: z.string().optional(), // Added clusterId for context
}).superRefine((data, ctx) => {
  if (data.personType === 'Unregistered Guest' || (data.personType === 'New Convert' && !data.memberId && !data.attendeeId)) {
    if (!data.newAttendee_firstName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "First name is required for new person.", path: ["newAttendee_firstName"] });
    if (!data.newAttendee_lastName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Last name is required for new person.", path: ["newAttendee_lastName"] });
    if (!data.newAttendee_phoneNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Phone number is required for new person.", path: ["newAttendee_phoneNumber"] });
    if (!data.newAttendee_visitDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Visit date is required for new person.", path: ["newAttendee_visitDate"] });
  }
  if (data.personType === 'Member' && !data.memberId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Member selection is required.", path: ["memberId"] });
  }
  if (data.personType === 'Attendee' && !data.attendeeId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Attendee selection is required.", path: ["attendeeId"] });
  }
});

type FollowUpFormValues = z.infer<typeof followUpFormSchema>;

interface SelectOption { _id: string; name: string; }

export default function NewFollowUpPage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const centerIdFromQuery = searchParamsHook.get("centerId");
  const clusterIdFromQuery = searchParamsHook.get("clusterId"); // Read clusterId
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [assignableUsers, setAssignableUsers] = useState<SelectOption[]>([]);
  const [events, setEvents] = useState<SelectOption[]>([]);
  const [members, setMembers] = useState<IMember[]>([]);
  const [attendees, setAttendees] = useState<IAttendee[]>([]);

  const [canCreateFollowUp, setCanCreateFollowUp] = useState(false);
  // const [isGlobalAdmin, setIsGlobalAdmin] = useState(false); // Keep if needed for other logic

  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpFormSchema),
    defaultValues: {
      personType: 'Unregistered Guest',
      newAttendee_visitDate: new Date().toISOString().split('T')[0],
      centerId: centerIdFromQuery || undefined,
      clusterId: clusterIdFromQuery || undefined, // Pre-fill clusterId
    },
  });
  
  const watchedPersonType = form.watch("personType");

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      setIsLoadingData(true);

      const globalAdmin = await checkPermission(user, "GLOBAL_ADMIN");
      // setIsGlobalAdmin(globalAdmin); // Set if needed elsewhere
      let hasCreatePerm = globalAdmin;

      let effectiveCenterId = centerIdFromQuery;
      let effectiveClusterId = clusterIdFromQuery;

      if (!globalAdmin) {
        if (effectiveClusterId) { // If cluster is in query, check against it
          const clusterLeader = await checkPermission(user, "CLUSTER_LEADER", { clusterId: effectiveClusterId });
          if (clusterLeader) hasCreatePerm = true;
          // If not cluster leader, check if center admin for the cluster's center
          if (!hasCreatePerm && !effectiveCenterId) { // Fetch cluster to get its center if not provided
            try {
                const clusterDetails = await apiClient.get<{cluster: {centerId: string}}>(`/clusters/${effectiveClusterId}?fields=centerId`);
                effectiveCenterId = clusterDetails.cluster.centerId;
                form.setValue('centerId', effectiveCenterId); // Set derived centerId in form
            } catch (e) { console.error("Failed to fetch parent center for cluster", e); }
          }
        }
        if (effectiveCenterId && !hasCreatePerm) { // Check center admin if not already permitted
             const centerAdmin = await checkPermission(user, "CENTER_ADMIN", {centerId: effectiveCenterId});
             if(centerAdmin) hasCreatePerm = true;
        }
        if (!effectiveCenterId && !effectiveClusterId) { // No specific scope, check if they are any center admin
            hasCreatePerm = await checkPermission(user, "CENTER_ADMIN");
        }
      }
      
      setCanCreateFollowUp(hasCreatePerm);
      if (!hasCreatePerm) {
        toast({ title: "Access Denied", description: "You don't have permission to create follow-ups.", variant: "destructive" });
        router.back();
        setIsLoadingData(false);
        return;
      }

      try {
        // Fetch users for "Assigned To" dropdown
        const usersRes = await apiClient.get<{ users: IUser[] }>("/users?limit=200");
        setAssignableUsers(usersRes.users?.map(u => ({ _id: u._id, name: `${u.firstName} ${u.lastName}` })) || []);

        // Fetch events
        const eventsRes = await apiClient.get<{ events: any[] }>(`/events?limit=200${effectiveCenterId ? `&centerId=${effectiveCenterId}` : ''}${effectiveClusterId ? `&clusterId=${effectiveClusterId}` : ''}`);
        setEvents(eventsRes.events?.map(e => ({ _id: e._id, name: `${e.title} (${formatDate(new Date(e.startDate))})` })) || []);

        // Fetch members and attendees - filter by clusterId if present, then centerId
        let personFilter = "limit=500";
        if (effectiveClusterId) personFilter = `clusterId=${effectiveClusterId}&limit=500`;
        else if (effectiveCenterId) personFilter = `centerId=${effectiveCenterId}&limit=500`;

        const membersRes = await apiClient.get<{ data?: { members: IMember[] }, members?: IMember[] }>(`/members?${personFilter}`);
        setMembers(membersRes.data?.members || membersRes.members || []);

        const attendeesRes = await apiClient.get<{ attendees: IAttendee[] }>(`/attendees?${personFilter}`);
        setAttendees(attendeesRes.attendees || []);

      } catch (error) {
        toast({ title: "Error", description: "Failed to load necessary data.", variant: "destructive" });
      } finally {
        setIsLoadingData(false);
      }
    };
    loadInitialData();
  }, [user, centerIdFromQuery, clusterIdFromQuery, toast, router, form]);


  async function onSubmit(values: FollowUpFormValues) {
    setIsSubmitting(true);
    try {
      const payload: any = {
        personType: values.personType,
        notes: values.notes,
        assignedTo: values.assignedToId,
        centerId: values.centerId || centerIdFromQuery,
        clusterId: values.clusterId || clusterIdFromQuery,
      };

      if (values.personType === 'Unregistered Guest' || (values.personType === 'New Convert' && !values.memberId && !values.attendeeId)) {
        payload.newAttendee = {
          firstName: values.newAttendee_firstName,
          lastName: values.newAttendee_lastName,
          email: values.newAttendee_email,
          phoneNumber: values.newAttendee_phoneNumber,
          whatsappNumber: values.newAttendee_whatsappNumber,
          address: values.newAttendee_address,
          visitDate: values.newAttendee_visitDate,
          invitedFor: values.newAttendee_invitedFor,
          centerId: values.centerId || centerIdFromQuery,
          clusterId: values.clusterId || clusterIdFromQuery, // Pass clusterId for new Attendee
        };
      } else if (values.personType === 'Member') {
        payload.personId = values.memberId;
      } else if (values.personType === 'Attendee') {
        payload.attendeeId = values.attendeeId;
      }
      
      if (values.eventId && values.eventId !== "none") {
        payload.missedEvent = { eventId: values.eventId, eventDate: new Date(), eventType: "Event" };
      }

      await apiClient.post('/follow-ups', payload);
      toast({ title: "Follow-up created", description: "The follow-up has been created successfully." });
      if (clusterIdFromQuery) router.push(`/clusters/${clusterIdFromQuery}/dashboard/follow-ups`);
      else if (centerIdFromQuery) router.push(`/centers/${centerIdFromQuery}/dashboard/follow-ups`);
      else router.push("/dashboard/follow-ups");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create follow-up.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isLoadingData || (!canCreateFollowUp && !isSubmitting)) {
    return <div className="container mx-auto py-6 text-center"><p>Loading or Access Denied...</p></div>;
  }
  
  // Determine if center/cluster context should make fields read-only
  const disableCenterSelection = !!centerIdFromQuery && !isGlobalAdmin; // Simplified
  const disableClusterSelection = !!clusterIdFromQuery && !isGlobalAdmin; // Simplified


  return (
    <div className="space-y-6 container mx-auto py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Follow-up</h1>
        <Button variant="outline" asChild>
          <Link href={clusterIdFromQuery ? `/clusters/${clusterIdFromQuery}/dashboard/follow-ups` : (centerIdFromQuery ? `/centers/${centerIdFromQuery}/dashboard/follow-ups` : "/dashboard/follow-ups")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader><CardTitle>Create Follow-up</CardTitle><CardDescription>Set up a new follow-up.</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Center and Cluster hidden fields or read-only if pre-selected */}
              {centerIdFromQuery && <input type="hidden" {...form.register("centerId")} value={centerIdFromQuery} />}
              {clusterIdFromQuery && <input type="hidden" {...form.register("clusterId")} value={clusterIdFromQuery} />}

              <FormField control={form.control} name="personType" render={({ field }) => (
                <FormItem><FormLabel>Person Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select person type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Unregistered Guest">Unregistered Guest (New person)</SelectItem>
                      <SelectItem value="Attendee">Existing Attendee</SelectItem>
                      <SelectItem value="Member">Existing Member</SelectItem>
                      <SelectItem value="New Convert">New Convert</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>

              {watchedPersonType === 'Unregistered Guest' || (watchedPersonType === 'New Convert' && !form.getValues('memberId') && !form.getValues('attendeeId')) ? (
                <div className="space-y-4 p-4 border rounded-md">
                  <h3 className="font-medium">New Person Details:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="newAttendee_firstName" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input placeholder="First name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="newAttendee_lastName" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input placeholder="Last name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="newAttendee_email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Email (optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="newAttendee_phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number *</FormLabel><FormControl><Input placeholder="Phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="newAttendee_whatsappNumber" render={({ field }) => (<FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input placeholder="WhatsApp (optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="newAttendee_visitDate" render={({ field }) => (<FormItem><FormLabel>Visit Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="newAttendee_address" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Address (optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="newAttendee_invitedFor" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Invited For</FormLabel><FormControl><Input placeholder="e.g. Sunday Service (optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                </div>
              ) : null}

              {watchedPersonType === 'Member' || (watchedPersonType === 'New Convert' && !!form.getValues('memberId')) ? (
                <FormField control={form.control} name="memberId" render={({ field }) => (
                  <FormItem><FormLabel>Select Member *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger></FormControl>
                      <SelectContent>{members.map(m => (<SelectItem key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.email || m.phoneNumber})</SelectItem>))}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )}/>
              ) : null}

              {watchedPersonType === 'Attendee' || (watchedPersonType === 'New Convert' && !!form.getValues('attendeeId')) ? (
                <FormField control={form.control} name="attendeeId" render={({ field }) => (
                  <FormItem><FormLabel>Select Attendee *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select attendee" /></SelectTrigger></FormControl>
                      <SelectContent>{attendees.map(a => (<SelectItem key={a._id} value={a._id}>{a.firstName} {a.lastName} ({a.phoneNumber})</SelectItem>))}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )}/>
              ) : null}

              <FormField control={form.control} name="eventId" render={({ field }) => (
                <FormItem><FormLabel>Related Event (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select event if related" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="none">None</SelectItem>{events.map(e => (<SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>))}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="assignedToId" render={({ field }) => (
                <FormItem><FormLabel>Assigned To *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select user to assign" /></SelectTrigger></FormControl>
                    <SelectContent>{assignableUsers.map(u => (<SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>))}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>

              <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Initial notes for the follow-up" {...field} /></FormControl><FormMessage /></FormItem>)} />

              <div className="flex justify-end"><Button type="submit" disabled={isSubmitting || isLoadingData || !canCreateFollowUp}>{isSubmitting ? "Creating..." : <><Save className="mr-2 h-4 w-4" /> Create Follow-up</>}</Button></div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}