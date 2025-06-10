"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/lib/client/components/ui/button';
import { Input } from '@/lib/client/components/ui/input';
import { Textarea } from '@/lib/client/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/client/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/lib/client/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/lib/client/components/ui/card';
import { useToast } from '@/lib/client/components/ui/use-toast';
import { ArrowLeft, PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { checkPermission } from '@/lib/permissions';
import { ICenter } from '@/models/center';
import { ICluster } from '@/models/cluster'; // For Cluster type

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Start date is required" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "End date is required" }),
  location: z.string().min(1, "Location is required"),
  scope: z.enum(["GLOBAL", "CENTER", "CLUSTER"]).default("GLOBAL"), // Added CLUSTER scope
  centerId: z.string().optional(),
  clusterId: z.string().optional(), // Added clusterId
}).refine(data => data.scope === "CENTER" ? !!data.centerId : true, {
  message: "Center is required for Center-scoped events",
  path: ["centerId"],
}).refine(data => data.scope === "CLUSTER" ? !!data.clusterId : true, {
  message: "Cluster is required for Cluster-scoped events",
  path: ["clusterId"],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface CenterOption { _id: string; name: string; }
interface ClusterOption { _id: string; name: string; centerId: string | { _id: string }; }


export default function NewEventPage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const preselectedCenterId = searchParamsHook.get("centerId");
  const preselectedClusterId = searchParamsHook.get("clusterId");
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [clusters, setClusters] = useState<ClusterOption[]>([]);
  const [filteredClusters, setFilteredClusters] = useState<ClusterOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [canCreateEvent, setCanCreateEvent] = useState(false);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);

  const defaultScope = preselectedClusterId ? "CLUSTER" : preselectedCenterId ? "CENTER" : "GLOBAL";

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "", description: "", eventType: "", location: "",
      scope: defaultScope,
      centerId: preselectedCenterId || undefined,
      clusterId: preselectedClusterId || undefined,
    },
  });

  const currentScope = form.watch("scope");
  const currentCenterId = form.watch("centerId");

  useEffect(() => {
    const checkPermsAndFetchData = async () => {
      if (user) {
        setIsFetchingData(true);
        const globalAdmin = await checkPermission(user, "GLOBAL_ADMIN");
        setIsGlobalAdmin(globalAdmin);
        let hasCreatePerm = globalAdmin;

        if (preselectedClusterId) {
            // Need cluster's centerId for this check
            // This logic assumes CLUSTER_LEADER or CENTER_ADMIN of parent center can create cluster events
            // This might require fetching cluster details first if not available
            const clusterAdminForSelected = await checkPermission(user, "CLUSTER_LEADER", { clusterId: preselectedClusterId });
            // Potentially add CENTER_ADMIN check for cluster's parent center
            if (clusterAdminForSelected) hasCreatePerm = true;
        } else if (preselectedCenterId) {
          const centerAdminForSelected = await checkPermission(user, "CENTER_ADMIN", { centerId: preselectedCenterId });
          if (centerAdminForSelected) hasCreatePerm = true;
        } else if (!globalAdmin) {
          hasCreatePerm = await checkPermission(user, "CENTER_ADMIN"); // Can create if admin of *any* center (for GLOBAL or choosing center)
        }

        setCanCreateEvent(hasCreatePerm);
        if (!hasCreatePerm) {
          toast({ title: "Access Denied", description: "You don't have permission to create events.", variant: "destructive" });
          router.back(); // Go back if no permission
          return;
        }

        try {
          // Fetch Centers
          const centersResponse = await apiClient.get<{ centers: CenterOption[] }>("/centers");
          let availableCenters = centersResponse.centers || [];
          if(!globalAdmin) {
            const userCenterIds = user.assignedRoles?.filter(r => r.role === "CENTER_ADMIN" && r.centerId).map(r => r.centerId!);
            availableCenters = availableCenters.filter(c => userCenterIds?.includes(c._id));
          }
          setCenters(availableCenters);
          if (preselectedCenterId && availableCenters.find(c => c._id === preselectedCenterId)) {
            form.setValue('centerId', preselectedCenterId);
            if(!preselectedClusterId) form.setValue('scope', 'CENTER');
          } else if (preselectedCenterId && !globalAdmin) { // Preselected center but not allowed
             toast({ title: "Access Denied", description: "You cannot create events for the specified center.", variant: "destructive" });
             router.back(); return;
          }

          // Fetch Clusters
          const clustersResponse = await apiClient.get<{ clusters: ClusterOption[] }>("/clusters");
          setClusters(clustersResponse.clusters || []);
          if (preselectedClusterId) { // If cluster is preselected, ensure center is also set
            const cluster = (clustersResponse.clusters || []).find(c => c._id === preselectedClusterId);
            if (cluster) {
                const clusterCenter = typeof cluster.centerId === 'string' ? cluster.centerId : cluster.centerId?._id;
                if(clusterCenter){
                    form.setValue('centerId', clusterCenter);
                    form.setValue('scope', 'CLUSTER');
                    form.setValue('clusterId', preselectedClusterId);
                }
            } else if (!globalAdmin) {
                toast({ title: "Access Denied", description: "Invalid preselected cluster.", variant: "destructive" });
                router.back(); return;
            }
          }


        } catch (error) {
          toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" });
        } finally {
          setIsFetchingData(false);
        }
      }
    };
    checkPermsAndFetchData();
  }, [user, toast, router, preselectedCenterId, preselectedClusterId, form]);

  useEffect(() => {
    if (currentScope === "GLOBAL") {
      form.setValue("centerId", undefined);
      form.setValue("clusterId", undefined);
    } else if (currentScope === "CENTER") {
      form.setValue("clusterId", undefined);
    }
  }, [currentScope, form]);

  useEffect(() => {
    if (currentCenterId && currentCenterId !== "none") {
      setFilteredClusters(clusters.filter(c => (typeof c.centerId === 'string' ? c.centerId : c.centerId?._id) === currentCenterId));
    } else {
      setFilteredClusters([]);
    }
    // if currentCenterId changes and selected cluster not in new list, reset it
    if (!clusters.filter(c => (typeof c.centerId === 'string' ? c.centerId : c.centerId?._id) === currentCenterId).find(fc => fc._id === form.getValues('clusterId'))) {
        if(form.formState.dirtyFields.centerId || (preselectedCenterId && currentCenterId !== preselectedCenterId)) { // only reset if changed by user or initial load of different center
            form.setValue('clusterId', undefined);
        }
    }
  }, [currentCenterId, clusters, form, preselectedCenterId]);


  async function onSubmit(values: EventFormValues) {
    setIsLoading(true);
    try {
      const payload = { ...values };
      if (payload.scope === "GLOBAL") {
        delete payload.centerId;
        delete payload.clusterId;
      } else if (payload.scope === "CENTER") {
        delete payload.clusterId;
        if(!payload.centerId && preselectedCenterId) payload.centerId = preselectedCenterId; // Ensure centerId is set if scope is CENTER
      } else if (payload.scope === "CLUSTER") {
        if(!payload.clusterId && preselectedClusterId) payload.clusterId = preselectedClusterId;
        // Ensure clusterId implies centerId from the selected cluster. API should handle this derivation.
        if(!payload.centerId && preselectedCenterId) payload.centerId = preselectedCenterId;
        else if (!payload.centerId && payload.clusterId) { // If center not set, find from cluster
            const cluster = clusters.find(c=>c._id === payload.clusterId);
            if(cluster) payload.centerId = (typeof cluster.centerId === 'string' ? cluster.centerId : cluster.centerId?._id);
        }
      }

      await apiClient.post('/events', payload);
      toast({ title: "Success", description: "Event created successfully." });
      if (preselectedClusterId) router.push(`/clusters/${preselectedClusterId}/dashboard/events`);
      else if (preselectedCenterId) router.push(`/centers/${preselectedCenterId}/dashboard/events`);
      else router.push("/dashboard/events");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create event.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user || (!canCreateEvent && !isLoading && !isFetchingData) ) {
    return <div className="container mx-auto py-6 text-center"><p>Loading or Access Denied.</p></div>;
  }

  const disableScopeChange = !!preselectedClusterId || !!preselectedCenterId;
  const disableCenterChange = !!preselectedCenterId && !isGlobalAdmin || !!preselectedClusterId; // Also disable if cluster preselected
  const disableClusterChange = !!preselectedClusterId && !isGlobalAdmin; // And not center admin of parent? More complex.

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6"><Button variant="outline" size="icon" onClick={() => router.back()} className="mr-2"><ArrowLeft className="h-4 w-4" /></Button><h1 className="text-3xl font-bold tracking-tight">Create New Event</h1></div>
      <Card>
        <CardHeader><CardTitle>Event Details</CardTitle><CardDescription>Fill in the information for the new event.</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Event title" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="eventType" render={({ field }) => (<FormItem><FormLabel>Event Type *</FormLabel><FormControl><Input placeholder="e.g., Sunday Service, Workshop" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem><FormLabel>Start Date & Time *</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem><FormLabel>End Date & Time *</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location *</FormLabel><FormControl><Input placeholder="Event location or address" {...field} /></FormControl><FormMessage /></FormItem>)} />

                {(isGlobalAdmin || (!preselectedCenterId && !preselectedClusterId)) && (
                  <FormField control={form.control} name="scope" render={({ field }) => (
                    <FormItem><FormLabel>Scope *</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={disableScopeChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="GLOBAL">Global (All Centers)</SelectItem>
                          <SelectItem value="CENTER">Center-Specific</SelectItem>
                          <SelectItem value="CLUSTER">Cluster-Specific</SelectItem>
                        </SelectContent>
                      </Select>
                      {disableScopeChange && <FormDescription>Scope pre-determined by context.</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}

                {(currentScope === "CENTER" || currentScope === "CLUSTER") && (
                  <FormField control={form.control} name="centerId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Center *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingData || disableCenterChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isFetchingData ? "Loading..." : "Select center"} /></SelectTrigger></FormControl>
                        <SelectContent>{centers.map(center => (<SelectItem key={center._id} value={center._id}>{center.name}</SelectItem>))}</SelectContent>
                      </Select>
                      {disableCenterChange && <FormDescription>Center pre-selected or implied by cluster.</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}
                 {currentScope === "CLUSTER" && (
                  <FormField control={form.control} name="clusterId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cluster *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingData || disableClusterChange || !currentCenterId || currentCenterId === "none" || filteredClusters.length === 0}>
                        <FormControl><SelectTrigger><SelectValue placeholder={!currentCenterId || currentCenterId === "none" ? "Select Center first" : (isFetchingData ? "Loading..." : (filteredClusters.length > 0 ? "Select Cluster" : "No clusters in center"))} /></SelectTrigger></FormControl>
                        <SelectContent>{filteredClusters.map(cluster => (<SelectItem key={cluster._id} value={cluster._id}>{cluster.name}</SelectItem>))}</SelectContent>
                      </Select>
                      {disableClusterChange && <FormDescription>Cluster pre-selected.</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}
                 <div className="md:col-span-2">
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed event description" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isLoading || isFetchingData || !canCreateEvent}>
                  {isLoading ? "Creating..." : <><PlusCircle className="mr-2 h-4 w-4" /> Create Event</>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
