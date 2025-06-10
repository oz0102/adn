// // // app/(dashboard)/follow-ups/[id]/page.tsx
// // "use client"

// // import { useState, useEffect } from "react"
// // import Link from "next/link"
// // import { useRouter } from "next/navigation"
// // import { Button } from "@/components/ui/button"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// // import { Badge } from "@/components/ui/badge"
// // import { 
// //   ArrowLeft, 
// //   Phone, 
// //   Mail, 
// //   Calendar, 
// //   User, 
// //   Trash2,
// //   AlertCircle,
// //   Plus
// // } from "lucide-react"
// // import { useToast } from "@/hooks/use-toast"
// // import { formatDate, getInitials, getStatusColor } from "@/lib/utils"
// // import { 
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// //   AlertDialogTrigger,
// // } from "@/components/ui/alert-dialog"
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogFooter,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogTrigger,
// // } from "@/components/ui/dialog"
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select"
// // import { Input } from "@/components/ui/input"
// // import { Textarea } from "@/components/ui/textarea"
// // import { Label } from "@/components/ui/label"

// // interface FollowUpAttempt {
// //   _id: string;
// //   attemptNumber: number;
// //   date: string;
// //   contactMethod: string;
// //   response: string;
// //   notes?: string;
// //   conductedBy: {
// //     _id: string;
// //     email: string;
// //   };
// // }

// // interface FollowUpDetails {
// //   _id: string;
// //   personType: 'New Attendee' | 'Member';
// //   personInfo: {
// //     id?: string;
// //     name: string;
// //     email?: string;
// //     phone: string;
// //     whatsappNumber?: string;
// //     address?: string;
// //     visitDate?: string;
// //   };
// //   missedEvent?: {
// //     name: string;
// //     date: string;
// //     type: string;
// //   };
// //   status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
// //   assignedTo: {
// //     _id: string;
// //     email: string;
// //   };
// //   attempts: FollowUpAttempt[];
// //   nextFollowUpDate?: string;
// //   createdAt: string;
// // }

// // export default function FollowUpDetailPage({ params }: { params: { id: string } }) {
// //   const router = useRouter()
// //   const { toast } = useToast()
// //   const [followUp, setFollowUp] = useState<FollowUpDetails | null>(null)
// //   const [isLoading, setIsLoading] = useState(true)
// //   const [isDeleting, setIsDeleting] = useState(false)
// //   const [isAddingAttempt, setIsAddingAttempt] = useState(false)
// //   const [formData, setFormData] = useState({
// //     contactMethod: "",
// //     response: "",
// //     notes: "",
// //     nextFollowUpDate: ""
// //   })

// //   useEffect(() => {
// //     const fetchFollowUpData = async () => {
// //       try {
// //         setIsLoading(true)
        
// //         // In a real implementation, fetch actual data from your API
// //         // This is just simulating the API response
// //         await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
// //         // Mock data
// //         const mockFollowUp: FollowUpDetails = {
// //           _id: params.id,
// //           personType: "New Attendee",
// //           personInfo: {
// //             name: "John Smith",
// //             email: "john.smith@example.com",
// //             phone: "+12345678901",
// //             whatsappNumber: "+12345678901",
// //             address: "123 Main St, New York, NY 10001",
// //             visitDate: "2023-06-15T00:00:00.000Z",
// //           },
// //           status: "In Progress",
// //           assignedTo: {
// //             _id: "user1",
// //             email: "pastor@example.com"
// //           },
// //           attempts: [
// //             {
// //               _id: "attempt1",
// //               attemptNumber: 1,
// //               date: "2023-06-18T00:00:00.000Z",
// //               contactMethod: "Call",
// //               response: "No Response",
// //               notes: "Called but no answer. Left a voicemail.",
// //               conductedBy: {
// //                 _id: "user1",
// //                 email: "pastor@example.com"
// //               }
// //             },
// //             {
// //               _id: "attempt2",
// //               attemptNumber: 2,
// //               date: "2023-06-20T00:00:00.000Z",
// //               contactMethod: "SMS",
// //               response: "Positive",
// //               notes: "Responded to the message. Said they will try to come next Sunday.",
// //               conductedBy: {
// //                 _id: "user1",
// //                 email: "pastor@example.com"
// //               }
// //             }
// //           ],
// //           nextFollowUpDate: "2023-06-25T00:00:00.000Z",
// //           createdAt: "2023-06-16T00:00:00.000Z"
// //         }
        
// //         setFollowUp(mockFollowUp)

// //         // Initialize form with next follow-up date if available
// //         if (mockFollowUp.nextFollowUpDate) {
// //           setFormData(prev => ({
// //             ...prev,
// //             nextFollowUpDate: new Date(mockFollowUp.nextFollowUpDate).toISOString().split('T')[0]
// //           }))
// //         }
// //       } catch (error) {
// //         console.error("Error fetching follow-up:", error)
// //         toast({
// //           title: "Error",
// //           description: "Failed to load follow-up details. Please try again.",
// //           variant: "destructive",
// //         })
// //       } finally {
// //         setIsLoading(false)
// //       }
// //     };
    
// //     fetchFollowUpData();
// //   }, [params.id, toast]);

// //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
// //     const { name, value } = e.target
// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: value
// //     }))
// //   }

// //   const handleSelectChange = (name: string, value: string) => {
// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: value
// //     }))
// //   }

// //   const handleSubmitAttempt = async (e: React.FormEvent) => {
// //     e.preventDefault()
    
// //     if (!formData.contactMethod || !formData.response) {
// //       toast({
// //         title: "Missing information",
// //         description: "Please complete all required fields",
// //         variant: "destructive",
// //       })
// //       return
// //     }
    
// //     try {
// //       setIsLoading(true)
      
// //       // In a real implementation, you would send data to your API
// //       // This is just simulating the API call
// //       await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
// //       // Simulate adding a new attempt
// //       if (followUp) {
// //         const newAttempt: FollowUpAttempt = {
// //           _id: `attempt${followUp.attempts.length + 1}`,
// //           attemptNumber: followUp.attempts.length + 1,
// //           date: new Date().toISOString(),
// //           contactMethod: formData.contactMethod,
// //           response: formData.response,
// //           notes: formData.notes,
// //           conductedBy: {
// //             _id: "user1", // In a real app, this would be the current user
// //             email: "pastor@example.com"
// //           }
// //         }
        
// //         const updatedFollowUp = {
// //           ...followUp,
// //           attempts: [...followUp.attempts, newAttempt],
// //           nextFollowUpDate: formData.nextFollowUpDate 
// //             ? new Date(formData.nextFollowUpDate).toISOString()
// //             : followUp.nextFollowUpDate
// //         }
        
// //         setFollowUp(updatedFollowUp)
        
// //         toast({
// //           title: "Success",
// //           description: "Follow-up attempt recorded successfully",
// //         })
        
// //         // Reset form and close dialog
// //         setFormData({
// //           contactMethod: "",
// //           response: "",
// //           notes: "",
// //           nextFollowUpDate: formData.nextFollowUpDate
// //         })
// //         setIsAddingAttempt(false)
// //       }
// //     } catch (error) {
// //       console.error("Error adding follow-up attempt:", error)
// //       toast({
// //         title: "Error",
// //         description: "Failed to record follow-up attempt. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   const handleUpdateStatus = async (newStatus: string) => {
// //     try {
// //       setIsLoading(true)
      
// //       // In a real implementation, you would send data to your API
// //       // This is just simulating the API call
// //       await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
// //       if (followUp) {
// //         const updatedFollowUp = {
// //           ...followUp,
// //           status: newStatus as FollowUpDetails['status']
// //         }
        
// //         setFollowUp(updatedFollowUp)
        
// //         toast({
// //           title: "Status updated",
// //           description: `Follow-up status changed to ${newStatus}`,
// //         })
// //       }
// //     } catch (error) {
// //       console.error("Error updating status:", error)
// //       toast({
// //         title: "Error",
// //         description: "Failed to update status. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   const handleDeleteFollowUp = async () => {
// //     try {
// //       setIsDeleting(true)
      
// //       // In a real implementation, you would send a delete request to your API
// //       // This is just simulating the API call
// //       await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
// //       toast({
// //         title: "Success",
// //         description: "Follow-up deleted successfully",
// //       })
      
// //       // Redirect back to the follow-ups list
// //       router.push("/follow-ups")
// //     } catch (error) {
// //       console.error("Error deleting follow-up:", error)
// //       toast({
// //         title: "Error",
// //         description: "Failed to delete follow-up. Please try again.",
// //         variant: "destructive",
// //       })
// //       setIsDeleting(false)
// //     }
// //   }

// //   if (isLoading && !followUp) {
// //     return (
// //       <div className="flex items-center justify-center h-64">
// //         <div className="text-center">
// //           <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
// //           <h3 className="text-lg font-medium">Loading follow-up details...</h3>
// //         </div>
// //       </div>
// //     )
// //   }

// //   if (!followUp) {
// //     return (
// //       <div className="flex items-center justify-center h-64">
// //         <div className="text-center">
// //           <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
// //           <h3 className="text-lg font-medium">Follow-up not found</h3>
// //           <p className="text-gray-500 mb-4">
// //             The requested follow-up details could not be found.
// //           </p>
// //           <Button asChild>
// //             <Link href="/follow-ups">Return to Follow-ups</Link>
// //           </Button>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex items-center justify-between">
// //         <div className="flex items-center space-x-2">
// //           <Button variant="ghost" size="icon" asChild>
// //             <Link href="/follow-ups">
// //               <ArrowLeft className="h-5 w-5" />
// //             </Link>
// //           </Button>
// //           <h1 className="text-2xl font-bold tracking-tight">Follow-up Details</h1>
// //         </div>
        
// //         <div className="flex items-center space-x-2">
// //           <Select defaultValue={followUp.status} onValueChange={handleUpdateStatus}>
// //             <SelectTrigger className="w-[180px]">
// //               <SelectValue placeholder="Status" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="Pending">Pending</SelectItem>
// //               <SelectItem value="In Progress">In Progress</SelectItem>
// //               <SelectItem value="Completed">Completed</SelectItem>
// //               <SelectItem value="Failed">Failed</SelectItem>
// //             </SelectContent>
// //           </Select>
          
// //           <Dialog open={isAddingAttempt} onOpenChange={setIsAddingAttempt}>
// //             <DialogTrigger asChild>
// //               <Button>
// //                 <Plus className="mr-2 h-4 w-4" />
// //                 New Attempt
// //               </Button>
// //             </DialogTrigger>
// //             <DialogContent>
// //               <DialogHeader>
// //                 <DialogTitle>Add Follow-up Attempt</DialogTitle>
// //                 <DialogDescription>
// //                   Record a new follow-up attempt for {followUp.personInfo.name}
// //                 </DialogDescription>
// //               </DialogHeader>
              
// //               <form onSubmit={handleSubmitAttempt}>
// //                 <div className="grid gap-4 py-4">
// //                   <div className="space-y-2">
// //                     <Label htmlFor="contactMethod">Contact Method *</Label>
// //                     <Select
// //                       value={formData.contactMethod}
// //                       onValueChange={(value) => handleSelectChange("contactMethod", value)}
// //                       required
// //                     >
// //                       <SelectTrigger id="contactMethod">
// //                         <SelectValue placeholder="Select contact method" />
// //                       </SelectTrigger>
// //                       <SelectContent>
// //                         <SelectItem value="Call">Call</SelectItem>
// //                         <SelectItem value="SMS">SMS</SelectItem>
// //                         <SelectItem value="WhatsApp">WhatsApp</SelectItem>
// //                         <SelectItem value="Email">Email</SelectItem>
// //                         <SelectItem value="In Person">In Person</SelectItem>
// //                       </SelectContent>
// //                     </Select>
// //                   </div>
                  
// //                   <div className="space-y-2">
// //                     <Label htmlFor="response">Response *</Label>
// //                     <Select
// //                       value={formData.response}
// //                       onValueChange={(value) => handleSelectChange("response", value)}
// //                       required
// //                     >
// //                       <SelectTrigger id="response">
// //                         <SelectValue placeholder="Select response" />
// //                       </SelectTrigger>
// //                       <SelectContent>
// //                         <SelectItem value="Positive">Positive</SelectItem>
// //                         <SelectItem value="Negative">Negative</SelectItem>
// //                         <SelectItem value="No Response">No Response</SelectItem>
// //                       </SelectContent>
// //                     </Select>
// //                   </div>
                  
// //                   <div className="space-y-2">
// //                     <Label htmlFor="notes">Notes</Label>
// //                     <Textarea
// //                       id="notes"
// //                       name="notes"
// //                       placeholder="Add details about the attempt"
// //                       value={formData.notes}
// //                       onChange={handleInputChange}
// //                       rows={3}
// //                     />
// //                   </div>
                  
// //                   <div className="space-y-2">
// //                     <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
// //                     <Input
// //                       id="nextFollowUpDate"
// //                       name="nextFollowUpDate"
// //                       type="date"
// //                       value={formData.nextFollowUpDate}
// //                       onChange={handleInputChange}
// //                     />
// //                   </div>
// //                 </div>
                
// //                 <DialogFooter>
// //                   <Button type="button" variant="outline" onClick={() => setIsAddingAttempt(false)}>
// //                     Cancel
// //                   </Button>
// //                   <Button type="submit" disabled={isLoading}>
// //                     Add Attempt
// //                   </Button>
// //                 </DialogFooter>
// //               </form>
// //             </DialogContent>
// //           </Dialog>
          
// //           <AlertDialog>
// //             <AlertDialogTrigger asChild>
// //               <Button variant="destructive" size="icon">
// //                 <Trash2 className="h-4 w-4" />
// //               </Button>
// //             </AlertDialogTrigger>
// //             <AlertDialogContent>
// //               <AlertDialogHeader>
// //                 <AlertDialogTitle>Delete Follow-up</AlertDialogTitle>
// //                 <AlertDialogDescription>
// //                   Are you sure you want to delete this follow-up? This action cannot be undone.
// //                 </AlertDialogDescription>
// //               </AlertDialogHeader>
// //               <AlertDialogFooter>
// //                 <AlertDialogCancel>Cancel</AlertDialogCancel>
// //                 <AlertDialogAction
// //                   onClick={handleDeleteFollowUp}
// //                   disabled={isDeleting}
// //                   className="bg-red-600 hover:bg-red-700"
// //                 >
// //                   {isDeleting ? "Deleting..." : "Delete"}
// //                 </AlertDialogAction>
// //               </AlertDialogFooter>
// //             </AlertDialogContent>
// //           </AlertDialog>
// //         </div>
// //       </div>
      
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //         <Card className="md:col-span-1">
// //           <CardHeader>
// //             <CardTitle>Person Information</CardTitle>
// //           </CardHeader>
// //           <CardContent className="space-y-4">
// //             <div className="flex items-center gap-3">
// //               <Avatar className="h-12 w-12">
// //                 <AvatarFallback>{getInitials(followUp.personInfo.name, "")}</AvatarFallback>
// //               </Avatar>
// //               <div>
// //                 <h3 className="font-medium text-lg">{followUp.personInfo.name}</h3>
// //                 <Badge variant="outline">{followUp.personType}</Badge>
// //               </div>
// //             </div>
            
// //             <div className="space-y-3 pt-2">
// //               {followUp.personInfo.email && (
// //                 <div className="flex items-center gap-2">
// //                   <Mail className="h-4 w-4 text-gray-500" />
// //                   <span>{followUp.personInfo.email}</span>
// //                 </div>
// //               )}
// //               <div className="flex items-center gap-2">
// //                 <Phone className="h-4 w-4 text-gray-500" />
// //                 <span>{followUp.personInfo.phone}</span>
// //               </div>
// //               <div className="flex items-center gap-2">
// //                 <User className="h-4 w-4 text-gray-500" />
// //                 <span>Assigned to: {followUp.assignedTo.email}</span>
// //               </div>
              
// //               {followUp.personInfo.visitDate && (
// //                 <div className="flex items-center gap-2">
// //                   <Calendar className="h-4 w-4 text-gray-500" />
// //                   <span>Visit date: {formatDate(new Date(followUp.personInfo.visitDate as string))}</span>
// //                 </div>
// //               )}
              
// //               {followUp.nextFollowUpDate && (
// //                 <div className="flex items-center gap-2">
// //                   <Calendar className="h-4 w-4 text-gray-500" />
// //                   <span>Next follow-up: {formatDate(new Date(followUp.nextFollowUpDate as string))}</span>
// //                 </div>
// //               )}
// //             </div>
            
// //             {followUp.missedEvent && (
// //               <div className="pt-2">
// //                 <h4 className="font-medium text-sm mb-2">Missed Event</h4>
// //                 <div className="text-sm">
// //                   <p><strong>Event:</strong> {followUp.missedEvent.name}</p>
// //                   <p><strong>Date:</strong> {formatDate(new Date(followUp.missedEvent.date))}</p>
// //                   <p><strong>Type:</strong> {followUp.missedEvent.type}</p>
// //                 </div>
// //               </div>
// //             )}
// //           </CardContent>
// //         </Card>
        
// //         <Card className="md:col-span-2">
// //           <CardHeader className="flex flex-row items-center justify-between">
// //             <CardTitle>Follow-up Attempts</CardTitle>
// //             <Badge className={getStatusColor(followUp.status)}>
// //               {followUp.status}
// //             </Badge>
// //           </CardHeader>
// //           <CardContent>
// //             {followUp.attempts.length === 0 ? (
// //               <div className="text-center py-8">
// //                 <p className="text-gray-500">No follow-up attempts recorded yet.</p>
// //                 <Button 
// //                   variant="outline" 
// //                   className="mt-4"
// //                   onClick={() => setIsAddingAttempt(true)}
// //                 >
// //                   <Plus className="mr-2 h-4 w-4" />
// //                   Add First Attempt
// //                 </Button>
// //               </div>
// //             ) : (
// //               <div className="space-y-4">
// //                 {followUp.attempts.map((attempt) => (
// //                   <div 
// //                     key={attempt._id} 
// //                     className="border rounded-md p-4 relative"
// //                   >
// //                     <div className="flex justify-between items-start mb-3">
// //                       <div>
// //                         <h4 className="font-medium">Attempt #{attempt.attemptNumber}</h4>
// //                         <p className="text-sm text-gray-500">
// //                           {formatDate(new Date(attempt.date))}
// //                         </p>
// //                         <p className="text-xs text-gray-400">
// //                           By: {attempt.conductedBy.email}
// //                         </p>
// //                       </div>
// //                       <Badge variant="outline">
// //                         {attempt.contactMethod}
// //                       </Badge>
// //                     </div>
                    
// //                     <div className="flex items-center gap-2 mb-3">
// //                       <Badge className={
// //                         attempt.response === "Positive"
// //                           ? "bg-green-100 text-green-800"
// //                           : attempt.response === "Negative"
// //                             ? "bg-red-100 text-red-800"
// //                             : "bg-yellow-100 text-yellow-800"
// //                       }>
// //                         {attempt.response}
// //                       </Badge>
// //                     </div>
                    
// //                     {attempt.notes && (
// //                       <div className="text-sm border-t pt-3">
// //                         <p className="font-medium mb-1">Notes:</p>
// //                         <p>{attempt.notes}</p>
// //                       </div>
// //                     )}
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //           </CardContent>
// //         </Card>
// //       </div>
// //     </div>
// //   )
// // }


//  // app/(dashboard)/follow-ups/[id]page.tsx

// "use client"

// import { useState, useEffect } from "react"
// import { useParams, useRouter } from "next/navigation"
// import Link from "next/link"
// import { 
//   Card, 
//   CardContent, 
//   CardDescription, 
//   CardFooter, 
//   CardHeader, 
//   CardTitle 
// } from "@/components/ui/card"
// import { 
//   Tabs, 
//   TabsContent, 
//   TabsList, 
//   TabsTrigger 
// } from "@/components/ui/tabs"
// import { Button } from "@/components/ui/button"
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { 
//   ArrowLeft, 
//   Calendar, 
//   Mail, 
//   Phone, 
//   User, 
//   Clock, 
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Edit,
//   Clipboard,
//   Send
// } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { formatDate, getInitials, getStatusColor } from "@/lib/utils"

// interface FollowUpAttempt {
//   attemptNumber: number
//   date: string
//   contactMethod: 'Email' | 'SMS' | 'WhatsApp' | 'Call' | 'In Person'
//   response: 'Positive' | 'Negative' | 'No Response'
//   notes?: string
//   conductedBy: {
//     _id: string
//     email: string
//   }
// }

// interface FollowUp {
//   _id: string
//   personType: 'New Attendee' | 'Member'
//   personName: string
//   personEmail?: string
//   personPhone: string
//   status: 'Pending' | 'In Progress' | 'Completed' | 'Failed'
//   assignedTo: {
//     _id: string
//     email: string
//   }
//   nextFollowUpDate?: string
//   attempts: FollowUpAttempt[]
//   eventDetails?: {
//     eventName: string
//     eventDate: string
//   }
//   notes?: string
//   createdAt: string
// }

// export default function FollowUpDetailPage() {
//   const params = useParams<{ id: string }>()
//   const router = useRouter()
//   const { toast } = useToast()
  
//   const [followUp, setFollowUp] = useState<FollowUp | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [newAttempt, setNewAttempt] = useState({
//     contactMethod: 'Call' as 'Email' | 'SMS' | 'WhatsApp' | 'Call' | 'In Person',
//     response: 'No Response' as 'Positive' | 'Negative' | 'No Response',
//     notes: ''
//   })
//   const [status, setStatus] = useState<FollowUp['status']>('Pending')
//   const [nextFollowUpDate, setNextFollowUpDate] = useState('')
  
//   useEffect(() => {
//     const fetchFollowUpData = async () => {
//       try {
//         setIsLoading(true)
        
//         // In a real implementation, you would fetch actual data from your API
//         // This is just simulating the API response
//         await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
        
//         // Mock data
//         const mockFollowUp: FollowUp = {
//           _id: params.id,
//           personType: Math.random() > 0.5 ? 'New Attendee' : 'Member',
//           personName: 'John Smith',
//           personEmail: 'john.smith@example.com',
//           personPhone: '+1234567890',
//           status: 'In Progress',
//           assignedTo: {
//             _id: 'user1',
//             email: 'pastor@church.org'
//           },
//           nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString(),
//           attempts: [
//             {
//               attemptNumber: 1,
//               date: new Date(Date.now() - 7 * 86400000).toISOString(),
//               contactMethod: 'Call',
//               response: 'No Response',
//               notes: 'Called but no answer. Left voicemail.',
//               conductedBy: {
//                 _id: 'user1',
//                 email: 'pastor@church.org'
//               }
//             },
//             {
//               attemptNumber: 2,
//               date: new Date(Date.now() - 3 * 86400000).toISOString(),
//               contactMethod: 'SMS',
//               response: 'Positive',
//               notes: 'Responded to text message. Will try to attend next service.',
//               conductedBy: {
//                 _id: 'user1',
//                 email: 'pastor@church.org'
//               }
//             }
//           ],
//           eventDetails: {
//             eventName: 'Sunday Service',
//             eventDate: new Date(Date.now() - 14 * 86400000).toISOString()
//           },
//           notes: 'First-time visitor. Seemed interested in small groups.',
//           createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
//         }
        
//         setFollowUp(mockFollowUp)
//         setStatus(mockFollowUp.status)
        
//         if (mockFollowUp.nextFollowUpDate) {
//           setNextFollowUpDate(new Date(mockFollowUp.nextFollowUpDate).toISOString().split('T')[0])
//         }
//       } catch (error) {
//         console.error("Error fetching follow-up:", error)
//         toast({
//           title: "Error",
//           description: "Failed to load follow-up data. Please try again.",
//           variant: "destructive",
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     };
    
//     fetchFollowUpData();
//   }, [params.id, toast]);
  
//   const handleStatusChange = (newStatus: string) => {
//     setStatus(newStatus as FollowUp['status'])
//   }
  
//   const handleNewAttemptChange = (field: keyof typeof newAttempt, value: string) => {
//     setNewAttempt(prev => ({
//       ...prev,
//       [field]: value
//     }))
//   }
  
//   const handleSubmitAttempt = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!newAttempt.notes) {
//       toast({
//         title: "Missing information",
//         description: "Please provide notes about the follow-up attempt",
//         variant: "destructive",
//       })
//       return
//     }
    
//     try {
//       // In a real implementation, you would send data to your API
//       // This is just simulating the API call
//       setIsLoading(true)
//       await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
//       // Update local state to simulate successful save
//       if (followUp) {
//         const newAttemptNumber = followUp.attempts.length + 1
//         const newAttemptData: FollowUpAttempt = {
//           attemptNumber: newAttemptNumber,
//           date: new Date().toISOString(),
//           contactMethod: newAttempt.contactMethod,
//           response: newAttempt.response,
//           notes: newAttempt.notes,
//           conductedBy: {
//             _id: 'user1',
//             email: 'pastor@church.org' // In a real app, this would be the current user
//           }
//         }
        
//         setFollowUp({
//           ...followUp,
//           attempts: [...followUp.attempts, newAttemptData],
//           status: status,
//           nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined
//         })
        
//         // Reset the form
//         setNewAttempt({
//           contactMethod: 'Call',
//           response: 'No Response',
//           notes: ''
//         })
        
//         toast({
//           title: "Success",
//           description: "Follow-up attempt recorded successfully",
//         })
//       }
//     } catch (error) {
//       console.error("Error saving follow-up attempt:", error)
//       toast({
//         title: "Error",
//         description: "Failed to save follow-up attempt. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }
  
//   const handleSaveChanges = async () => {
//     try {
//       // In a real implementation, you would send data to your API
//       // This is just simulating the API call
//       setIsLoading(true)
//       await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
//       // Update local state to simulate successful save
//       if (followUp) {
//         setFollowUp({
//           ...followUp,
//           status: status,
//           nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined
//         })
        
//         toast({
//           title: "Success",
//           description: "Follow-up details updated successfully",
//         })
//       }
//     } catch (error) {
//       console.error("Error updating follow-up:", error)
//       toast({
//         title: "Error",
//         description: "Failed to update follow-up details. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }
  
//   const getStatusIcon = (status: FollowUp['status']) => {
//     switch (status) {
//       case 'Completed':
//         return <CheckCircle className="h-4 w-4 text-green-500" />
//       case 'Failed':
//         return <XCircle className="h-4 w-4 text-red-500" />
//       case 'In Progress':
//         return <Clock className="h-4 w-4 text-blue-500" />
//       case 'Pending':
//         return <AlertCircle className="h-4 w-4 text-yellow-500" />
//     }
//   }
  
//   const getResponseIcon = (response: FollowUpAttempt['response']) => {
//     switch (response) {
//       case 'Positive':
//         return <CheckCircle className="h-4 w-4 text-green-500" />
//       case 'Negative':
//         return <XCircle className="h-4 w-4 text-red-500" />
//       case 'No Response':
//         return <AlertCircle className="h-4 w-4 text-yellow-500" />
//     }
//   }
  
//   if (isLoading && !followUp) {
//     return (
//       <div className="flex items-center justify-center h-full py-16">
//         <div className="text-center">
//           <h2 className="text-xl font-medium mb-2">Loading follow-up details...</h2>
//           <p className="text-gray-500">Please wait while we fetch the data.</p>
//         </div>
//       </div>
//     )
//   }
  
//   if (!followUp) {
//     return (
//       <div className="flex items-center justify-center h-full py-16">
//         <div className="text-center">
//           <h2 className="text-xl font-medium mb-2">Follow-up not found</h2>
//           <p className="text-gray-500 mb-4">The requested follow-up record could not be found.</p>
//           <Button asChild>
//             <Link href="/follow-ups">Back to Follow-ups</Link>
//           </Button>
//         </div>
//       </div>
//     )
//   }
  
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div className="flex items-center">
//           <Button variant="ghost" size="icon" className="mr-2" asChild>
//             <Link href="/follow-ups">
//               <ArrowLeft className="h-5 w-5" />
//             </Link>
//           </Button>
//           <h1 className="text-2xl font-bold tracking-tight">Follow-up Details</h1>
//         </div>
//         <Badge className={`${getStatusColor(followUp.status)} text-base px-3 py-1`}>
//           {getStatusIcon(followUp.status)}
//           <span className="ml-1">{followUp.status}</span>
//         </Badge>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="md:col-span-1">
//           <Card>
//             <CardHeader>
//               <CardTitle>Person Details</CardTitle>
//               <CardDescription>Information about the person being followed up</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <Avatar className="h-12 w-12">
//                   <AvatarFallback>{getInitials(followUp.personName, "")}</AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <h3 className="font-medium text-lg">{followUp.personName}</h3>
//                   <Badge variant="outline">{followUp.personType}</Badge>
//                 </div>
//               </div>
              
//               <Separator />
              
//               <div className="space-y-3">
//                 {followUp.personEmail && (
//                   <div className="flex items-center gap-2">
//                     <Mail className="h-4 w-4 text-gray-500" />
//                     <span>{followUp.personEmail}</span>
//                   </div>
//                 )}
//                 <div className="flex items-center gap-2">
//                   <Phone className="h-4 w-4 text-gray-500" />
//                   <span>{followUp.personPhone}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <User className="h-4 w-4 text-gray-500" />
//                   <span>Assigned to: {followUp.assignedTo.email}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Calendar className="h-4 w-4 text-gray-500" />
//                   <span>Created: {formatDate(new Date(followUp.createdAt))}</span>
//                 </div>
//               </div>
              
//               {followUp.eventDetails && (
//                 <>
//                   <Separator />
//                   <div>
//                     <h4 className="font-medium mb-2">Event Details</h4>
//                     <p className="text-sm">
//                       <strong>Event:</strong> {followUp.eventDetails.eventName}
//                     </p>
//                     <p className="text-sm">
//                       <strong>Date:</strong> {formatDate(new Date(followUp.eventDetails.eventDate))}
//                     </p>
//                   </div>
//                 </>
//               )}
              
//               {followUp.notes && (
//                 <>
//                   <Separator />
//                   <div>
//                     <h4 className="font-medium mb-2">Notes</h4>
//                     <p className="text-sm">{followUp.notes}</p>
//                   </div>
//                 </>
//               )}
//             </CardContent>
//           </Card>
//         </div>
        
//         <div className="md:col-span-2">
//           <Tabs defaultValue="attempts">
//             <TabsList className="grid grid-cols-2 mb-4">
//               <TabsTrigger value="attempts">Past Attempts</TabsTrigger>
//               <TabsTrigger value="new">New Attempt</TabsTrigger>
//             </TabsList>
            
//             <TabsContent value="attempts" className="space-y-4">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Follow-up Attempts</CardTitle>
//                   <CardDescription>History of past follow-up attempts</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   {followUp.attempts.length === 0 ? (
//                     <div className="text-center py-8">
//                       <p className="text-gray-500">No follow-up attempts recorded yet.</p>
//                     </div>
//                   ) : (
//                     <div className="space-y-6">
//                       {followUp.attempts.map((attempt) => (
//                         <div key={attempt.attemptNumber} className="border rounded-md p-4">
//                           <div className="flex justify-between items-start mb-3">
//                             <div>
//                               <h4 className="font-medium">Attempt #{attempt.attemptNumber}</h4>
//                               <p className="text-sm text-gray-500">
//                                 {formatDate(new Date(attempt.date))}
//                               </p>
//                             </div>
//                             <Badge className={`flex items-center gap-1 ${
//                               attempt.response === "Positive" 
//                                 ? "bg-green-100 text-green-800" 
//                                 : attempt.response === "Negative"
//                                   ? "bg-red-100 text-red-800"
//                                   : "bg-yellow-100 text-yellow-800"
//                             }`}>
//                               {getResponseIcon(attempt.response)}
//                               <span>{attempt.response}</span>
//                             </Badge>
//                           </div>
                          
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
//                             <div>
//                               <p className="text-sm font-medium">Contact Method</p>
//                               <p className="text-sm">{attempt.contactMethod}</p>
//                             </div>
//                             <div>
//                               <p className="text-sm font-medium">Conducted By</p>
//                               <p className="text-sm">{attempt.conductedBy.email}</p>
//                             </div>
//                           </div>
                          
//                           <div>
//                             <p className="text-sm font-medium">Notes</p>
//                             <p className="text-sm">{attempt.notes || "No notes provided."}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
              
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Update Status</CardTitle>
//                   <CardDescription>Update the follow-up status and next scheduled date</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="status">Status</Label>
//                       <Select value={status} onValueChange={handleStatusChange}>
//                         <SelectTrigger id="status">
//                           <SelectValue placeholder="Select status" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Pending">Pending</SelectItem>
//                           <SelectItem value="In Progress">In Progress</SelectItem>
//                           <SelectItem value="Completed">Completed</SelectItem>
//                           <SelectItem value="Failed">Failed</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
                    
//                     <div className="space-y-2">
//                       <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
//                       <Input
//                         id="nextFollowUpDate"
//                         type="date"
//                         value={nextFollowUpDate}
//                         onChange={(e) => setNextFollowUpDate(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 </CardContent>
//                 <CardFooter>
//                   <Button onClick={handleSaveChanges} disabled={isLoading}>
//                     <Edit className="mr-2 h-4 w-4" />
//                     Save Changes
//                   </Button>
//                 </CardFooter>
//               </Card>
//             </TabsContent>
            
//             <TabsContent value="new">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Record New Follow-up Attempt</CardTitle>
//                   <CardDescription>Document a new communication with this person</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleSubmitAttempt} className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="contactMethod">Contact Method</Label>
//                         <Select 
//                           value={newAttempt.contactMethod} 
//                           onValueChange={(value) => handleNewAttemptChange('contactMethod', value)}
//                         >
//                           <SelectTrigger id="contactMethod">
//                             <SelectValue placeholder="Select method" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="Call">Call</SelectItem>
//                             <SelectItem value="SMS">SMS</SelectItem>
//                             <SelectItem value="WhatsApp">WhatsApp</SelectItem>
//                             <SelectItem value="Email">Email</SelectItem>
//                             <SelectItem value="In Person">In Person</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
                      
//                       <div className="space-y-2">
//                         <Label htmlFor="response">Response</Label>
//                         <Select 
//                           value={newAttempt.response} 
//                           onValueChange={(value) => handleNewAttemptChange('response', value)}
//                         >
//                           <SelectTrigger id="response">
//                             <SelectValue placeholder="Select response" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="Positive">Positive</SelectItem>
//                             <SelectItem value="Negative">Negative</SelectItem>
//                             <SelectItem value="No Response">No Response</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                     </div>
                    
//                     <div className="space-y-2">
//                       <Label htmlFor="notes">Notes</Label>
//                       <Textarea
//                         id="notes"
//                         placeholder="Describe the interaction details..."
//                         value={newAttempt.notes}
//                         onChange={(e) => handleNewAttemptChange('notes', e.target.value)}
//                         rows={5}
//                       />
//                     </div>
                    
//                     <div className="flex gap-2">
//                       <Button 
//                         type="submit" 
//                         disabled={isLoading || !newAttempt.notes}
//                       >
//                         <Send className="mr-2 h-4 w-4" />
//                         Record Attempt
//                       </Button>
                      
//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={() => {
//                           // In a real app, this would generate a follow-up message template
//                           toast({
//                             title: "Template generated",
//                             description: "Follow-up message template copied to clipboard.",
//                           })
//                         }}
//                       >
//                         <Clipboard className="mr-2 h-4 w-4" />
//                         Generate Template
//                       </Button>
//                     </div>
//                   </form>
//                 </CardContent>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   )
// }

// app/(dashboard)/follow-ups/[id]/page.tsx - Detail page with enhanced features
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/lib/client/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/lib/client/components/ui/tabs"
import { Button } from "@/lib/client/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/client/components/ui/select"
import { Input } from "@/lib/client/components/ui/input"
import { Textarea } from "@/lib/client/components/ui/textarea"
import { Badge } from "@/lib/client/components/ui/badge"
import { Avatar, AvatarFallback } from "@/lib/client/components/ui/avatar"
import { Label } from "@/lib/client/components/ui/label"
import { Separator } from "@/lib/client/components/ui/separator"
import { 
  ArrowLeft, Calendar, Mail, Phone, User, Clock, CheckCircle,
  XCircle, AlertCircle, Edit, Clipboard, Send, UserCheck, PlusCircle, X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getInitials } from "@/lib/utils"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/lib/client/components/ui/dialog"
import { Checkbox } from "@/lib/client/components/ui/checkbox"

// WhatsApp Icon Component
const WhatsAppIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" />
    <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.695 1.447h.005c9.975 0 16.944-9.95 13.467-17.949-1.382-3.254-4.363-5.505-8.453-6.146C9.337-.329 3.708 2.868 1.364 8.93.359 11.177-.22 13.697.12 16.205c.124.895.33 1.77.572 2.625.493 1.73 2.283 1.03 2.773-.857.087-.334.167-.67.248-1.015.344-1.437-.24-1.68-1.223-2.647-.655-.642-.908-1.678-.543-2.647 2.611-6.9 12.25-7.836 17.622-2.399 2.91 2.94 2.84 9.042-.15 11.79-1.54 1.432-3.962.574-4.258-1.334-.203-1.297.27-2.588.774-3.906.283-.686.159-1.695-.15-2.094-.437-.462-1.13-.284-1.72-.076a10.8 10.8 0 0 0-2.935 1.574c-.947.673-1.946 1.324-2.698 2.229-.732.872-1.162 2.063-1.947 2.96-.49.559-1.248 1.348-1.986 1.613-.12.043-.21.074-.3.114-.82.403-1.27.36-1.402.24-.625-.547-.748-2.364-.748-2.364.943-5.309 8-4.27 10.949-2.341.217.145.447.313.68.495 1.088.856 2.13 1.77 2.419 3.136.275 1.296.26 2.612.065 3.038.977 1.605 1.55 2.708 1.55 4.35 0 5.356-5.244 9.78-11.663 9.78-2.068 0-4.077-.54-5.848-1.557L0 23.956l3.92-1.018a12.027 12.027 0 0 1-1.386-1.7c-3.858-6.144 1.006-13.324 3.205-15.36 1.222-1.128 5.907-4.197 10.463-2.913 5.75 1.62 7.88 5.04 8.015 9.992.184 6.637-5.394 9.548-5.758 9.777-.364.228-1.105.254-1.83-.35-1.069-1.496-1.878-3.294-2.412-5.072-.331-1.101-.391-2.165.047-3.197.33-.781.89-1.356 1.427-1.93.334-.36.61-.739.903-1.1.156-.226.322-.434.49-.627a.31.31 0 0 0 .088-.063c.192-.195.345-.362.463-.506.128-.155.23-.315.302-.488-.24.068-.483.14-.731.215-.474.147-1.095.284-1.471.284-.75 0-1.26-.436-1.743-.436a1.396 1.396 0 0 0-.513.101c-.147.054-.29.135-.437.214a7.796 7.796 0 0 0-1.81 1.367c-.138.155-.295.329-.442.49-.31.317-.607.65-.877 1.002-.121.195-.238.389-.346.588-.079.151-.156.304-.225.456a3.92 3.92 0 0 0-.155.378 4.7 4.7 0 0 0-.152.532c-.044.2-.07.402-.093.605a4.277 4.277 0 0 0-.031.534c.004.13.02.26.032.389.018.192.042.383.08.571.066.328.161.647.266.955.161.475.355.948.532 1.403.107.274.218.552.29.846.064.263.11.534.14.813.017.184.028.368.028.554 0 .071-.007.144-.01.216a7.764 7.764 0 0 1-.042.493c-.028.205-.069.406-.113.607-.055.24-.121.476-.2.708-.075.223-.16.44-.25.66-.105.249-.221.494-.345.735-.102.195-.207.387-.319.574-.11.184-.226.362-.345.54-.259.39-.544.758-.833 1.118-.196.245-.387.493-.591.733-.16.189-.313.383-.48.568-.354.391-.706.776-1.072 1.144-.64.64-1.331 1.224-2.079 1.735-.372.254-.754.491-1.145.717-.37.213-.747.414-1.132.599-.32.154-.645.301-.976.427-.153.059-.309.111-.464.166"   
      fill-rule="evenodd" clip-rule="evenodd"/>
  </svg>
);

interface FollowUpAttempt {
  attemptNumber: number;
  date: string;
  contactMethod: 'Email' | 'SMS' | 'WhatsApp' | 'Call' | 'In Person';
  response: 'Positive' | 'Negative' | 'No Response';
  responseCategory: 'Promising' | 'Undecided' | 'Cold';
  notes?: string;
  prayerRequests?: string[];
  conductedBy: {
    _id: string;
    email: string;
  };
}

interface FollowUp {
  _id: string;
  personType: 'New Convert' | 'New Attendee' | 'Member';
  personName: string;
  personEmail?: string;
  personPhone: string;
  personWhatsApp?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  responseCategory: 'Promising' | 'Undecided' | 'Cold';
  assignedTo: {
    _id: string;
    email: string;
  };
  nextFollowUpDate?: string;
  attempts: FollowUpAttempt[];
  requiredAttempts: number;
  eventDetails?: {
    eventName: string;
    eventDate: string;
  };
  notes?: string;
  prayerRequests?: string[];
  createdAt: string;
  handedOffToCluster?: {
    clusterId: string;
    clusterName: string;
    handoffDate: string;
    notes?: string;
  };
}

// Mock clusters for dropdown
const clusters = [
  { id: 'cluster1', name: 'North Cluster' },
  { id: 'cluster2', name: 'South Cluster' },
  { id: 'cluster3', name: 'East Cluster' },
  { id: 'cluster4', name: 'West Cluster' },
];

export default function FollowUpDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newAttempt, setNewAttempt] = useState({
    contactMethod: 'Call' as 'Email' | 'SMS' | 'WhatsApp' | 'Call' | 'In Person',
    response: 'No Response' as 'Positive' | 'Negative' | 'No Response',
    notes: '',
    prayerRequests: [''] as string[],
    hasPrayerRequest: false
  });
  
  const [status, setStatus] = useState<FollowUp['status']>('Pending');
  const [responseCategory, setResponseCategory] = useState<FollowUp['responseCategory']>('Undecided');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  
  // Message sending state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageData, setMessageData] = useState({
    message: '',
    channels: {
      email: false,
      sms: false,
      whatsapp: false
    },
    useAiGenerated: false
  });
  
  // Cluster handoff state
  const [handoffDialogOpen, setHandoffDialogOpen] = useState(false);
  const [handoffData, setHandoffData] = useState({
    clusterId: '',
    notes: ''
  });
  
  useEffect(() => {
    const fetchFollowUpData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, you would fetch actual data from your API
        // const response = await fetch(`/api/follow-ups/${params.id}`);
        // const data = await response.json();
        
        // For demonstration purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Fake loading delay
        
        // Mock data
        const mockFollowUp: FollowUp = {
          _id: params.id,
          personType: 'New Attendee',
          personName: 'John Smith',
          personEmail: 'john.smith@example.com',
          personPhone: '+1234567890',
          personWhatsApp: '+1234567890',
          status: 'In Progress',
          responseCategory: 'Promising',
          assignedTo: {
            _id: 'user1',
            email: 'pastor@church.org'
          },
          nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString(),
          attempts: [
            {
              attemptNumber: 1,
              date: new Date(Date.now() - 7 * 86400000).toISOString(),
              contactMethod: 'Call',
              response: 'No Response',
              responseCategory: 'Undecided',
              notes: 'Called but no answer. Left voicemail.',
              conductedBy: {
                _id: 'user1',
                email: 'pastor@church.org'
              }
            },
            {
              attemptNumber: 2,
              date: new Date(Date.now() - 3 * 86400000).toISOString(),
              contactMethod: 'SMS',
              response: 'Positive',
              responseCategory: 'Promising',
              notes: 'Responded to text message. Will try to attend next service. Has a prayer request for her sick mother.',
              prayerRequests: ['Healing for mother who is in the hospital'],
              conductedBy: {
                _id: 'user1',
                email: 'pastor@church.org'
              }
            }
          ],
          requiredAttempts: 8,
          eventDetails: {
            eventName: 'Sunday Service',
            eventDate: new Date(Date.now() - 14 * 86400000).toISOString()
          },
          notes: 'First-time visitor. Seemed interested in small groups.',
          prayerRequests: ['Healing for mother who is in the hospital'],
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
        };
        
        setFollowUp(mockFollowUp);
        setStatus(mockFollowUp.status);
        setResponseCategory(mockFollowUp.responseCategory);
        
        if (mockFollowUp.nextFollowUpDate) {
          setNextFollowUpDate(new Date(mockFollowUp.nextFollowUpDate).toISOString().split('T')[0]);
        }
      } catch (error: Error) {
        console.error("Error fetching follow-up:", error);
        toast({
          title: "Error",
          description: "Failed to load follow-up data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFollowUpData();
  }, [params.id, toast]);
  
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as FollowUp['status']);
  };
  
  const handleResponseCategoryChange = (newCategory: string) => {
    setResponseCategory(newCategory as FollowUp['responseCategory']);
  };
  
  const handleNewAttemptChange = (field: keyof typeof newAttempt, value: string | boolean | string[]) => {
    setNewAttempt(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const addPrayerRequest = () => {
    setNewAttempt(prev => ({
      ...prev,
      prayerRequests: [...prev.prayerRequests, '']
    }));
  };
  
  const updatePrayerRequest = (index: number, value: string) => {
    const updatedRequests = [...newAttempt.prayerRequests];
    updatedRequests[index] = value;
    setNewAttempt(prev => ({
      ...prev,
      prayerRequests: updatedRequests
    }));
  };
  
  const removePrayerRequest = (index: number) => {
    const updatedRequests = [...newAttempt.prayerRequests];
    updatedRequests.splice(index, 1);
    setNewAttempt(prev => ({
      ...prev,
      prayerRequests: updatedRequests.length ? updatedRequests : ['']
    }));
  };
  
  const handleSubmitAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAttempt.notes) {
      toast({
        title: "Missing information",
        description: "Please provide notes about the follow-up attempt",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // In a real implementation, you would send data to your API
      // const response = await fetch(`/api/follow-ups/${params.id}/attempts`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     contactMethod: newAttempt.contactMethod,
      //     response: newAttempt.response,
      //     notes: newAttempt.notes,
      //     prayerRequests: newAttempt.hasPrayerRequest ? newAttempt.prayerRequests.filter(Boolean) : []
      //   })
      // });
      // const data = await response.json();
      
      // For demonstration, simulate successful save
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Fake API call delay
      
      // Update local state to simulate successful save
      if (followUp) {
        const newAttemptNumber = followUp.attempts.length + 1;
        let attemptResponseCategory: 'Promising' | 'Undecided' | 'Cold';
        
        // Determine response category based on response
        if (newAttempt.response === 'Positive') {
          attemptResponseCategory = 'Promising';
        } else if (newAttempt.response === 'Negative') {
          attemptResponseCategory = 'Cold';
        } else {
          attemptResponseCategory = 'Undecided';
        }
        
        const newAttemptData: FollowUpAttempt = {
          attemptNumber: newAttemptNumber,
          date: new Date().toISOString(),
          contactMethod: newAttempt.contactMethod,
          response: newAttempt.response,
          responseCategory: attemptResponseCategory,
          notes: newAttempt.notes,
          prayerRequests: newAttempt.hasPrayerRequest ? newAttempt.prayerRequests.filter(Boolean) : undefined,
          conductedBy: {
            _id: 'user1',
            email: 'user@example.com' // In a real app, this would be the current user
          }
        };
        
        // Update response category based on new attempt
        let newResponseCategory = responseCategory;
        if (newAttempt.response === 'Positive') {
          newResponseCategory = 'Promising';
        } else if (newAttempt.response === 'Negative') {
          newResponseCategory = 'Cold';
        }
        
        // Update status based on progress and response
        let newStatus = status;
        if (newResponseCategory === 'Cold') {
          newStatus = 'Failed';
        } else if (newAttemptNumber >= followUp.requiredAttempts) {
          newStatus = newResponseCategory === 'Promising' ? 'Completed' : 'Failed';
        } else {
          newStatus = 'In Progress';
        }
        
        // Add prayer requests to the follow-up if any
        let updatedPrayerRequests = [...(followUp.prayerRequests || [])];
        if (newAttempt.hasPrayerRequest) {
          const newRequests = newAttempt.prayerRequests.filter(Boolean);
          if (newRequests.length > 0) {
            updatedPrayerRequests = [...updatedPrayerRequests, ...newRequests];
          }
        }
        
        setFollowUp({
          ...followUp,
          attempts: [...followUp.attempts, newAttemptData],
          status: newStatus,
          responseCategory: newResponseCategory,
          nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined,
          prayerRequests: updatedPrayerRequests
        });
        
        // Update the form state
        setStatus(newStatus);
        setResponseCategory(newResponseCategory);
        
        // Reset the form
        setNewAttempt({
          contactMethod: 'Call',
          response: 'No Response',
          notes: '',
          prayerRequests: [''],
          hasPrayerRequest: false
        });
        
        toast({
          title: "Success",
          description: "Follow-up attempt recorded successfully",
        });
      }
    } catch (error) {
      console.error("Error saving follow-up attempt:", error);
      toast({
        title: "Error",
        description: "Failed to save follow-up attempt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveChanges = async () => {
    try {
      // In a real implementation, you would send data to your API
      // const response = await fetch(`/api/follow-ups/${params.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     status,
      //     responseCategory,
      //     nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null
      //   })
      // });
      // const data = await response.json();
      
      // For demonstration, simulate successful save
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Fake API call delay
      
      // Update local state to simulate successful save
      if (followUp) {
        setFollowUp({
          ...followUp,
          status,
          responseCategory,
          nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined
        });
        
        toast({
          title: "Success",
          description: "Follow-up details updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating follow-up:", error);
      toast({
        title: "Error",
        description: "Failed to update follow-up details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    try {
      if (!messageData.message && !messageData.useAiGenerated) {
        toast({
          title: "Missing message",
          description: "Please enter a message or select AI-generated option",
          variant: "destructive",
        });
        return;
      }
      
      const selectedChannels = Object.entries(messageData.channels)
        .filter(([, selected]) => selected)
        .map(([channel]) => channel);
      
      if (selectedChannels.length === 0) {
        toast({
          title: "No channels selected",
          description: "Please select at least one communication channel",
          variant: "destructive",
        });
        return;
      }
      
      // In a real implementation, you would send data to your API
      // const response = await fetch(`/api/follow-ups/${params.id}/send-message`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: messageData.message,
      //     channels: selectedChannels,
      //     useAiGenerated: messageData.useAiGenerated
      //   })
      // });
      // const data = await response.json();
      
      // For demonstration, simulate successful message sending
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Fake API call delay
      
      toast({
        title: "Success",
        description: `Message sent via ${selectedChannels.join(', ')}`,
      });
      
      // Reset the form and close dialog
      setMessageDialogOpen(false);
      setMessageData({
        message: '',
        channels: {
          email: false,
          sms: false,
          whatsapp: false
        },
        useAiGenerated: false
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleHandoffToCluster = async () => {
    try {
      if (!handoffData.clusterId) {
        toast({
          title: "Cluster required",
          description: "Please select a cluster to hand off to",
          variant: "destructive",
        });
        return;
      }
      
      // In a real implementation, you would send data to your API
      // const response = await fetch(`/api/follow-ups/${params.id}/handoff`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     clusterId: handoffData.clusterId,
      //     notes: handoffData.notes
      //   })
      // });
      // const data = await response.json();
      
      // For demonstration, simulate successful handoff
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Fake API call delay
      
      // Update local state to simulate successful handoff
      if (followUp) {
        const clusterName = clusters.find(c => c.id === handoffData.clusterId)?.name || '';
        
        setFollowUp({
          ...followUp,
          status: 'Completed',
          handedOffToCluster: {
            clusterId: handoffData.clusterId,
            clusterName,
            handoffDate: new Date().toISOString(),
            notes: handoffData.notes
          }
        });
        
        setStatus('Completed');
        
        toast({
          title: "Success",
          description: `Contact successfully handed off to ${clusterName}`,
        });
        
        // Reset the form and close dialog
        setHandoffDialogOpen(false);
        setHandoffData({
          clusterId: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error("Error handing off to cluster:", error);
      toast({
        title: "Error",
        description: "Failed to hand off to cluster. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusIcon = (status: FollowUp['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getResponseIcon = (response: FollowUpAttempt['response']) => {
    switch (response) {
      case 'Positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Negative':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'No Response':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getResponseColor = (responseCategory: string) => {
    switch (responseCategory) {
      case 'Promising':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
      case 'Undecided':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
      case 'Cold':
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500";
    }
  };
  
  const getStatusColor = (status: string, responseCategory: string) => {
    if (status === 'Completed') {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
    } else if (status === 'Failed') {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
    } else {
      // For pending and in progress, use response category
      return getResponseColor(responseCategory);
    }
  };
  
  const generateCallScript = () => {
    const personName = followUp?.personName || "friend";
    const churchName = "Apostolic Dominion Network";
    const eventName = followUp?.eventDetails?.eventName || "our last meeting";
    const meetingTime = "2 pm";
    
    return `Hello, good morning!
My name is [Your Name] and I am calling you from ${churchName} where you recently attended ${eventName}.
Am I speaking with ${personName}? If confirmed, proceed to state the purpose of the call.
I am calling to hear what your experience at the last meeting was and how our prayer team can assist you with any peculiar request you might have.
- Take note of their response and forward the request to the chain prayers group on Telegram.
I want to invite you to our Sunday meeting where we discuss the word of God and fellowship. This Sunday by ${meetingTime}.
Thank you for your time and have a lovely day.`;
  };
  
  if (isLoading && !followUp) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading follow-up details...</h2>
          <p className="text-gray-500">Please wait while we fetch the data.</p>
        </div>
      </div>
    );
  }
  
  if (!followUp) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Follow-up not found</h2>
          <p className="text-gray-500 mb-4">The requested follow-up record could not be found.</p>
          <Button asChild>
            <Link href="/follow-ups">Back to Follow-ups</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" asChild>
            <Link href="/follow-ups">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Follow-up Details</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={`${getStatusColor(followUp.status, followUp.responseCategory)} text-base px-3 py-1`}>
            {getStatusIcon(followUp.status)}
            <span className="ml-1">{followUp.status}</span>
          </Badge>
          
          {(followUp.status === 'Pending' || followUp.status === 'In Progress') && (
            <Badge className={`${getResponseColor(followUp.responseCategory)} text-base px-3 py-1`}>
              {followUp.responseCategory}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Person Details</CardTitle>
              <CardDescription>Information about the person being followed up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getInitials(followUp.personName, "")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{followUp.personName}</h3>
                  <Badge variant="outline">{followUp.personType}</Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                {followUp.personEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{followUp.personEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{followUp.personPhone}</span>
                </div>
                {followUp.personWhatsApp && (
                  <div className="flex items-center gap-2">
                    <WhatsAppIcon className="h-4 w-4 text-green-500" />
                    <span>{followUp.personWhatsApp}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Assigned to: {followUp.assignedTo.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Created: {formatDate(new Date(followUp.createdAt))}</span>
                </div>
              </div>
              
              {followUp.eventDetails && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Event Details</h4>
                    <p className="text-sm">
                      <strong>Event:</strong> {followUp.eventDetails.eventName}
                    </p>
                    <p className="text-sm">
                      <strong>Date:</strong> {formatDate(new Date(followUp.eventDetails.eventDate))}
                    </p>
                  </div>
                </>
              )}
              
              {followUp.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm">{followUp.notes}</p>
                  </div>
                </>
              )}
              
              {followUp.prayerRequests && followUp.prayerRequests.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Prayer Requests</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {followUp.prayerRequests.map((request, index) => (
                        <li key={index} className="text-sm">{request}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              {followUp.handedOffToCluster && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Cluster Handoff</h4>
                    <p className="text-sm">
                      <strong>Cluster:</strong> {followUp.handedOffToCluster.clusterName}
                    </p>
                    <p className="text-sm">
                      <strong>Date:</strong> {formatDate(new Date(followUp.handedOffToCluster.handoffDate))}
                    </p>
                    {followUp.handedOffToCluster.notes && (
                      <p className="text-sm mt-1">
                        <strong>Notes:</strong> {followUp.handedOffToCluster.notes}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Communication and administrative actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => setMessageDialogOpen(true)}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              
              {/* Only show handoff option for promising leads that aren't already handed off */}
              {(followUp.responseCategory === 'Promising' && 
                !followUp.handedOffToCluster && 
                (followUp.status === 'Completed' || followUp.status === 'In Progress')) && (
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => setHandoffDialogOpen(true)}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Hand off to Cluster
                </Button>
              )}
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  // Copy call script to clipboard
                  navigator.clipboard.writeText(generateCallScript());
                  toast({
                    title: "Script copied",
                    description: "Call script copied to clipboard.",
                  });
                }}
              >
                <Clipboard className="mr-2 h-4 w-4" />
                Copy Call Script
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="attempts">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="attempts">Past Attempts</TabsTrigger>
              <TabsTrigger value="new">New Attempt</TabsTrigger>
            </TabsList>
            
            <TabsContent value="attempts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Follow-up Attempts</CardTitle>
                  <CardDescription>
                    {followUp.attempts.length} of {followUp.requiredAttempts} required attempts completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {followUp.attempts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No follow-up attempts recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {followUp.attempts.map((attempt) => (
                        <div key={attempt.attemptNumber} className="border rounded-md p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">Attempt #{attempt.attemptNumber}</h4>
                              <p className="text-sm text-gray-500">
                                {formatDate(new Date(attempt.date))}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={`flex items-center gap-1 ${
                                attempt.response === "Positive" 
                                  ? "bg-green-100 text-green-800" 
                                  : attempt.response === "Negative"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {getResponseIcon(attempt.response)}
                                <span>{attempt.response}</span>
                              </Badge>
                              
                              <Badge variant="outline" className={
                                getResponseColor(attempt.responseCategory)
                              }>
                                {attempt.responseCategory}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium">Contact Method</p>
                              <p className="text-sm">{attempt.contactMethod}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Conducted By</p>
                              <p className="text-sm">{attempt.conductedBy.email}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm font-medium">Notes</p>
                            <p className="text-sm">{attempt.notes || "No notes provided."}</p>
                          </div>
                          
                          {attempt.prayerRequests && attempt.prayerRequests.length > 0 && (
                            <div>
                              <p className="text-sm font-medium">Prayer Requests</p>
                              <ul className="list-disc pl-5">
                                {attempt.prayerRequests.map((request, index) => (
                                  <li key={index} className="text-sm">{request}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                  <CardDescription>Update the follow-up status and next scheduled date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={handleStatusChange}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="responseCategory">Response Category</Label>
                      <Select value={responseCategory} onValueChange={handleResponseCategoryChange}>
                        <SelectTrigger id="responseCategory">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Promising">Promising</SelectItem>
                          <SelectItem value="Undecided">Undecided</SelectItem>
                          <SelectItem value="Cold">Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
                      <Input
                        id="nextFollowUpDate"
                        type="date"
                        value={nextFollowUpDate}
                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveChanges} disabled={isLoading}>
                    <Edit className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="new">
              <Card>
                <CardHeader>
                  <CardTitle>Record New Follow-up Attempt</CardTitle>
                  <CardDescription>Document a new communication with this person</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-yellow-50 rounded-lg mb-6 border border-yellow-200">
                    <h4 className="font-medium mb-1">Call Script</h4>
                    <p className="text-sm whitespace-pre-line">{generateCallScript()}</p>
                  </div>
                  
                  <form onSubmit={handleSubmitAttempt} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactMethod">Contact Method</Label>
                        <Select 
                          value={newAttempt.contactMethod} 
                          onValueChange={(value) => handleNewAttemptChange('contactMethod', value)}
                        >
                          <SelectTrigger id="contactMethod">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Call">Call</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="In Person">In Person</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="response">Response</Label>
                        <Select 
                          value={newAttempt.response} 
                          onValueChange={(value) => handleNewAttemptChange('response', value)}
                        >
                          <SelectTrigger id="response">
                            <SelectValue placeholder="Select response" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Positive">Positive</SelectItem>
                            <SelectItem value="Negative">Negative</SelectItem>
                            <SelectItem value="No Response">No Response</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Describe the interaction details..."
                        value={newAttempt.notes}
                        onChange={(e) => handleNewAttemptChange('notes', e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasPrayerRequest" 
                          checked={newAttempt.hasPrayerRequest}
                          onCheckedChange={(checked) => 
                            handleNewAttemptChange('hasPrayerRequest', checked)
                          }
                        />
                        <label
                          htmlFor="hasPrayerRequest"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Include prayer request(s)
                        </label>
                      </div>
                      
                      {newAttempt.hasPrayerRequest && (
                        <div className="space-y-3 mt-3">
                          {newAttempt.prayerRequests.map((request, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="Enter prayer request..."
                                value={request}
                                onChange={(e) => updatePrayerRequest(index, e.target.value)}
                              />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removePrayerRequest(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addPrayerRequest}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Prayer Request
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={isLoading || !newAttempt.notes}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Record Attempt
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Send Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Follow-up Message</DialogTitle>
            <DialogDescription>
              Send a follow-up message through multiple channels
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message..."
                value={messageData.message}
                onChange={(e) => setMessageData(prev => ({
                  ...prev,
                  message: e.target.value
                }))}
                rows={5}
                disabled={messageData.useAiGenerated}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="useAiGenerated" 
                checked={messageData.useAiGenerated}
                onCheckedChange={(checked) => 
                  setMessageData(prev => ({
                    ...prev,
                    useAiGenerated: !!checked,
                    message: !!checked ? '' : prev.message
                  }))
                }
              />
              <label
                htmlFor="useAiGenerated"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Use AI to generate a personalized message
              </label>
            </div>
            
            <div className="space-y-1">
              <Label>Send via</Label>
              <div className="grid grid-cols-3 gap-2">
                {followUp.personEmail && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sendEmail" 
                      checked={messageData.channels.email}
                      onCheckedChange={(checked) => 
                        setMessageData(prev => ({
                          ...prev,
                          channels: {
                            ...prev.channels,
                            email: !!checked
                          }
                        }))
                      }
                    />
                    <label
                      htmlFor="sendEmail"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email
                    </label>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sendSMS" 
                    checked={messageData.channels.sms}
                    onCheckedChange={(checked) => 
                      setMessageData(prev => ({
                        ...prev,
                        channels: {
                          ...prev.channels,
                          sms: !!checked
                        }
                      }))
                    }
                  />
                  <label
                    htmlFor="sendSMS"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    SMS
                  </label>
                </div>
                
                {followUp.personWhatsApp && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sendWhatsApp" 
                      checked={messageData.channels.whatsapp}
                      onCheckedChange={(checked) => 
                        setMessageData(prev => ({
                          ...prev,
                          channels: {
                            ...prev.channels,
                            whatsapp: !!checked
                          }
                        }))
                      }
                    />
                    <label
                      htmlFor="sendWhatsApp"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      WhatsApp
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={isLoading}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cluster Handoff Dialog */}
      <Dialog open={handoffDialogOpen} onOpenChange={setHandoffDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hand Off to Cluster</DialogTitle>
            <DialogDescription>
              Assign this person to a cluster for continued discipleship
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clusterId">Select Cluster</Label>
              <Select 
                value={handoffData.clusterId} 
                onValueChange={(value) => setHandoffData(prev => ({
                  ...prev,
                  clusterId: value
                }))}
              >
                <SelectTrigger id="clusterId">
                  <SelectValue placeholder="Select a cluster" />
                </SelectTrigger>
                <SelectContent>
                  {clusters.map((cluster) => (
                    <SelectItem key={cluster.id} value={cluster.id}>
                      {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="handoffNotes">Handoff Notes</Label>
              <Textarea
                id="handoffNotes"
                placeholder="Add any relevant information for the cluster lead..."
                value={handoffData.notes}
                onChange={(e) => setHandoffData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setHandoffDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleHandoffToCluster} disabled={isLoading}>
              Complete Handoff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
