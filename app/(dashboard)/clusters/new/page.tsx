"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Layers, ArrowLeft, Plus, Trash2, Calendar, Building, Home, MapPin } from "lucide-react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

// Form schema with multiple meeting schedules, optional leader, and address
const clusterFormSchema = z.object({
  name: z.string().min(2, {
    message: "Cluster name must be at least 2 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  address: z.object({
    street: z.string().min(2, {
      message: "Street address is required.",
    }),
    city: z.string().min(2, {
      message: "City is required.",
    }),
    state: z.string().min(2, {
      message: "State/Province is required.",
    }),
    country: z.string().min(2, {
      message: "Country is required.",
    }),
    postalCode: z.string().optional(),
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  assignToHQ: z.boolean().default(false),
  centerId: z.string().optional(),
  leaderId: z.string().optional(), // Made optional
  meetingSchedules: z.array(
    z.object({
      day: z.string({
        required_error: "Please select a day.",
      }),
      time: z.string({
        required_error: "Please select a time.",
      }),
      frequency: z.string({
        required_error: "Please select a frequency.",
      }),
    })
  ).min(1, {
    message: "At least one meeting schedule is required.",
  }),
}).refine(data => {
  // If not assigned to HQ, centerId is required
  return data.assignToHQ || !!data.centerId;
}, {
  message: "Please select a center or assign to HQ directly",
  path: ["centerId"],
});

type ClusterFormValues = z.infer<typeof clusterFormSchema>

export default function NewClusterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [centers, setCenters] = useState<Array<{ _id: string; name: string }>>([])
  const [members, setMembers] = useState<Array<{ _id: string; firstName: string; lastName: string }>>([])
  const [isLoadingCenters, setIsLoadingCenters] = useState(true)
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)

  // Get centerId from URL if available
  const centerIdFromUrl = searchParams.get("centerId")
  const centerNameFromUrl = searchParams.get("centerName")

  // Default values for the form
  const defaultValues: Partial<ClusterFormValues> = {
    name: "",
    location: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    contactEmail: "",
    contactPhone: "",
    description: "",
    assignToHQ: !centerIdFromUrl, // Default to HQ if no center ID provided
    centerId: centerIdFromUrl || "",
    leaderId: "", // Optional
    meetingSchedules: [
      {
        day: "Sunday",
        time: "10:00",
        frequency: "Weekly",
      },
    ],
  }

  const form = useForm<ClusterFormValues>({
    resolver: zodResolver(clusterFormSchema),
    defaultValues,
  })

  // Watch assignToHQ to update UI
  const assignToHQ = form.watch("assignToHQ")

  // Use field array for meeting schedules
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "meetingSchedules",
  })

  // Fetch centers for dropdown
  const fetchCenters = async () => {
    try {
      setIsLoadingCenters(true)
      const response = await fetch("/api/centers")
      if (!response.ok) {
        throw new Error("Failed to fetch centers")
      }
      const data = await response.json()
      setCenters(data.centers || [])
    } catch (error) {
      console.error("Error fetching centers:", error)
      toast({
        title: "Error",
        description: "Failed to load centers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCenters(false)
    }
  }

  // Fetch members for leader dropdown
  const fetchMembers = async () => {
    try {
      setIsLoadingMembers(true)
      const response = await fetch("/api/members?limit=100") // Fetch more members for selection
      if (!response.ok) {
        throw new Error("Failed to fetch members")
      }
      const data = await response.json()
      setMembers(data.data?.members || [])
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({
        title: "Error",
        description: "Failed to load members. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMembers(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchCenters()
      fetchMembers()
    }
  }, [status])

  // Handle assignment toggle
  const handleAssignmentToggle = (value: boolean) => {
    form.setValue("assignToHQ", value);
    if (value) {
      // If assigning to HQ, clear centerId
      form.setValue("centerId", "");
    }
  };

  async function onSubmit(data: ClusterFormValues) {
    setIsSubmitting(true)
    try {
      // Prepare data for API - if assignToHQ is true, ensure centerId is null/undefined
      const submitData = {
        ...data,
        centerId: data.assignToHQ ? null : data.centerId,
        // If leaderId is empty string, set to null
        leaderId: data.leaderId && data.leaderId.trim() !== "" ? data.leaderId : null
      };

      const response = await fetch("/api/clusters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create cluster")
      }

      const result = await response.json()
      
      toast({
        title: "Cluster Created",
        description: `${data.name} has been successfully created.`,
      })
      
      // Redirect to the new cluster's page
      router.push(`/clusters/${result.cluster._id}`)
    } catch (error: any) {
      console.error("Error creating cluster:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create cluster. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create New Cluster</h1>
        </div>
      </div>

      {centerIdFromUrl && centerNameFromUrl && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Creating cluster for center:</span>
          <Badge variant="secondary" className="text-sm">{centerNameFromUrl}</Badge>
        </div>
      )}

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <CardTitle>Cluster Information</CardTitle>
          </div>
          <CardDescription>
            Enter the details for the new cluster. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Assignment Section */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium">Cluster Assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose whether this cluster belongs to a specific center or directly to HQ.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-2">
                    {assignToHQ ? (
                      <Home className="h-5 w-5 text-primary" />
                    ) : (
                      <Building className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">{assignToHQ ? "Assign to HQ Directly" : "Assign to a Center"}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignToHQ 
                          ? "This cluster will be managed directly by HQ" 
                          : "This cluster will be managed by a specific center"}
                      </p>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="assignToHQ"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              handleAssignmentToggle(checked);
                              field.onChange(checked);
                            }}
                            disabled={!!centerIdFromUrl}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {!assignToHQ && (
                  <FormField
                    control={form.control}
                    name="centerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Center *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!!centerIdFromUrl || isLoadingCenters}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingCenters ? "Loading centers..." : "Select a center"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {centers.map((center) => (
                              <SelectItem key={center._id} value={center._id}>
                                {center.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The center this cluster belongs to.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cluster Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter cluster name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The official name of the cluster.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormDescription>
                      The general location of the cluster (e.g., "Downtown", "North District").
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">Address *</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state or province" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address.postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal/ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter postal code (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Optional Leader Selection */}
              <FormField
                control={form.control}
                name="leaderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cluster Leader</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a leader (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No leader assigned yet</SelectItem>
                        {members.map((member) => (
                          <SelectItem key={member._id} value={member._id}>
                            {member.firstName} {member.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      You can assign a leader now or add one later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a description of the cluster" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of the cluster, its purpose, or other relevant information.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Meeting Schedules *</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ day: "Sunday", time: "10:00", frequency: "Weekly" })}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Schedule
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md relative">
                      <div className="absolute top-2 right-2">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`meetingSchedules.${index}.day`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Day</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                                    <SelectItem key={day} value={day}>
                                      {day}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`meetingSchedules.${index}.time`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
                              <FormControl>
                                <Input 
                                  type="time"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`meetingSchedules.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["Weekly", "Bi-weekly", "Monthly"].map((frequency) => (
                                    <SelectItem key={frequency} value={frequency}>
                                      {frequency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/clusters")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Cluster"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
