// // app/(dashboard)/members/new/page.tsx
// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import * as z from "zod"
// import { 
//   Card, 
//   CardContent, 
//   CardDescription, 
//   CardHeader, 
//   CardTitle 
// } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { useToast } from "@/hooks/use-toast"
// import { ArrowLeft, Save } from "lucide-react"
// import Link from "next/link"

// // Updated form schema with all required fields
// const formSchema = z.object({
//   firstName: z.string().min(2, {
//     message: "First name must be at least 2 characters.",
//   }),
//   lastName: z.string().min(2, {
//     message: "Last name must be at least 2 characters.",
//   }),
//   email: z.string().email({
//     message: "Please enter a valid email address.",
//   }),
//   phoneNumber: z.string().min(5, {
//     message: "Phone number must be at least 5 characters.",
//   }),
//   gender: z.string().min(1, {
//     message: "Please select a gender.",
//   }),
//   dateOfBirth: z.string().min(1, {
//     message: "Date of birth is required.",
//   }),
//   // Address now has all required fields
//   addressStreet: z.string().min(1, { message: "Street is required" }),
//   addressCity: z.string().min(1, { message: "City is required" }),
//   addressState: z.string().min(1, { message: "State is required" }),
//   addressCountry: z.string().min(1, { message: "Country is required" }),
//   addressPostalCode: z.string().optional(),
//   maritalStatus: z.string().min(1, {
//     message: "Please select a marital status.",
//   }),
//   clusterId: z.string().optional(),
//   smallGroupId: z.string().optional(),
//   notes: z.string().optional(),
// })

// export default function AddMemberPage() {
//   const router = useRouter()
//   const { toast } = useToast()
//   const [isSubmitting, setIsSubmitting] = useState(false)
  
//   // Mock data for dropdowns
//   const clusters = [
//     { _id: "1", name: "North Cluster" },
//     { _id: "2", name: "South Cluster" },
//     { _id: "3", name: "East Cluster" },
//     { _id: "4", name: "West Cluster" },
//   ]
  
//   const smallGroups = [
//     { _id: "1", name: "Young Adults" },
//     { _id: "2", name: "Married Couples" },
//     { _id: "3", name: "Singles" },
//     { _id: "4", name: "Youth" },
//   ]
  
//   // Special value to represent "None" or unassigned
//   const NONE_VALUE = "none"
  
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phoneNumber: "",
//       gender: "",
//       dateOfBirth: "",
//       addressStreet: "",
//       addressCity: "",
//       addressState: "",
//       addressCountry: "",
//       addressPostalCode: "",
//       maritalStatus: "",
//       clusterId: NONE_VALUE,
//       smallGroupId: NONE_VALUE,
//       notes: "",
//     },
//   })

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     try {
//       setIsSubmitting(true)
      
//       // Restructure data for API consumption
//       const formattedValues = {
//         firstName: values.firstName,
//         lastName: values.lastName,
//         email: values.email,
//         phoneNumber: values.phoneNumber,
//         gender: values.gender,
//         dateOfBirth: values.dateOfBirth,
//         // Properly structure the address object
//         address: {
//           street: values.addressStreet,
//           city: values.addressCity,
//           state: values.addressState,
//           country: values.addressCountry,
//           postalCode: values.addressPostalCode || undefined,
//         },
//         maritalStatus: values.maritalStatus,
//         // Set to null instead of empty string for ObjectId fields
//         clusterId: values.clusterId === NONE_VALUE ? null : values.clusterId,
//         smallGroupId: values.smallGroupId === NONE_VALUE ? null : values.smallGroupId,
//         notes: values.notes,
//       }
      
//       // Send data to API
//       const response = await fetch("/api/members", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formattedValues),
//       })
      
//       const data = await response.json()
      
//       if (!response.ok) {
//         throw new Error(data.message || "Failed to create member")
//       }
      
//       toast({
//         title: "Member added",
//         description: "The member has been added successfully.",
//       })
      
//       // Redirect to members list
//       router.push("/members")
//     } catch (error) {
//       console.error("Error adding member:", error)
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to add member. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold tracking-tight">Add Member</h1>
//         <Button variant="outline" asChild>
//           <Link href="/members">
//             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
//           </Link>
//         </Button>
//       </div>
      
//       <Card>
//         <CardHeader>
//           <CardTitle>Member Information</CardTitle>
//           <CardDescription>
//             Enter the details for the new member.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <FormField
//                   control={form.control}
//                   name="firstName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>First Name *</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter first name" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="lastName"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Last Name *</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter last name" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Email *</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter email" type="email" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="phoneNumber"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Phone Number *</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter phone number" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="gender"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Gender *</FormLabel>
//                       <Select 
//                         onValueChange={field.onChange} 
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select gender" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="Male">Male</SelectItem>
//                           <SelectItem value="Female">Female</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="dateOfBirth"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Date of Birth *</FormLabel>
//                       <FormControl>
//                         <Input type="date" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="maritalStatus"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Marital Status *</FormLabel>
//                       <Select 
//                         onValueChange={field.onChange} 
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select marital status" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value="Single">Single</SelectItem>
//                           <SelectItem value="Married">Married</SelectItem>
//                           <SelectItem value="Divorced">Divorced</SelectItem>
//                           <SelectItem value="Widowed">Widowed</SelectItem>
//                         </SelectContent>
//                       </Select>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 {/* Address Fields - Expanded to individual inputs for better validation */}
//                 <div className="md:col-span-2">
//                   <h3 className="text-lg font-medium mb-4">Address Information *</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <FormField
//                       control={form.control}
//                       name="addressStreet"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Street *</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Enter street" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="addressCity"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>City *</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Enter city" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="addressState"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>State/Province *</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Enter state or province" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="addressCountry"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Country *</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Enter country" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
                    
//                     <FormField
//                       control={form.control}
//                       name="addressPostalCode"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Postal/ZIP Code</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Enter postal or ZIP code" {...field} />
//                           </FormControl>
//                           <FormDescription>Optional</FormDescription>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </div>
                
//                 <FormField
//                   control={form.control}
//                   name="clusterId"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Cluster</FormLabel>
//                       <Select 
//                         onValueChange={field.onChange} 
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select cluster" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value={NONE_VALUE}>None</SelectItem>
//                           {clusters.map((cluster) => (
//                             <SelectItem key={cluster._id} value={cluster._id}>
//                               {cluster.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormDescription>
//                         Optional: Assign to a cluster
//                       </FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <FormField
//                   control={form.control}
//                   name="smallGroupId"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Small Group</FormLabel>
//                       <Select 
//                         onValueChange={field.onChange} 
//                         defaultValue={field.value}
//                       >
//                         <FormControl>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select small group" />
//                           </SelectTrigger>
//                         </FormControl>
//                         <SelectContent>
//                           <SelectItem value={NONE_VALUE}>None</SelectItem>
//                           {smallGroups.map((group) => (
//                             <SelectItem key={group._id} value={group._id}>
//                               {group.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <FormDescription>
//                         Optional: Assign to a small group
//                       </FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
                
//                 <div className="md:col-span-2">
//                   <FormField
//                     control={form.control}
//                     name="notes"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Notes</FormLabel>
//                         <FormControl>
//                           <Textarea 
//                             placeholder="Enter any additional notes" 
//                             className="min-h-[100px]" 
//                             {...field} 
//                           />
//                         </FormControl>
//                         <FormDescription>
//                           Optional: Add any additional information about this member
//                         </FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>
              
//               <div className="flex justify-end">
//                 <Button type="submit" disabled={isSubmitting}>
//                   {isSubmitting ? (
//                     "Adding..."
//                   ) : (
//                     <>
//                       <Save className="mr-2 h-4 w-4" /> Add Member
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// app/(dashboard)/members/new/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
import Link from "next/link"

// Updated form schema with all required fields
const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().min(5, {
    message: "Phone number must be at least 5 characters.",
  }),
  gender: z.string().min(1, {
    message: "Please select a gender.",
  }),
  dateOfBirth: z.string().min(1, {
    message: "Date of birth is required.",
  }),
  // Address now has all required fields
  addressStreet: z.string().min(1, { message: "Street is required" }),
  addressCity: z.string().min(1, { message: "City is required" }),
  addressState: z.string().min(1, { message: "State is required" }),
  addressCountry: z.string().min(1, { message: "Country is required" }),
  addressPostalCode: z.string().optional(),
  maritalStatus: z.string().min(1, {
    message: "Please select a marital status.",
  }),
  clusterId: z.string().optional(),
  smallGroupId: z.string().optional(),
  notes: z.string().optional(),
  whatsappNumber: z.string().optional(),
})

// Interface for dropdown options
interface DropdownOption {
  _id: string;
  name: string;
  clusterId?: string; // For small groups
}

export default function AddMemberPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State for dynamically fetched data
  const [clusters, setClusters] = useState<DropdownOption[]>([])
  const [smallGroups, setSmallGroups] = useState<DropdownOption[]>([])
  const [filteredSmallGroups, setFilteredSmallGroups] = useState<DropdownOption[]>([])
  const [isLoadingClusters, setIsLoadingClusters] = useState(true)
  const [isLoadingSmallGroups, setIsLoadingSmallGroups] = useState(true)
  
  // Special value to represent "None" or unassigned
  const NONE_VALUE = "none"
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      dateOfBirth: "",
      addressStreet: "",
      addressCity: "",
      addressState: "",
      addressCountry: "",
      addressPostalCode: "",
      maritalStatus: "",
      clusterId: NONE_VALUE,
      smallGroupId: NONE_VALUE,
      whatsappNumber: "",
      notes: "",
    },
  })

  // Fetch clusters from API
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setIsLoadingClusters(true)
        const response = await fetch('/api/clusters/dropdown')
        
        if (!response.ok) {
          throw new Error('Failed to fetch clusters')
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          setClusters(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch clusters')
        }
      } catch (error) {
        console.error('Error fetching clusters:', error)
        toast({
          title: "Error",
          description: "Failed to load clusters. Using local data instead.",
          variant: "destructive",
        })
        
        // Fallback to dummy data
        setClusters([
          { _id: "1", name: "North Cluster" },
          { _id: "2", name: "South Cluster" },
          { _id: "3", name: "East Cluster" },
          { _id: "4", name: "West Cluster" },
        ])
      } finally {
        setIsLoadingClusters(false)
      }
    }
    
    fetchClusters()
  }, [toast])
  
  // Fetch small groups from API
  useEffect(() => {
    const fetchSmallGroups = async () => {
      try {
        setIsLoadingSmallGroups(true)
        const response = await fetch('/api/small-groups/dropdown')
        
        if (!response.ok) {
          throw new Error('Failed to fetch small groups')
        }
        
        const data = await response.json()
        
        if (data.success && data.data) {
          setSmallGroups(data.data)
          setFilteredSmallGroups(data.data)
        } else {
          throw new Error(data.message || 'Failed to fetch small groups')
        }
      } catch (error) {
        console.error('Error fetching small groups:', error)
        toast({
          title: "Error",
          description: "Failed to load small groups. Using local data instead.",
          variant: "destructive",
        })
        
        // Fallback to dummy data
        const dummyGroups = [
          { _id: "1", name: "Young Adults", clusterId: "1" },
          { _id: "2", name: "Married Couples", clusterId: "1" },
          { _id: "3", name: "Singles", clusterId: "2" },
          { _id: "4", name: "Youth", clusterId: "3" },
        ]
        setSmallGroups(dummyGroups)
        setFilteredSmallGroups(dummyGroups)
      } finally {
        setIsLoadingSmallGroups(false)
      }
    }
    
    fetchSmallGroups()
  }, [toast])
  
  // Filter small groups when cluster selection changes
  const clusterId = form.watch('clusterId')
  
  useEffect(() => {
    if (clusterId && clusterId !== NONE_VALUE) {
      setFilteredSmallGroups(smallGroups.filter(group => 
        group.clusterId === clusterId || !group.clusterId
      ))
      
      // Reset small group selection if the current selection doesn't belong to the selected cluster
      const currentGroupId = form.getValues('smallGroupId')
      if (currentGroupId && currentGroupId !== NONE_VALUE) {
        const currentBelongsToCluster = smallGroups.some(
          group => group._id === currentGroupId && group.clusterId === clusterId
        )
        
        if (!currentBelongsToCluster) {
          form.setValue('smallGroupId', NONE_VALUE)
        }
      }
    } else {
      setFilteredSmallGroups(smallGroups)
    }
  }, [clusterId, smallGroups, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      // Restructure data for API consumption
      const formattedValues = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        whatsappNumber: values.whatsappNumber,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        // Properly structure the address object
        address: {
          street: values.addressStreet,
          city: values.addressCity,
          state: values.addressState,
          country: values.addressCountry,
          postalCode: values.addressPostalCode || undefined,
        },
        maritalStatus: values.maritalStatus,
        // Set to null instead of empty string for ObjectId fields
        clusterId: values.clusterId === NONE_VALUE ? null : values.clusterId,
        smallGroupId: values.smallGroupId === NONE_VALUE ? null : values.smallGroupId,
        notes: values.notes,
      }
      
      // Send data to API
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to create member")
      }
      
      toast({
        title: "Member added",
        description: "The member has been added successfully.",
      })
      
      // Redirect to members list
      router.push("/members")
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add Member</h1>
        <Button variant="outline" asChild>
          <Link href="/members">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
          <CardDescription>
            Enter the details for the new member.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter WhatsApp number (optional)" {...field} />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Divorced">Divorced</SelectItem>
                          <SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Address Fields - Expanded to individual inputs for better validation */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Address Information *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="addressStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="addressCity"
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
                      name="addressState"
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
                    
                    <FormField
                      control={form.control}
                      name="addressCountry"
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
                      name="addressPostalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal/ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter postal or ZIP code" {...field} />
                          </FormControl>
                          <FormDescription>Optional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="clusterId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cluster</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingClusters}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingClusters ? "Loading clusters..." : "Select cluster"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          {clusters.map((cluster) => (
                            <SelectItem key={cluster._id} value={cluster._id}>
                              {cluster.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Optional: Assign to a cluster
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="smallGroupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Small Group</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingSmallGroups}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingSmallGroups ? "Loading small groups..." : "Select small group"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>None</SelectItem>
                          {filteredSmallGroups.map((group) => (
                            <SelectItem key={group._id} value={group._id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Optional: Assign to a small group
                        {clusterId && clusterId !== NONE_VALUE && (
                          <span> (filtered by selected cluster)</span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any additional notes" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Add any additional information about this member
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Adding..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Add Member
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}