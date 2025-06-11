"use client"; // To be consistent, though this will be merged conceptually into [attendeeId]/page.tsx

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { ArrowLeft, UserPlus, Save } from 'lucide-react'; // Added Save icon
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { checkPermission } from '@/lib/permissions';
import { IAttendee } from '@/models/attendee'; // Import Attendee model type

// Define Zod schema for validation (same as new page, but all fields optional for PUT)
// For PUT, we might only send changed fields, but client-side validation can still use a similar schema.
// However, for strict updates, the schema should reflect only what can be updated.
// For simplicity, using a similar schema, but required fields should be pre-filled.
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
  centerId: z.string().min(1, "Center is required"), // Center might be non-editable for some roles
  clusterId: z.string().optional(),
  level: z.enum(['First-Timer', 'Occasional Attendee', 'Regular Attendee']).default('First-Timer'),
  tags: z.string().optional(),
  notes: z.string().optional(),
  firstAttendanceDate: z.date().optional(),
  // Fields like lastAttendanceDate, attendanceCount are typically system-managed
});

type AttendeeEditFormValues = z.infer<typeof attendeeEditFormSchema>;

interface Center {
  _id: string;
  name: string;
}
interface Cluster {
  _id: string;
  name: string;
  centerId?: { _id: string; name: string } | string;
}

interface AttendeeDetails extends IAttendee {
  centerId?: { // For populated data
    _id: string;
    name: string;
  } | null;
   createdBy?: {
    _id: string;
    email: string;
  } | null;
  updatedBy?: {
    _id: string;
    email: string;
  } | null;
}


// This component will be conceptually merged into app/(dashboard)/attendees/[attendeeId]/page.tsx
// For now, defining structure for the form part.

interface AttendeeEditFormProps {
  attendee: AttendeeDetails;
  onFormSubmit: (values: AttendeeEditFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  centers: Center[];
  clusters: Cluster[];
  canChangeCenter: boolean; // Permission to change center
}

export function AttendeeEditForm({
  attendee,
  onFormSubmit,
  onCancel,
  isLoading,
  centers,
  clusters,
  canChangeCenter
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
    // Only reset clusterId if centerId actually changed from the initial value for this form instance
    // For a new form load (via defaultValues), this won't incorrectly clear an existing clusterId
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

              <FormField
                control={form.control}
                name="centerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Center *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!canChangeCenter}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a center" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {centers.map(center => (<SelectItem key={center._id} value={center._id}>{center.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {!canChangeCenter && <FormDescription>Center cannot be changed by your current role.</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clusterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cluster</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCenterId || filteredClusters.length === 0}>
                      <FormControl><SelectTrigger><SelectValue placeholder={selectedCenterId ? (filteredClusters.length > 0 ? "Select a cluster" : "No clusters for this center") : "Select a center first"} /></SelectTrigger></FormControl>
                      <SelectContent>
                        {filteredClusters.map(cluster => (<SelectItem key={cluster._id} value={cluster._id}>{cluster.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select attendee level" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="First-Timer">First-Timer</SelectItem>
                        <SelectItem value="Occasional Attendee">Occasional Attendee</SelectItem>
                        <SelectItem value="Regular Attendee">Regular Attendee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstAttendanceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>First Attendance Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

// The main page component will use this form component.
// For now, this file only defines the form structure.
// The actual app/(dashboard)/attendees/[attendeeId]/page.tsx will be overwritten in the next step.
// This is just a structural definition for the form.
export default function EditAttendeePlaceholder() {
    return <div>This is a placeholder for the edit form structure. The actual page will use AttendeeEditForm.</div>;
}
