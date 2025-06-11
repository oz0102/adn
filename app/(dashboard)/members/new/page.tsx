"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/client/components/ui/card"
import { Button } from "@/lib/client/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/lib/client/components/ui/form"
import { Input } from "@/lib/client/components/ui/input"
import { Textarea } from "@/lib/client/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/client/components/ui/select"
import { useToast } from "@/lib/client/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"
import { apiClient } from "@/lib/api-client"

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().min(5, { message: "Phone number must be at least 5 characters." }),
  gender: z.string().min(1, { message: "Please select a gender." }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required." }),
  addressStreet: z.string().min(1, { message: "Street is required" }),
  addressCity: z.string().min(1, { message: "City is required" }),
  addressState: z.string().min(1, { message: "State is required" }),
  addressCountry: z.string().min(1, { message: "Country is required" }),
  addressPostalCode: z.string().optional(),
  maritalStatus: z.string().min(1, { message: "Please select a marital status." }),
  centerId: z.string().min(1, { message: "Center is required."}),
  clusterId: z.string().optional(),
  smallGroupId: z.string().optional(),
  notes: z.string().optional(),
  whatsappNumber: z.string().optional(),
})

interface DropdownOption {
  _id: string;
  name: string;
  centerId?: string | { _id: string }; // For clusters
  clusterId?: string | { _id: string }; // For small groups
}

export default function AddMemberPage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const centerIdFromQuery = searchParamsHook.get("centerId");
  const clusterIdFromQuery = searchParamsHook.get("clusterId"); // Read clusterId

  const { toast } = useToast();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [centers, setCenters] = useState<DropdownOption[]>([]);
  const [allClusters, setAllClusters] = useState<DropdownOption[]>([]); // Store all clusters initially
  const [allSmallGroups, setAllSmallGroups] = useState<DropdownOption[]>([]); // Store all small groups
  const [filteredClusters, setFilteredClusters] = useState<DropdownOption[]>([]);
  const [filteredSmallGroups, setFilteredSmallGroups] = useState<DropdownOption[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true); // Combined loading state
  
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [canCreateInContext, setCanCreateInContext] = useState(false); // General permission based on context

  const NONE_VALUE = "none"; // Represents no selection or clearing selection
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phoneNumber: "",
      gender: "", dateOfBirth: "",
      addressStreet: "", addressCity: "", addressState: "", addressCountry: "", addressPostalCode: "",
      maritalStatus: "",
      centerId: centerIdFromQuery || undefined,
      clusterId: clusterIdFromQuery || undefined,
      smallGroupId: undefined,
      whatsappNumber: "", notes: "",
    },
  });

  const watchedCenterId = form.watch('centerId');
  const watchedClusterId = form.watch('clusterId');

  useEffect(() => {
    const determinePermissionsAndFetchData = async () => {
      if (user) {
        setIsLoadingData(true);
        const globalAdmin = await checkPermission(user, "GLOBAL_ADMIN");
        setIsGlobalAdmin(globalAdmin);

        let hasCreatePermission = globalAdmin;
        const userCenterIds = user.assignedRoles?.filter(r => r.role === "CENTER_ADMIN" && r.centerId).map(r => r.centerId!) || [];
        
        if (!globalAdmin) {
            if (clusterIdFromQuery) {
                // If cluster is preselected, user needs to be CL for it, or CA for its parent center
                // This requires fetching cluster details to know its parent center if not passed or available
                // For simplicity, we assume if clusterIdFromQuery is passed, the new member form is for that cluster.
                // The checkPermission for CLUSTER_LEADER should ideally handle verifying context.
                const clusterLeaderForSelected = await checkPermission(user, "CLUSTER_LEADER", { clusterId: clusterIdFromQuery });
                // To check CA for parent, we'd need to fetch cluster details here if centerIdFromQuery is not also present
                if (clusterLeaderForSelected) hasCreatePermission = true;
                else if (centerIdFromQuery && userCenterIds.includes(centerIdFromQuery)) hasCreatePermission = true;

            } else if (centerIdFromQuery) {
                if (userCenterIds.includes(centerIdFromQuery)) hasCreatePermission = true;
            } else { // No preselection from query
                if (userCenterIds.length > 0) hasCreatePermission = true; // Can create if admin of *any* center
            }
        }
        setCanCreateInContext(hasCreatePermission);

        if (!hasCreatePermission) {
          toast({ title: "Access Denied", description: "You don't have permission to add members to the specified scope.", variant: "destructive" });
          router.back();
          setIsLoadingData(false);
          return;
        }

        try {
          const centersRes = await apiClient.get<{ centers: DropdownOption[] }>('/centers');
          let availableCenters = centersRes.centers || [];
          if(!globalAdmin){ availableCenters = availableCenters.filter(c => userCenterIds.includes(c._id)); }
          setCenters(availableCenters);
          if (centerIdFromQuery && availableCenters.find(c => c._id === centerIdFromQuery)) {
            form.setValue('centerId', centerIdFromQuery);
          } else if (availableCenters.length === 1 && !centerIdFromQuery && !globalAdmin) {
            form.setValue('centerId', availableCenters[0]._id);
          } else if (centerIdFromQuery && !globalAdmin && !availableCenters.find(c => c._id === centerIdFromQuery)){
             toast({ title: "Access Denied", description: "Cannot create members for the specified center.", variant: "destructive" });
             router.back(); return;
          }

          const clustersRes = await apiClient.get<{ clusters: DropdownOption[] }>("/clusters");
          setAllClusters(clustersRes.clusters || []);

          const smallGroupsRes = await apiClient.get<{ smallGroups: DropdownOption[] }>("/small-groups");
          setAllSmallGroups(smallGroupsRes.smallGroups || []);

        } catch (error) {
          toast({ title: "Error", description: "Failed to load selection data.", variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      }
    };
    determinePermissionsAndFetchData();
  }, [user, centerIdFromQuery, clusterIdFromQuery, toast, router, form]);

  useEffect(() => {
    if (watchedCenterId && watchedCenterId !== NONE_VALUE) {
      const newFilteredClusters = allClusters.filter(c => (typeof c.centerId === 'string' ? c.centerId : c.centerId?._id) === watchedCenterId);
      setFilteredClusters(newFilteredClusters);
      if (!newFilteredClusters.find(fc => fc._id === form.getValues('clusterId'))) {
         if (form.formState.dirtyFields.centerId || (preselectedCenterId && watchedCenterId !== preselectedCenterId) || !clusterIdFromQuery) {
            form.setValue('clusterId', undefined); // Use undefined for react-hook-form with select
         } else if (clusterIdFromQuery && newFilteredClusters.find(fc => fc._id === clusterIdFromQuery)){
            form.setValue('clusterId', clusterIdFromQuery);
         }
      }
    } else {
      setFilteredClusters(isGlobalAdmin ? allClusters : []);
      form.setValue('clusterId', undefined);
    }
  }, [watchedCenterId, allClusters, form, isGlobalAdmin, preselectedCenterId, clusterIdFromQuery]);

  useEffect(() => {
    if (watchedClusterId && watchedClusterId !== NONE_VALUE) {
      const newFilteredSmallGroups = allSmallGroups.filter(sg => (typeof sg.clusterId === 'string' ? sg.clusterId : sg.clusterId?._id) === watchedClusterId);
      setFilteredSmallGroups(newFilteredSmallGroups);
      if (!newFilteredSmallGroups.find(fsg => fsg._id === form.getValues('smallGroupId'))) {
        if(form.formState.dirtyFields.clusterId || (clusterIdFromQuery && watchedClusterId !== clusterIdFromQuery)) {
            form.setValue('smallGroupId', undefined);
        }
      }
    } else {
      setFilteredSmallGroups( (isGlobalAdmin && !watchedCenterId) ? allSmallGroups : []); // Show all SGs if GA and no center selected
      form.setValue('smallGroupId', undefined);
    }
  }, [watchedClusterId, allSmallGroups, form, isGlobalAdmin, watchedCenterId, clusterIdFromQuery]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const finalCenterId = values.centerId || centerIdFromQuery;
      const finalClusterId = values.clusterId || clusterIdFromQuery;

      if (!finalCenterId) { // Should always have a centerId
        toast({ title: "Error", description: "Center is required.", variant: "destructive" });
        setIsSubmitting(false); return;
      }

      const payload = {
        ...values,
        centerId: finalCenterId,
        clusterId: finalClusterId === NONE_VALUE || finalClusterId === "" ? undefined : finalClusterId,
        smallGroupId: values.smallGroupId === NONE_VALUE || values.smallGroupId === "" ? undefined : values.smallGroupId,
        address: {
          street: values.addressStreet, city: values.addressCity, state: values.addressState,
          country: values.addressCountry, postalCode: values.addressPostalCode || undefined,
        },
      };
      delete (payload as any).addressStreet; delete (payload as any).addressCity;
      delete (payload as any).addressState; delete (payload as any).addressCountry; delete (payload as any).addressPostalCode;
      
      await apiClient.post('/members', payload);
      toast({ title: "Member added", description: "The member has been added successfully." });
      if (clusterIdFromQuery) router.push(`/clusters/${clusterIdFromQuery}/dashboard/members`);
      else if (centerIdFromQuery) router.push(`/centers/${centerIdFromQuery}/dashboard/members`);
      else router.push("/dashboard/members");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add member.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const disableCenterSelection = !!centerIdFromQuery && !isGlobalAdmin;
  const disableClusterSelection = !!clusterIdFromQuery && !isGlobalAdmin;


  if (!user || (!canCreateInContext && !isLoadingData) ) {
    return <div className="container mx-auto py-6 text-center"><p>Loading or Access Denied.</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Member</h1>
        <Button variant="outline" asChild>
          <Link href={clusterIdFromQuery ? `/clusters/${clusterIdFromQuery}/dashboard/members` : (centerIdFromQuery ? `/centers/${centerIdFromQuery}/dashboard/members` : "/dashboard/members")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
      </div>
      
      <Card><CardHeader><CardTitle>Member Information</CardTitle><CardDescription>Enter details for the new member.</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input placeholder="First name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input placeholder="Last name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email *</FormLabel><FormControl><Input placeholder="Email" type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number *</FormLabel><FormControl><Input placeholder="Phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="whatsappNumber" render={({ field }) => (<FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input placeholder="WhatsApp (optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (<FormItem><FormLabel>Date of Birth *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="maritalStatus" render={({ field }) => (<FormItem><FormLabel>Marital Status *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select marital status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />

                <FormField control={form.control} name="centerId" render={({ field }) => (
                    <FormItem><FormLabel>Center *</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue('clusterId', undefined); form.setValue('smallGroupId', undefined); }} value={field.value || undefined} disabled={isLoadingData || disableCenterSelection}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isLoadingData ? "Loading..." : "Select Center"} /></SelectTrigger></FormControl>
                        <SelectContent>{centers.map(c => (<SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>))}</SelectContent>
                        </Select>{disableCenterSelection && <FormDescription>Center pre-selected.</FormDescription>}<FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="clusterId" render={({ field }) => (
                    <FormItem><FormLabel>Cluster</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue('smallGroupId', undefined);}} value={field.value || undefined} disabled={isLoadingData || !watchedCenterId || filteredClusters.length === 0 || disableClusterSelection }>
                        <FormControl><SelectTrigger><SelectValue placeholder={!watchedCenterId ? "Select Center first" : (isLoadingData ? "Loading..." : (filteredClusters.length > 0 ? "Select Cluster" : "No clusters in center"))} /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value={NONE_VALUE}>None</SelectItem>{filteredClusters.map(c => (<SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>))}</SelectContent>
                        </Select>{disableClusterSelection && <FormDescription>Cluster pre-selected.</FormDescription>}<FormMessage /></FormItem>
                )}/>
                
                <div className="md:col-span-2"><h3 className="text-lg font-medium mb-4 pt-4">Address Information *</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="addressStreet" render={({ field }) => (<FormItem><FormLabel>Street *</FormLabel><FormControl><Input placeholder="Street" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="addressCity" render={({ field }) => (<FormItem><FormLabel>City *</FormLabel><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="addressState" render={({ field }) => (<FormItem><FormLabel>State/Province *</FormLabel><FormControl><Input placeholder="State/Province" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="addressCountry" render={({ field }) => (<FormItem><FormLabel>Country *</FormLabel><FormControl><Input placeholder="Country" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="addressPostalCode" render={({ field }) => (<FormItem><FormLabel>Postal/ZIP Code</FormLabel><FormControl><Input placeholder="Postal/ZIP (optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div></div>
                
                <FormField control={form.control} name="smallGroupId" render={({ field }) => (<FormItem><FormLabel>Small Group</FormLabel><Select onValueChange={field.onChange} value={field.value || undefined} disabled={isLoadingData || !watchedClusterId || filteredSmallGroups.length === 0}><FormControl><SelectTrigger><SelectValue placeholder={!watchedClusterId ? "Select Cluster first" : (isLoadingData ? "Loading..." : (filteredSmallGroups.length > 0 ? "Select Small Group" : "No small groups in cluster"))} /></SelectTrigger></FormControl><SelectContent><SelectItem value={NONE_VALUE}>None</SelectItem>{filteredSmallGroups.map((group) => (<SelectItem key={group._id} value={group._id}>{group.name}</SelectItem>))}</SelectContent></Select><FormDescription>Optional</FormDescription><FormMessage /></FormItem>)} />
                
                <div className="md:col-span-2"><FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Additional notes (optional)" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
              </div>
              <div className="flex justify-end"><Button type="submit" disabled={isSubmitting || isLoadingData || !canCreateInContext}>{isSubmitting ? "Adding..." : <><Save className="mr-2 h-4 w-4" /> Add Member</>}</Button></div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}