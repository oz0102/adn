"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Trash2, AlertTriangleIcon, Save, UserPlus } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { checkPermission } from '@/lib/permissions';
import { IAttendee } from '@/models/attendee';

// --- AttendeeEditForm Schema and Types (Copied from conceptual edit/page.tsx) ---
const attendeeEditFormSchema = z.object({
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

type AttendeeEditFormValues = z.infer<typeof attendeeEditFormSchema>;

interface Center { _id: string; name: string; }
interface Cluster { _id: string; name: string; centerId?: { _id: string; name: string } | string; }

interface AttendeeDetails extends IAttendee {
  centerId?: { _id: string; name: string; } | null;
  clusterId?: { _id: string; name: string; } | null; // Added for consistency if populated
  createdBy?: { _id: string; email: string; } | null;
  updatedBy?: { _id: string; email: string; } | null;
}
// --- End of AttendeeEditForm Schema and Types ---


// --- AttendeeEditForm Component (Copied from conceptual edit/page.tsx) ---
interface AttendeeEditFormProps {
  attendee: AttendeeDetails;
  onFormSubmit: (values: AttendeeEditFormValues) => Promise<void>;
  onCancel: () => void;
  isUpdating: boolean; // Changed from isLoading to isUpdating for clarity
  centers: Center[];
  clusters: Cluster[];
  canChangeCenterGlobal: boolean; // If user is Global Admin
}

function AttendeeEditForm({
  attendee,
  onFormSubmit,
  onCancel,
  isUpdating,
  centers,
  clusters,
  canChangeCenterGlobal
}: AttendeeEditFormProps) {
  const form = useForm<AttendeeEditFormValues>({
    resolver: zodResolver(attendeeEditFormSchema),
    defaultValues: {
      firstName: attendee.firstName || "",
      lastName: attendee.lastName || "",
      email: attendee.email || "",
      phoneNumber: attendee.phoneNumber || "",
      whatsappNumber: attendee.whatsappNumber || "",
      address_street: attendee.address_street || "",
      address_city: attendee.address_city || "",
      address_state: attendee.address_state || "",
      address_country: attendee.address_country || "",
      address_postalCode: attendee.address_postalCode || "",
      centerId: typeof attendee.centerId === 'object' ? attendee.centerId?._id : attendee.centerId?.toString() || "",
      clusterId: typeof attendee.clusterId === 'object' ? (attendee.clusterId as any)?._id?.toString() : attendee.clusterId?.toString() || "",
      level: attendee.level || 'First-Timer',
      tags: attendee.tags?.join(', ') || "",
      notes: attendee.notes || "",
      firstAttendanceDate: attendee.firstAttendanceDate ? new Date(attendee.firstAttendanceDate) : undefined,
    },
  });

  const selectedCenterId = form.watch("centerId");
  const [filteredClusters, setFilteredClusters] = useState<Cluster[]>([]);

  useEffect(() => {
    if (selectedCenterId) {
      setFilteredClusters(clusters.filter(c => {
        const cCenterId = typeof c.centerId === 'object' ? c.centerId?._id : c.centerId;
        return cCenterId === selectedCenterId;
      }));
    } else {
      setFilteredClusters([]);
    }
    if (selectedCenterId !== (typeof attendee.centerId === 'object' ? attendee.centerId?._id : attendee.centerId?.toString())) {
      form.setValue("clusterId", "");
    }
  }, [selectedCenterId, clusters, form, attendee.centerId]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Attendee Information</CardTitle>
            <CardDescription>Update the details for {attendee.firstName} {attendee.lastName}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number *</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="whatsappNumber" render={({ field }) => (<FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="centerId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Center *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!canChangeCenterGlobal}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a center" /></SelectTrigger></FormControl>
                      <SelectContent>{centers.map(center => (<SelectItem key={center._id} value={center._id}>{center.name}</SelectItem>))}</SelectContent>
                    </Select>
                    {!canChangeCenterGlobal && <FormDescription>Center cannot be changed by your current role.</FormDescription>}
                    <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="clusterId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cluster</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""} disabled={!selectedCenterId || filteredClusters.length === 0}>
                      <FormControl><SelectTrigger><SelectValue placeholder={selectedCenterId ? (filteredClusters.length > 0 ? "Select a cluster" : "No clusters for this center") : "Select a center first"} /></SelectTrigger></FormControl>
                      <SelectContent>{filteredClusters.map(cluster => (<SelectItem key={cluster._id} value={cluster._id}>{cluster.name}</SelectItem>))}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="level" render={({ field }) => (
                  <FormItem><FormLabel>Level *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select attendee level" /></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="First-Timer">First-Timer</SelectItem>
                        <SelectItem value="Occasional Attendee">Occasional Attendee</SelectItem>
                        <SelectItem value="Regular Attendee">Regular Attendee</SelectItem>
                      </SelectContent></Select><FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="firstAttendanceDate" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>First Attendance Date</FormLabel><FormControl>
                      <Input type="date" value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}/>
                    </FormControl><FormMessage /></FormItem>
              )}/>
            </div>
            <div className="space-y-2 pt-4">
              <h3 className="text-lg font-medium">Address (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="address_street" render={({ field }) => (<FormItem><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address_city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address_state" render={({ field }) => (<FormItem><FormLabel>State / Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address_country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address_postalCode" render={({ field }) => (<FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </div>
            <FormField control={form.control} name="tags" render={({ field }) => (<FormItem><FormLabel>Tags</FormLabel><FormControl><Input placeholder="Comma-separated (e.g., visitor, new_believer)" {...field} /></FormControl><FormDescription>Comma-separated list of tags.</FormDescription><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </CardContent>
          <CardFooter className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isUpdating}>Cancel</Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
// --- End of AttendeeEditForm Component ---


export default function AttendeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const attendeeId = params.attendeeId as string;
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [attendee, setAttendee] = useState<AttendeeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // For form submission
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [canEditAttendee, setCanEditAttendee] = useState(false);
  const [canDeleteAttendee, setCanDeleteAttendee] = useState(false);
  const [canChangeCenterGlobal, setCanChangeCenterGlobal] = useState(false);


  const [centers, setCenters] = useState<Center[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);

  const fetchAttendeeDetails = useCallback(async () => {
    if (attendeeId) {
      setIsLoading(true);
      try {
        const data = await apiClient.get<{ attendee: AttendeeDetails }>(`/attendees/${attendeeId}`);
        setAttendee(data.attendee);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch attendee details:", err);
        setError(err.message || "Failed to load attendee details.");
        toast({ title: "Error", description: err.message || "Failed to load attendee details.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  }, [attendeeId, toast]);

  useEffect(() => {
    fetchAttendeeDetails();
  }, [fetchAttendeeDetails]);

  useEffect(() => {
    const checkPermissions = async () => {
      if (user && attendee) {
        const isGlobalAdmin = await checkPermission(user, "GLOBAL_ADMIN");
        setCanChangeCenterGlobal(isGlobalAdmin);
        const isCenterAdmin = attendee.centerId ? await checkPermission(user, "CENTER_ADMIN", { centerId: typeof attendee.centerId === 'object' ? attendee.centerId._id : attendee.centerId }) : false;

        setCanEditAttendee(isGlobalAdmin || isCenterAdmin);
        setCanDeleteAttendee(isGlobalAdmin || isCenterAdmin);
      }
    };
    if(user && attendee) checkPermissions();
  }, [user, attendee]);

  useEffect(() => {
    // Fetch centers and clusters if in edit mode or if needed for display
    if (isEditMode && canEditAttendee) {
      const fetchDataForEdit = async () => {
        try {
          const centersResponse = await apiClient.get<{ centers: Center[] }>('/centers');
          // TODO: Filter centers based on user permissions if not GLOBAL_ADMIN
          setCenters(centersResponse.centers || []);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load centers for editing.", variant: "destructive" });
        }
        try {
          const clustersResponse = await apiClient.get<{ clusters: Cluster[] }>('/clusters');
          setClusters(clustersResponse.clusters || []);
        } catch (error) {
          toast({ title: "Error", description: "Failed to load clusters for editing.", variant: "destructive" });
        }
      };
      fetchDataForEdit();
    }
  }, [isEditMode, canEditAttendee, toast]);


  const handleEditFormSubmit = async (values: AttendeeEditFormValues) => {
    if (!attendee) return;
    setIsUpdating(true);
    try {
      const payload = {
        ...values,
        tags: values.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
      };
      const response = await apiClient.put<{ attendee: AttendeeDetails }>(`/attendees/${attendee._id}`, payload);
      setAttendee(response.attendee); // Update local state with response
      toast({ title: "Success", description: "Attendee updated successfully." });
      setIsEditMode(false); // Exit edit mode
    } catch (error: any) {
      console.error("Failed to update attendee:", error);
      toast({ title: "Error", description: error.message || "Failed to update attendee.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!attendee || !canDeleteAttendee) return;
    if (confirm('Are you sure you want to delete this attendee? This action cannot be undone.')) {
      try {
        await apiClient.delete(`/attendees/${attendee._id}`);
        toast({ title: "Success", description: "Attendee deleted successfully." });
        router.push('/dashboard/attendees');
      } catch (err: any) {
        console.error("Failed to delete attendee:", err);
        toast({ title: "Error", description: err.message || "Failed to delete attendee.", variant: "destructive" });
      }
    }
  };

  if (isLoading) return <div className="container mx-auto py-6 text-center">Loading attendee details...</div>;
  if (error) return (
    <div className="container mx-auto py-10 text-center">
      <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2 text-destructive">Error Loading Attendee</h2>
      <p className="text-muted-foreground">{error}</p>
      <Button onClick={() => router.back()} variant="outline" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
    </div>
  );
  if (!attendee) return <div className="container mx-auto py-6 text-center">Attendee not found.</div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {!isEditMode ? (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/attendees')} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{attendee.firstName} {attendee.lastName}</h1>
            </div>
            <div className="flex gap-2">
              {canEditAttendee && (
                <Button variant="outline" onClick={() => setIsEditMode(true)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
              )}
              {canDeleteAttendee && (
                <Button variant="destructive" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
              )}
            </div>
          </div>
          <Card>
            <CardHeader><CardTitle>Attendee Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Email:</span> {attendee.email || 'N/A'}</div>
                <div><span className="font-medium">Phone:</span> {attendee.phoneNumber}</div>
                <div><span className="font-medium">WhatsApp:</span> {attendee.whatsappNumber || 'N/A'}</div>
                <div><span className="font-medium">Level:</span> {attendee.level}</div>
                <div><span className="font-medium">Center:</span> {attendee.centerId?.name || 'N/A'}</div>
                {attendee.clusterId && <div><span className="font-medium">Cluster:</span> {(attendee.clusterId as any)?.name || attendee.clusterId.toString()}</div>}
                <div><span className="font-medium">First Attendance:</span> {new Date(attendee.firstAttendanceDate).toLocaleDateString()}</div>
                <div><span className="font-medium">Last Attendance:</span> {new Date(attendee.lastAttendanceDate).toLocaleDateString()}</div>
                <div><span className="font-medium">Attendance Count:</span> {attendee.attendanceCount}</div>
                <div><span className="font-medium">Address:</span>
                  {`${attendee.address_street || ''} ${attendee.address_city || ''} ${attendee.address_state || ''} ${attendee.address_country || ''} ${attendee.address_postalCode || ''}`.trim() || 'N/A'}
                </div>
                <div><span className="font-medium">Tags:</span> {attendee.tags && attendee.tags.length > 0 ? attendee.tags.join(', ') : 'N/A'}</div>
                <div className="md:col-span-2"><span className="font-medium">Notes:</span> {attendee.notes || 'N/A'}</div>
                <div className="md:col-span-2 text-sm text-muted-foreground">
                  Created By: {attendee.createdBy?.email || 'Unknown'} on {new Date(attendee.createdAt).toLocaleDateString()}<br />
                  Last Updated By: {attendee.updatedBy?.email || 'Unknown'} on {new Date(attendee.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // Edit Mode - Render Form
        <>
         <div className="flex items-center mb-6">
            <Button variant="outline" size="icon" onClick={() => setIsEditMode(false)} className="mr-2">
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Attendee</h1>
        </div>
        <AttendeeEditForm
          attendee={attendee}
          onFormSubmit={handleEditFormSubmit}
          onCancel={() => setIsEditMode(false)}
          isUpdating={isUpdating}
          centers={centers}
          clusters={clusters}
          canChangeCenterGlobal={canChangeCenterGlobal}
        />
        </>
      )}
    </div>
  );
}
