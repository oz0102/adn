

// app/(dashboard)/follow-ups/new/page.tsx - Page for creating new follow-ups
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"

// Form schema for new attendee follow-up
const newAttendeeSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
  phoneNumber: z.string().min(5, {
    message: "Phone number must be at least 5 characters.",
  }),
  whatsappNumber: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  visitDate: z.string({
    required_error: "Visit date is required",
  }),
  personType: z.string({
    required_error: "Person type is required",
  }),
  invitedFor: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  assignedToId: z.string({
    required_error: "Assigned to is required",
  }),
});

// Form schema for existing member follow-up
const memberSchema = z.object({
  memberId: z.string({
    required_error: "Member ID is required",
  }),
  eventId: z.string({
    required_error: "Event ID is required",
  }),
  notes: z.string().optional().or(z.literal('')),
  assignedToId: z.string({
    required_error: "Assigned to is required",
  }),
});

// Mock data for dropdowns
const users = [
  { id: 'user1', name: 'Pastor John' },
  { id: 'user2', name: 'Minister Sarah' },
  { id: 'user3', name: 'Deacon Michael' },
];

const events = [
  { id: 'event1', name: 'Sunday Service (2023-01-15)' },
  { id: 'event2', name: 'Prayer Meeting (2023-01-18)' },
  { id: 'event3', name: 'Bible Study (2023-01-20)' },
];

const members = [
  { id: 'member1', name: 'Alice Johnson' },
  { id: 'member2', name: 'Bob Miller' },
  { id: 'member3', name: 'Carol Williams' },
];

export default function NewFollowUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpType, setFollowUpType] = useState<'newAttendee' | 'member'>('newAttendee');
  
  // Form for new attendee
  const newAttendeeForm = useForm<z.infer<typeof newAttendeeSchema>>({
    resolver: zodResolver(newAttendeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      whatsappNumber: "",
      address: "",
      visitDate: new Date().toISOString().split('T')[0],
      personType: "New Attendee",
      invitedFor: "",
      notes: "",
      assignedToId: "",
    },
  });
  
  // Form for existing member
  const memberForm = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      memberId: "",
      eventId: "",
      notes: "",
      assignedToId: "",
    },
  });
  
  async function onSubmitNewAttendee(values: z.infer<typeof newAttendeeSchema>) {
    try {
      setIsSubmitting(true);
      
      // In a real implementation, you would send this data to your API
      // const response = await fetch('/api/follow-ups', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     personType: values.personType,
      //     newAttendee: {
      //       firstName: values.firstName,
      //       lastName: values.lastName,
      //       email: values.email,
      //       phoneNumber: values.phoneNumber,
      //       whatsappNumber: values.whatsappNumber,
      //       address: values.address,
      //       visitDate: values.visitDate,
      //       invitedFor: values.invitedFor
      //     },
      //     notes: values.notes,
      //     assignedTo: values.assignedToId
      //   })
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Follow-up created",
        description: "The follow-up has been created successfully.",
      });
      
      // Redirect to follow-ups list
      router.push("/follow-ups");
    } catch (error) {
      console.error("Error creating follow-up:", error);
      toast({
        title: "Error",
        description: "Failed to create follow-up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function onSubmitMember(values: z.infer<typeof memberSchema>) {
    try {
      setIsSubmitting(true);
      
      // In a real implementation, you would send this data to your API
      // const response = await fetch('/api/follow-ups', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     personType: 'Member',
      //     personId: values.memberId,
      //     missedEvent: {
      //       eventId: values.eventId
      //     },
      //     notes: values.notes,
      //     assignedTo: values.assignedToId
      //   })
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Follow-up created",
        description: "The follow-up has been created successfully.",
      });
      
      // Redirect to follow-ups list
      router.push("/follow-ups");
    } catch (error) {
      console.error("Error creating follow-up:", error);
      toast({
        title: "Error",
        description: "Failed to create follow-up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Follow-up</h1>
        <Button variant="outline" asChild>
          <Link href="/follow-ups">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Follow-ups
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create Follow-up</CardTitle>
          <CardDescription>
            Set up a new follow-up for a new attendee or existing member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="newAttendee" 
            value={followUpType}
            onValueChange={(value) => setFollowUpType(value as 'newAttendee' | 'member')}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="newAttendee">New Attendee</TabsTrigger>
              <TabsTrigger value="member">Existing Member</TabsTrigger>
            </TabsList>
            
            <TabsContent value="newAttendee">
              <Form {...newAttendeeForm}>
                <form onSubmit={newAttendeeForm.handleSubmit(onSubmitNewAttendee)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={newAttendeeForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newAttendeeForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newAttendeeForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newAttendeeForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newAttendeeForm.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter WhatsApp number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newAttendeeForm.control}
                      name="visitDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visit Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newAttendeeForm.control}
                      name="personType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Person Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select person type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="New Attendee">New Attendee</SelectItem>
                              <SelectItem value="New Convert">New Convert</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newAttendeeForm.control}
                      name="assignedToId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select user" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="md:col-span-2">
                      <FormField
                        control={newAttendeeForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter address" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <FormField
                        control={newAttendeeForm.control}
                        name="invitedFor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Invited For (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Sunday Service, Special Event" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <FormField
                        control={newAttendeeForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any additional notes about this person" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Creating..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Create Follow-up
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="member">
              <Form {...memberForm}>
                <form onSubmit={memberForm.handleSubmit(onSubmitMember)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={memberForm.control}
                      name="memberId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {members.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the member to follow up with
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberForm.control}
                      name="eventId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Missed Event</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select event" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {events.map((event) => (
                                <SelectItem key={event.id} value={event.id}>
                                  {event.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the event they missed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={memberForm.control}
                      name="assignedToId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select user" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="md:col-span-2">
                      <FormField
                        control={memberForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any additional notes about this follow-up" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Creating..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Create Follow-up
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}