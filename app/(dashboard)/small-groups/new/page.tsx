"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { ArrowLeft, PlusCircle, Users } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { checkPermission } from '@/lib/permissions';
// import { ICenter } from '@/models/center'; // Not directly used, centerId is string
// import { ICluster } from '@/models/cluster';
import { IMember } from '@/models/member';


const smallGroupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  centerId: z.string().min(1, "Center association is required."),
  clusterId: z.string().min(1, "Cluster is required."),
  leaderId: z.string().optional(),
  meetingDay: z.string().optional(),
  meetingTime: z.string().optional(),
  meetingFrequency: z.string().optional(),
  location: z.string().optional(),
});

type SmallGroupFormValues = z.infer<typeof smallGroupFormSchema>;

interface CenterOption { _id: string; name: string; }
interface ClusterOption { _id: string; name: string; centerId: string | { _id: string }; }
interface MemberOption { _id: string; firstName: string; lastName: string; centerId?: string; clusterId?: string;}


export default function NewSmallGroupPage() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const preselectedCenterId = searchParamsHook.get("centerId");
  const preselectedClusterId = searchParamsHook.get("clusterId");

  const { toast } = useToast();
  const { user } = useAuthStore();

  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [allClusters, setAllClusters] = useState<ClusterOption[]>([]); // All clusters fetched
  const [filteredClusters, setFilteredClusters] = useState<ClusterOption[]>([]); // Clusters for selected center
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberOption[]>([]);


  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [canCreateGroup, setCanCreateGroup] = useState(false);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [userAssignedCenterIds, setUserAssignedCenterIds] = useState<string[]>([]);
  const [userAssignedClusterIds, setUserAssignedClusterIds] = useState<string[]>([]);


  const form = useForm<SmallGroupFormValues>({
    resolver: zodResolver(smallGroupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      centerId: preselectedCenterId || undefined,
      clusterId: preselectedClusterId || undefined,
      leaderId: "none",
    },
  });

  const watchedCenterId = form.watch("centerId");
  const watchedClusterId = form.watch("clusterId");

  useEffect(() => {
    const determinePermissionsAndFetchData = async () => {
      if (user) {
        setIsFetchingData(true);
        const globalAdmin = await checkPermission(user, "GLOBAL_ADMIN");
        setIsGlobalAdmin(globalAdmin);

        const centerAdminRoles = user.assignedRoles?.filter(r => r.role === "CENTER_ADMIN" && r.centerId).map(r => r.centerId!) || [];
        setUserAssignedCenterIds(centerAdminRoles);
        const clusterLeaderRoles = user.assignedRoles?.filter(r => r.role === "CLUSTER_LEADER" && r.clusterId).map(r => r.clusterId!) || [];
        setUserAssignedClusterIds(clusterLeaderRoles);

        let hasCreatePerm = globalAdmin;
        if (!hasCreatePerm) {
            if (preselectedClusterId) { // If creating for a specific cluster
                const clusterLeaderForSelected = clusterLeaderRoles.includes(preselectedClusterId);
                // Also need to check if this cluster belongs to a center the user is admin of
                // This requires fetching cluster data first, or having centerId in assignedRole for cluster leader
                const clusterDetails = allClusters.find(c => c._id === preselectedClusterId); // Use allClusters if already fetched
                const parentCenterId = clusterDetails ? (typeof clusterDetails.centerId === 'string' ? clusterDetails.centerId : clusterDetails.centerId?._id) : null;
                const centerAdminForParent = parentCenterId ? centerAdminRoles.includes(parentCenterId) : false;
                if (clusterLeaderForSelected || centerAdminForParent) hasCreatePerm = true;

            } else if (preselectedCenterId) { // If creating for a specific center (but not specific cluster)
                if (centerAdminRoles.includes(preselectedCenterId)) hasCreatePerm = true;
            } else { // No preselection, user must be able to select a center/cluster they manage
                if (centerAdminRoles.length > 0 || clusterLeaderRoles.length > 0) hasCreatePerm = true;
            }
        }

        setCanCreateGroup(hasCreatePerm);
        if (!hasCreatePerm) {
          toast({ title: "Access Denied", description: "You don't have permission to create small groups here.", variant: "destructive" });
          router.back(); // Go back
          setIsFetchingData(false);
          return;
        }

        try {
          // Fetch Centers
          const centersRes = await apiClient.get<{ centers: CenterOption[] }>("/centers");
          let availableCenters = centersRes.centers || [];
          if(!globalAdmin){
            availableCenters = availableCenters.filter(c => userAssignedCenterIds.includes(c._id));
          }
          setCenters(availableCenters);
          if (preselectedCenterId && availableCenters.find(c => c._id === preselectedCenterId)) {
            form.setValue('centerId', preselectedCenterId);
          } else if (availableCenters.length === 1 && !preselectedCenterId && !globalAdmin) {
            form.setValue('centerId', availableCenters[0]._id);
          } else if (preselectedCenterId && !globalAdmin && !availableCenters.find(c => c._id === preselectedCenterId)){
            // Preselected center is not one they manage
            toast({ title: "Access Denied", description: "You cannot create groups for the specified center.", variant: "destructive" });
            router.back(); return;
          }


          // Fetch All Clusters initially
          const clustersRes = await apiClient.get<{ clusters: ClusterOption[] }>("/clusters");
          setAllClusters(clustersRes.clusters || []);

          // Fetch members for leader selection
          // TODO: Ideally, filter members based on selected center/cluster later
          const membersRes = await apiClient.get<{ data?: { members: MemberOption[] }, members?: MemberOption[] } }>("/members?limit=1000");
          setMembers(membersRes.data?.members || membersRes.members || []);
          setFilteredMembers(membersRes.data?.members || membersRes.members || []);


        } catch (error) {
          toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" });
        } finally {
          setIsFetchingData(false);
        }
      }
    };
    determinePermissionsAndFetchData();
  }, [user, toast, router, preselectedCenterId, preselectedClusterId]); // form removed from dep

 useEffect(() => {
    if (watchedCenterId && watchedCenterId !== "none") {
      let clustersForCenter = allClusters.filter(c => (typeof c.centerId === 'string' ? c.centerId : c.centerId?._id) === watchedCenterId);
      if(!isGlobalAdmin && !userAssignedCenterIds.includes(watchedCenterId)){ // If not GA, ensure selected center is one they manage
        clustersForCenter = []; // Should not happen if centers dropdown is correctly filtered
      } else if (!isGlobalAdmin && userAssignedCenterIds.includes(watchedCenterId) && userAssignedClusterIds.length > 0) {
        // If Center Admin who is also Cluster Leader of some clusters, further filter to only those clusters
        // This logic might be too complex or specific. Simpler: CA sees all clusters in their center.
        // clustersForCenter = clustersForCenter.filter(c => userAssignedClusterIds.includes(c._id));
      }
      setFilteredClusters(clustersForCenter);

      if (!clustersForCenter.find(fc => fc._id === form.getValues('clusterId'))) {
        if(form.formState.dirtyFields.centerId || (preselectedCenterId && watchedCenterId !== preselectedCenterId) || !preselectedClusterId ) {
            form.setValue('clusterId', undefined);
        } else if (preselectedClusterId && clustersForCenter.find(fc => fc._id === preselectedClusterId)) {
            form.setValue('clusterId', preselectedClusterId); // Re-set if it was valid for this center
        }
      }
    } else {
      setFilteredClusters(isGlobalAdmin ? allClusters : []); // GA sees all if no center, others see none
      form.setValue('clusterId', undefined);
    }
  }, [watchedCenterId, allClusters, form, isGlobalAdmin, userAssignedCenterIds, preselectedCenterId, preselectedClusterId]);

  useEffect(() => {
    // Filter members based on selected cluster or center
    if (watchedClusterId && watchedClusterId !== "none") {
        setFilteredMembers(members.filter(m => (m as any).clusterId === watchedClusterId || (m as any).cluster?._id === watchedClusterId));
    } else if (watchedCenterId && watchedCenterId !== "none") {
        setFilteredMembers(members.filter(m => (m as any).centerId === watchedCenterId || (m as any).center?._id === watchedCenterId));
    } else if (isGlobalAdmin) {
        setFilteredMembers(members);
    } else {
        setFilteredMembers([]); // Non-GA should select center/cluster to see members
    }
  }, [watchedClusterId, watchedCenterId, members, isGlobalAdmin]);


  async function onSubmit(values: SmallGroupFormValues) {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        leaderId: values.leaderId === "none" || values.leaderId === "" ? undefined : values.leaderId,
        centerId: values.centerId, // Ensure centerId is part of payload. API might derive from cluster too.
      };

      await apiClient.post('/small-groups', payload);
      toast({ title: "Success", description: "Small Group created successfully." });
      // Redirect based on context
      if (preselectedClusterId) router.push(`/clusters/${preselectedClusterId}/dashboard/small-groups`);
      else if (preselectedCenterId) router.push(`/centers/${preselectedCenterId}/dashboard/small-groups`);
      else router.push("/dashboard/small-groups");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create small group.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user || (!canCreateGroup && !isFetchingData)) {
    return <div className="container mx-auto py-6 text-center"><p>Loading or Access Denied.</p></div>;
  }

  const disableCenterSelection = !!preselectedCenterId && !isGlobalAdmin;
  const disableClusterSelection = !!preselectedClusterId && !isGlobalAdmin &&
                                 (!userAssignedCenterIds.includes(watchedCenterId || "") || !userAssignedClusterIds.includes(preselectedClusterId));


  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center mb-6"><Button variant="outline" size="icon" onClick={() => router.back()} className="mr-2"><ArrowLeft className="h-4 w-4" /></Button><h1 className="text-3xl font-bold tracking-tight">Create New Small Group</h1></div>
      <Card>
        <CardHeader><CardTitle>Small Group Details</CardTitle><CardDescription>Fill in the information for the new small group.</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="Small group name" {...field} /></FormControl><FormMessage /></FormItem>)} />

                <FormField control={form.control} name="centerId" render={({ field }) => (
                    <FormItem><FormLabel>Center *</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); form.setValue('clusterId', undefined); }} value={field.value} disabled={isFetchingData || disableCenterSelection}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isFetchingData ? "Loading..." : "Select Center"} /></SelectTrigger></FormControl>
                        <SelectContent>{centers.map(c => (<SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>))}</SelectContent>
                        </Select>
                        {disableCenterSelection && <FormDescription>Center pre-selected.</FormDescription>}
                    <FormMessage /></FormItem>
                )}/>

                <FormField control={form.control} name="clusterId" render={({ field }) => (
                    <FormItem><FormLabel>Cluster *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingData || !watchedCenterId || watchedCenterId === "none" || filteredClusters.length === 0 || disableClusterSelection}>
                        <FormControl><SelectTrigger><SelectValue placeholder={!watchedCenterId || watchedCenterId === "none" ? "Select Center first" : (isFetchingData ? "Loading..." : (filteredClusters.length > 0 ? "Select Cluster" : "No clusters in center"))} /></SelectTrigger></FormControl>
                        <SelectContent>{filteredClusters.map(c => (<SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>))}</SelectContent>
                        </Select>
                        {disableClusterSelection && <FormDescription>Cluster pre-selected.</FormDescription>}
                    <FormMessage /></FormItem>
                )}/>

                <FormField control={form.control} name="leaderId" render={({ field }) => (
                    <FormItem><FormLabel>Leader (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder={isFetchingData ? "Loading members..." : "Select leader"} /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="none">None</SelectItem>{filteredMembers.map(m => (<SelectItem key={m._id} value={m._id}>{m.firstName} {m.lastName}</SelectItem>))}</SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                )}/>

                <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location (Optional)</FormLabel><FormControl><Input placeholder="e.g., Online, John's House" {...field} /></FormControl><FormMessage /></FormItem>)} />

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="meetingDay" render={({ field }) => (<FormItem><FormLabel>Meeting Day</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger></FormControl><SelectContent>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                        </SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="meetingTime" render={({ field }) => (<FormItem><FormLabel>Meeting Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="meetingFrequency" render={({ field }) => (<FormItem><FormLabel>Frequency</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Bi-Weekly">Bi-Weekly</SelectItem><SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent></Select><FormMessage /></FormItem>)} />
                </div>

                <div className="md:col-span-2">
                    <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Brief description of the small group" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isLoading || isFetchingData || !canCreateGroup}>
                  {isLoading ? "Creating..." : <><PlusCircle className="mr-2 h-4 w-4" /> Create Small Group</>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
