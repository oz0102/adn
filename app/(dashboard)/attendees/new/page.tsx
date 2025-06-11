"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/lib/client/components/ui/button';
import { Input } from '@/lib/client/components/ui/input';
import { Textarea } from '@/lib/client/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/client/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/lib/client/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/client/components/ui/card';
import { useToast } from '@/lib/client/components/ui/use-toast';

import { ArrowLeft, UserPlus } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { checkPermission } from '@/lib/permissions';

const attendeeFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phoneNumber: z.string().min(1, "Phone number is required"),
  whatsappNumber: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_country: z.string().optional(),
  address_postalCode: z.string().optional(),
  centerId: z.string().min(1, "Center is required"),
  clusterId: z.string().optional(),
  level: z.enum(['First-Timer', 'Occasional Attendee', 'Regular Attendee']).default('First-Timer'),
  tags: z.string().optional(),
  notes: z.string().optional(),
  firstAttendanceDate: z.date().optional(),
});

type AttendeeFormValues = z.infer<typeof attendeeFormSchema>;

interface Center { _id: string; name: string; }
interface Cluster { _id: string; name: string; centerId?: { _id: string; name: string } | string; }

export default function NewAttendeePage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const centerIdFromQuery = searchParamsHook.get("centerId");
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [centers, setCenters] = useState<Center[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [filteredClusters, setFilteredClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSelectData, setIsFetchingSelectData] = useState(true);
  const [canCreateAttendee, setCanCreateAttendee] = useState(false);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);

  const form = useForm<AttendeeFormValues>({
    resolver: zodResolver(attendeeFormSchema),
    defaultValues: {
      level: 'First-Timer',
      firstAttendanceDate: new Date(),
      centerId: centerIdFromQuery || undefined, // Pre-fill if centerId in query
      clusterId: undefined,
    },
  });

  const selectedCenterId = form.watch("centerId");

  useEffect(() => {
    const checkPermissionsAndFetchData = async () => {
      if (user) {
        const globalAdmin = await checkPermission(user, "GLOBAL_ADMIN");
        setIsGlobalAdmin(globalAdmin);
        let hasCreatePermissionForSpecificCenter = false;
        if (centerIdFromQuery) {
            hasCreatePermissionForSpecificCenter = await checkPermission(user, "CENTER_ADMIN", { centerId: centerIdFromQuery });
        }
        // If centerIdFromQuery, user must be GA or CA for that center.
        // If no centerIdFromQuery, user must be GA or CA for *any* center to be able to select one.
        const canProceed = globalAdmin || hasCreatePermissionForSpecificCenter || (!centerIdFromQuery && await checkPermission(user, "CENTER_ADMIN"));
        setCanCreateAttendee(canProceed);

        if (!canProceed) {
          toast({ title: "Access Denied", description: "You don't have permission to create attendees for the specified center or any center.", variant: "destructive" });
          router.push(centerIdFromQuery ? `/centers/${centerIdFromQuery}/dashboard/attendees` : "/dashboard/attendees");
          return;
        }

        setIsFetchingSelectData(true);
        try {
          const centersResponse = await apiClient.get<{ centers: Center[] }>('/centers');
          let userCenters = centersResponse.centers || [];
          if (!globalAdmin) {
            const userCenterIds = user.assignedRoles?.filter(r => r.role === "CENTER_ADMIN" && r.centerId).map(r => r.centerId);
            userCenters = userCenters.filter(c => userCenterIds?.includes(c._id));
          }
          setCenters(userCenters);
          if (centerIdFromQuery && !userCenters.find(c => c._id === centerIdFromQuery)) {
             toast({ title: "Access Denied", description: "You cannot create attendees for the specified center.", variant: "destructive" });
             router.push("/dashboard/attendees"); // Or a more appropriate page
          } else if (centerIdFromQuery) {
             form.setValue('centerId', centerIdFromQuery); // Ensure it's set after centers are loaded if from query
          }


          const clustersResponse = await apiClient.get<{ clusters: Cluster[] }>('/clusters');
          setClusters(clustersResponse.clusters || []);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load centers or clusters.", variant: "destructive" });
        } finally {
          setIsFetchingSelectData(false);
        }
      }
    };
    checkPermissionsAndFetchData();
  }, [user, toast, router, centerIdFromQuery, form]);

  useEffect(() => {
    if (selectedCenterId) {
      setFilteredClusters(clusters.filter(c => {
        const cCenterId = typeof c.centerId === 'object' ? c.centerId?._id : c.centerId;
        return cCenterId === selectedCenterId;
      }));
    } else {
      setFilteredClusters([]);
    }
    if (form.getValues("centerId") === selectedCenterId) { // Only reset if it's a change, not initial load with query param
        // Check if this is a change from a different center or from no center
        if(form.formState.dirtyFields.centerId) {
             form.setValue("clusterId", undefined);
        }
    }
  }, [selectedCenterId, clusters, form]);


  async function onSubmit(values: AttendeeFormValues) {
    setIsLoading(true);
    try {
      const finalCenterId = values.centerId || centerIdFromQuery;
      if (!finalCenterId) {
        toast({ title: "Error", description: "Center ID is missing.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const payload = {
        ...values,
        centerId: finalCenterId,
        tags: values.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
        firstAttendanceDate: values.firstAttendanceDate || new Date(),
        clusterId: values.clusterId === "" ? undefined : values.clusterId, // Ensure empty string becomes undefined
      };
      const response = await apiClient.post<{ attendee: AttendeeFormValues & { _id: string} }>('/attendees', payload);
      toast({ title: "Success", description: "Attendee created successfully." });
      router.push(centerIdFromQuery ? `/centers/${centerIdFromQuery}/dashboard/attendees` : `/dashboard/attendees/${response.attendee._id}`);
    } catch (error: any) {
      console.error("Failed to create attendee:", error);
      toast({ title: "Error", description: error.message || "Failed to create attendee.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user || (!canCreateAttendee && !isLoading && !isFetchingSelectData)) {
    return <div className="container mx-auto py-6 text-center"><p>Loading or Access Denied.</p></div>;
  }

  const disableCenterSelection = !!centerIdFromQuery && !isGlobalAdmin;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <UserPlus className="mr-2 h-7 w-7" /> Create New Attendee
        </h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Attendee Information</CardTitle><CardDescription>Fill in the details for the new attendee.</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input placeholder="Enter first name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input placeholder="Enter last name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="Enter email (optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number *</FormLabel><FormControl><Input type="tel" placeholder="Enter phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="whatsappNumber" render={({ field }) => (<FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input type="tel" placeholder="Enter WhatsApp number (optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />

                <FormField control={form.control} name="centerId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Center *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingSelectData || disableCenterSelection}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isFetchingSelectData ? "Loading centers..." : "Select a center"} /></SelectTrigger></FormControl>
                        <SelectContent>{centers.map(center => (<SelectItem key={center._id} value={center._id}>{center.name}</SelectItem>))}</SelectContent>
                      </Select>
                      {disableCenterSelection && <FormDescription>Center pre-selected from context.</FormDescription>}
                      <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="clusterId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cluster</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""} disabled={isFetchingSelectData || !selectedCenterId || filteredClusters.length === 0}>
                        <FormControl><SelectTrigger><SelectValue placeholder={selectedCenterId ? (filteredClusters.length > 0 ? "Select a cluster" : "No clusters for this center") : "Select a center first"} /></SelectTrigger></FormControl>
                        <SelectContent>{filteredClusters.map(cluster => (<SelectItem key={cluster._id} value={cluster._id}>{cluster.name}</SelectItem>))}</SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="level" render={({ field }) => (
                    <FormItem><FormLabel>Level *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select attendee level" /></SelectTrigger></FormControl><SelectContent>
                          <SelectItem value="First-Timer">First-Timer</SelectItem>
                          <SelectItem value="Occasional Attendee">Occasional Attendee</SelectItem>
                          <SelectItem value="Regular Attendee">Regular Attendee</SelectItem>
                        </SelectContent></Select><FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="firstAttendanceDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>First Attendance Date</FormLabel><FormControl>
                        <Input type="date" value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}/>
                      </FormControl><FormDescription>Defaults to today if left blank.</FormDescription><FormMessage />
                    </FormItem>
                )}/>
              </div>

              <div className="space-y-2"><h3 className="text-lg font-medium">Address (Optional)</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="address_street" render={({ field }) => (<FormItem><FormLabel>Street</FormLabel><FormControl><Input placeholder="Street address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address_city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address_state" render={({ field }) => (<FormItem><FormLabel>State / Province</FormLabel><FormControl><Input placeholder="State / Province" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address_country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address_postalCode" render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="Postal Code" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div></div>

              <FormField control={form.control} name="tags" render={({ field }) => (<FormItem><FormLabel>Tags</FormLabel><FormControl><Input placeholder="Enter tags, comma-separated (e.g., visitor, new_believer)" {...field} /></FormControl><FormDescription>Comma-separated list of tags.</FormDescription><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Any additional notes about the attendee." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.push(centerIdFromQuery ? `/centers/${centerIdFromQuery}/dashboard/attendees` : '/dashboard/attendees')}>Cancel</Button>
                <Button type="submit" disabled={isLoading || isFetchingSelectData || !canCreateAttendee}>
                  {isLoading ? "Creating..." : "Create Attendee"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
