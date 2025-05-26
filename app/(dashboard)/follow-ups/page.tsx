// // // // app/(dashboard)/follow-ups/[id]page.tsx

// // "use client"

// // import { useState, useEffect } from "react"
// // import { useParams, useRouter } from "next/navigation"
// // import Link from "next/link"
// // import { 
// //   Card, 
// //   CardContent, 
// //   CardDescription, 
// //   CardFooter, 
// //   CardHeader, 
// //   CardTitle 
// // } from "@/components/ui/card"
// // import { 
// //   Tabs, 
// //   TabsContent, 
// //   TabsList, 
// //   TabsTrigger 
// // } from "@/components/ui/tabs"
// // import { Button } from "@/components/ui/button"
// // import { 
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select"
// // import { Input } from "@/components/ui/input"
// // import { Textarea } from "@/components/ui/textarea"
// // import { Badge } from "@/components/ui/badge"
// // import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// // import { Label } from "@/components/ui/label"
// // import { Separator } from "@/components/ui/separator"
// // import { 
// //   ArrowLeft, 
// //   Calendar, 
// //   Mail, 
// //   Phone, 
// //   User, 
// //   Clock, 
// //   CheckCircle,
// //   XCircle,
// //   AlertCircle,
// //   Edit,
// //   Clipboard,
// //   Send
// // } from "lucide-react"
// // import { useToast } from "@/hooks/use-toast"
// // import { formatDate, getInitials, getStatusColor } from "@/lib/utils"

// // interface FollowUpAttempt {
// //   attemptNumber: number
// //   date: string
// //   contactMethod: 'Email' | 'SMS' | 'WhatsApp' | 'Call' | 'In Person'
// //   response: 'Positive' | 'Negative' | 'No Response'
// //   notes?: string
// //   conductedBy: {
// //     _id: string
// //     email: string
// //   }
// // }

// // interface FollowUp {
// //   _id: string
// //   personType: 'New Attendee' | 'Member'
// //   personName: string
// //   personEmail?: string
// //   personPhone: string
// //   status: 'Pending' | 'In Progress' | 'Completed' | 'Failed'
// //   assignedTo: {
// //     _id: string
// //     email: string
// //   }
// //   nextFollowUpDate?: string
// //   attempts: FollowUpAttempt[]
// //   eventDetails?: {
// //     eventName: string
// //     eventDate: string
// //   }
// //   notes?: string
// //   createdAt: string
// // }

// // export default function FollowUpDetailPage() {
// //   const params = useParams<{ id: string }>()
// //   const router = useRouter()
// //   const { toast } = useToast()
  
// //   const [followUp, setFollowUp] = useState<FollowUp | null>(null)
// //   const [isLoading, setIsLoading] = useState(true)
// //   const [newAttempt, setNewAttempt] = useState({
// //     contactMethod: 'Call' as 'Email' | 'SMS' | 'WhatsApp' | 'Call' | 'In Person',
// //     response: 'No Response' as 'Positive' | 'Negative' | 'No Response',
// //     notes: ''
// //   })
// //   const [status, setStatus] = useState<FollowUp['status']>('Pending')
// //   const [nextFollowUpDate, setNextFollowUpDate] = useState('')
  
// //   useEffect(() => {
// //     const fetchFollowUpData = async () => {
// //       try {
// //         setIsLoading(true)
        
// //         // In a real implementation, you would fetch actual data from your API
// //         // This is just simulating the API response
// //         await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
        
// //         // Mock data
// //         const mockFollowUp: FollowUp = {
// //           _id: params.id,
// //           personType: Math.random() > 0.5 ? 'New Attendee' : 'Member',
// //           personName: 'John Smith',
// //           personEmail: 'john.smith@example.com',
// //           personPhone: '+1234567890',
// //           status: 'In Progress',
// //           assignedTo: {
// //             _id: 'user1',
// //             email: 'pastor@church.org'
// //           },
// //           nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString(),
// //           attempts: [
// //             {
// //               attemptNumber: 1,
// //               date: new Date(Date.now() - 7 * 86400000).toISOString(),
// //               contactMethod: 'Call',
// //               response: 'No Response',
// //               notes: 'Called but no answer. Left voicemail.',
// //               conductedBy: {
// //                 _id: 'user1',
// //                 email: 'pastor@church.org'
// //               }
// //             },
// //             {
// //               attemptNumber: 2,
// //               date: new Date(Date.now() - 3 * 86400000).toISOString(),
// //               contactMethod: 'SMS',
// //               response: 'Positive',
// //               notes: 'Responded to text message. Will try to attend next service.',
// //               conductedBy: {
// //                 _id: 'user1',
// //                 email: 'pastor@church.org'
// //               }
// //             }
// //           ],
// //           eventDetails: {
// //             eventName: 'Sunday Service',
// //             eventDate: new Date(Date.now() - 14 * 86400000).toISOString()
// //           },
// //           notes: 'First-time visitor. Seemed interested in small groups.',
// //           createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
// //         }
        
// //         setFollowUp(mockFollowUp)
// //         setStatus(mockFollowUp.status)
        
// //         if (mockFollowUp.nextFollowUpDate) {
// //           setNextFollowUpDate(new Date(mockFollowUp.nextFollowUpDate).toISOString().split('T')[0])
// //         }
// //       } catch (error) {
// //         console.error("Error fetching follow-up:", error)
// //         toast({
// //           title: "Error",
// //           description: "Failed to load follow-up data. Please try again.",
// //           variant: "destructive",
// //         })
// //       } finally {
// //         setIsLoading(false)
// //       }
// //     };
    
// //     fetchFollowUpData();
// //   }, [params.id, toast]);
  
// //   const handleStatusChange = (newStatus: string) => {
// //     setStatus(newStatus as FollowUp['status'])
// //   }
  
// //   const handleNewAttemptChange = (field: keyof typeof newAttempt, value: string) => {
// //     setNewAttempt(prev => ({
// //       ...prev,
// //       [field]: value
// //     }))
// //   }
  
// //   const handleSubmitAttempt = async (e: React.FormEvent) => {
// //     e.preventDefault()
    
// //     if (!newAttempt.notes) {
// //       toast({
// //         title: "Missing information",
// //         description: "Please provide notes about the follow-up attempt",
// //         variant: "destructive",
// //       })
// //       return
// //     }
    
// //     try {
// //       // In a real implementation, you would send data to your API
// //       // This is just simulating the API call
// //       setIsLoading(true)
// //       await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
// //       // Update local state to simulate successful save
// //       if (followUp) {
// //         const newAttemptNumber = followUp.attempts.length + 1
// //         const newAttemptData: FollowUpAttempt = {
// //           attemptNumber: newAttemptNumber,
// //           date: new Date().toISOString(),
// //           contactMethod: newAttempt.contactMethod,
// //           response: newAttempt.response,
// //           notes: newAttempt.notes,
// //           conductedBy: {
// //             _id: 'user1',
// //             email: 'pastor@church.org' // In a real app, this would be the current user
// //           }
// //         }
        
// //         setFollowUp({
// //           ...followUp,
// //           attempts: [...followUp.attempts, newAttemptData],
// //           status: status,
// //           nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined
// //         })
        
// //         // Reset the form
// //         setNewAttempt({
// //           contactMethod: 'Call',
// //           response: 'No Response',
// //           notes: ''
// //         })
        
// //         toast({
// //           title: "Success",
// //           description: "Follow-up attempt recorded successfully",
// //         })
// //       }
// //     } catch (error) {
// //       console.error("Error saving follow-up attempt:", error)
// //       toast({
// //         title: "Error",
// //         description: "Failed to save follow-up attempt. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }
  
// //   const handleSaveChanges = async () => {
// //     try {
// //       // In a real implementation, you would send data to your API
// //       // This is just simulating the API call
// //       setIsLoading(true)
// //       await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
// //       // Update local state to simulate successful save
// //       if (followUp) {
// //         setFollowUp({
// //           ...followUp,
// //           status: status,
// //           nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined
// //         })
        
// //         toast({
// //           title: "Success",
// //           description: "Follow-up details updated successfully",
// //         })
// //       }
// //     } catch (error) {
// //       console.error("Error updating follow-up:", error)
// //       toast({
// //         title: "Error",
// //         description: "Failed to update follow-up details. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }
  
// //   const getStatusIcon = (status: FollowUp['status']) => {
// //     switch (status) {
// //       case 'Completed':
// //         return <CheckCircle className="h-4 w-4 text-green-500" />
// //       case 'Failed':
// //         return <XCircle className="h-4 w-4 text-red-500" />
// //       case 'In Progress':
// //         return <Clock className="h-4 w-4 text-blue-500" />
// //       case 'Pending':
// //         return <AlertCircle className="h-4 w-4 text-yellow-500" />
// //     }
// //   }
  
// //   const getResponseIcon = (response: FollowUpAttempt['response']) => {
// //     switch (response) {
// //       case 'Positive':
// //         return <CheckCircle className="h-4 w-4 text-green-500" />
// //       case 'Negative':
// //         return <XCircle className="h-4 w-4 text-red-500" />
// //       case 'No Response':
// //         return <AlertCircle className="h-4 w-4 text-yellow-500" />
// //     }
// //   }
  
// //   if (isLoading && !followUp) {
// //     return (
// //       <div className="flex items-center justify-center h-full py-16">
// //         <div className="text-center">
// //           <h2 className="text-xl font-medium mb-2">Loading follow-up details...</h2>
// //           <p className="text-gray-500">Please wait while we fetch the data.</p>
// //         </div>
// //       </div>
// //     )
// //   }
  
// //   if (!followUp) {
// //     return (
// //       <div className="flex items-center justify-center h-full py-16">
// //         <div className="text-center">
// //           <h2 className="text-xl font-medium mb-2">Follow-up not found</h2>
// //           <p className="text-gray-500 mb-4">The requested follow-up record could not be found.</p>
// //           <Button asChild>
// //             <Link href="/follow-ups">Back to Follow-ups</Link>
// //           </Button>
// //         </div>
// //       </div>
// //     )
// //   }
  
// //   return (
// //     <div className="space-y-6">
// //       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// //         <div className="flex items-center">
// //           <Button variant="ghost" size="icon" className="mr-2" asChild>
// //             <Link href="/follow-ups">
// //               <ArrowLeft className="h-5 w-5" />
// //             </Link>
// //           </Button>
// //           <h1 className="text-2xl font-bold tracking-tight">Follow-up Details</h1>
// //         </div>
// //         <Badge className={`${getStatusColor(followUp.status)} text-base px-3 py-1`}>
// //           {getStatusIcon(followUp.status)}
// //           <span className="ml-1">{followUp.status}</span>
// //         </Badge>
// //       </div>
      
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //         <div className="md:col-span-1">
// //           <Card>
// //             <CardHeader>
// //               <CardTitle>Person Details</CardTitle>
// //               <CardDescription>Information about the person being followed up</CardDescription>
// //             </CardHeader>
// //             <CardContent className="space-y-4">
// //               <div className="flex items-center gap-3">
// //                 <Avatar className="h-12 w-12">
// //                   <AvatarFallback>{getInitials(followUp.personName, "")}</AvatarFallback>
// //                 </Avatar>
// //                 <div>
// //                   <h3 className="font-medium text-lg">{followUp.personName}</h3>
// //                   <Badge variant="outline">{followUp.personType}</Badge>
// //                 </div>
// //               </div>
              
// //               <Separator />
              
// //               <div className="space-y-3">
// //                 {followUp.personEmail && (
// //                   <div className="flex items-center gap-2">
// //                     <Mail className="h-4 w-4 text-gray-500" />
// //                     <span>{followUp.personEmail}</span>
// //                   </div>
// //                 )}
// //                 <div className="flex items-center gap-2">
// //                   <Phone className="h-4 w-4 text-gray-500" />
// //                   <span>{followUp.personPhone}</span>
// //                 </div>
// //                 <div className="flex items-center gap-2">
// //                   <User className="h-4 w-4 text-gray-500" />
// //                   <span>Assigned to: {followUp.assignedTo.email}</span>
// //                 </div>
// //                 <div className="flex items-center gap-2">
// //                   <Calendar className="h-4 w-4 text-gray-500" />
// //                   <span>Created: {formatDate(new Date(followUp.createdAt))}</span>
// //                 </div>
// //               </div>
              
// //               {followUp.eventDetails && (
// //                 <>
// //                   <Separator />
// //                   <div>
// //                     <h4 className="font-medium mb-2">Event Details</h4>
// //                     <p className="text-sm">
// //                       <strong>Event:</strong> {followUp.eventDetails.eventName}
// //                     </p>
// //                     <p className="text-sm">
// //                       <strong>Date:</strong> {formatDate(new Date(followUp.eventDetails.eventDate))}
// //                     </p>
// //                   </div>
// //                 </>
// //               )}
              
// //               {followUp.notes && (
// //                 <>
// //                   <Separator />
// //                   <div>
// //                     <h4 className="font-medium mb-2">Notes</h4>
// //                     <p className="text-sm">{followUp.notes}</p>
// //                   </div>
// //                 </>
// //               )}
// //             </CardContent>
// //           </Card>
// //         </div>
        
// //         <div className="md:col-span-2">
// //           <Tabs defaultValue="attempts">
// //             <TabsList className="grid grid-cols-2 mb-4">
// //               <TabsTrigger value="attempts">Past Attempts</TabsTrigger>
// //               <TabsTrigger value="new">New Attempt</TabsTrigger>
// //             </TabsList>
            
// //             <TabsContent value="attempts" className="space-y-4">
// //               <Card>
// //                 <CardHeader>
// //                   <CardTitle>Follow-up Attempts</CardTitle>
// //                   <CardDescription>History of past follow-up attempts</CardDescription>
// //                 </CardHeader>
// //                 <CardContent>
// //                   {followUp.attempts.length === 0 ? (
// //                     <div className="text-center py-8">
// //                       <p className="text-gray-500">No follow-up attempts recorded yet.</p>
// //                     </div>
// //                   ) : (
// //                     <div className="space-y-6">
// //                       {followUp.attempts.map((attempt) => (
// //                         <div key={attempt.attemptNumber} className="border rounded-md p-4">
// //                           <div className="flex justify-between items-start mb-3">
// //                             <div>
// //                               <h4 className="font-medium">Attempt #{attempt.attemptNumber}</h4>
// //                               <p className="text-sm text-gray-500">
// //                                 {formatDate(new Date(attempt.date))}
// //                               </p>
// //                             </div>
// //                             <Badge className={`flex items-center gap-1 ${
// //                               attempt.response === "Positive" 
// //                                 ? "bg-green-100 text-green-800" 
// //                                 : attempt.response === "Negative"
// //                                   ? "bg-red-100 text-red-800"
// //                                   : "bg-yellow-100 text-yellow-800"
// //                             }`}>
// //                               {getResponseIcon(attempt.response)}
// //                               <span>{attempt.response}</span>
// //                             </Badge>
// //                           </div>
                          
// //                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
// //                             <div>
// //                               <p className="text-sm font-medium">Contact Method</p>
// //                               <p className="text-sm">{attempt.contactMethod}</p>
// //                             </div>
// //                             <div>
// //                               <p className="text-sm font-medium">Conducted By</p>
// //                               <p className="text-sm">{attempt.conductedBy.email}</p>
// //                             </div>
// //                           </div>
                          
// //                           <div>
// //                             <p className="text-sm font-medium">Notes</p>
// //                             <p className="text-sm">{attempt.notes || "No notes provided."}</p>
// //                           </div>
// //                         </div>
// //                       ))}
// //                     </div>
// //                   )}
// //                 </CardContent>
// //               </Card>
              
// //               <Card>
// //                 <CardHeader>
// //                   <CardTitle>Update Status</CardTitle>
// //                   <CardDescription>Update the follow-up status and next scheduled date</CardDescription>
// //                 </CardHeader>
// //                 <CardContent>
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div className="space-y-2">
// //                       <Label htmlFor="status">Status</Label>
// //                       <Select value={status} onValueChange={handleStatusChange}>
// //                         <SelectTrigger id="status">
// //                           <SelectValue placeholder="Select status" />
// //                         </SelectTrigger>
// //                         <SelectContent>
// //                           <SelectItem value="Pending">Pending</SelectItem>
// //                           <SelectItem value="In Progress">In Progress</SelectItem>
// //                           <SelectItem value="Completed">Completed</SelectItem>
// //                           <SelectItem value="Failed">Failed</SelectItem>
// //                         </SelectContent>
// //                       </Select>
// //                     </div>
                    
// //                     <div className="space-y-2">
// //                       <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
// //                       <Input
// //                         id="nextFollowUpDate"
// //                         type="date"
// //                         value={nextFollowUpDate}
// //                         onChange={(e) => setNextFollowUpDate(e.target.value)}
// //                       />
// //                     </div>
// //                   </div>
// //                 </CardContent>
// //                 <CardFooter>
// //                   <Button onClick={handleSaveChanges} disabled={isLoading}>
// //                     <Edit className="mr-2 h-4 w-4" />
// //                     Save Changes
// //                   </Button>
// //                 </CardFooter>
// //               </Card>
// //             </TabsContent>
            
// //             <TabsContent value="new">
// //               <Card>
// //                 <CardHeader>
// //                   <CardTitle>Record New Follow-up Attempt</CardTitle>
// //                   <CardDescription>Document a new communication with this person</CardDescription>
// //                 </CardHeader>
// //                 <CardContent>
// //                   <form onSubmit={handleSubmitAttempt} className="space-y-4">
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                       <div className="space-y-2">
// //                         <Label htmlFor="contactMethod">Contact Method</Label>
// //                         <Select 
// //                           value={newAttempt.contactMethod} 
// //                           onValueChange={(value) => handleNewAttemptChange('contactMethod', value)}
// //                         >
// //                           <SelectTrigger id="contactMethod">
// //                             <SelectValue placeholder="Select method" />
// //                           </SelectTrigger>
// //                           <SelectContent>
// //                             <SelectItem value="Call">Call</SelectItem>
// //                             <SelectItem value="SMS">SMS</SelectItem>
// //                             <SelectItem value="WhatsApp">WhatsApp</SelectItem>
// //                             <SelectItem value="Email">Email</SelectItem>
// //                             <SelectItem value="In Person">In Person</SelectItem>
// //                           </SelectContent>
// //                         </Select>
// //                       </div>
                      
// //                       <div className="space-y-2">
// //                         <Label htmlFor="response">Response</Label>
// //                         <Select 
// //                           value={newAttempt.response} 
// //                           onValueChange={(value) => handleNewAttemptChange('response', value)}
// //                         >
// //                           <SelectTrigger id="response">
// //                             <SelectValue placeholder="Select response" />
// //                           </SelectTrigger>
// //                           <SelectContent>
// //                             <SelectItem value="Positive">Positive</SelectItem>
// //                             <SelectItem value="Negative">Negative</SelectItem>
// //                             <SelectItem value="No Response">No Response</SelectItem>
// //                           </SelectContent>
// //                         </Select>
// //                       </div>
// //                     </div>
                    
// //                     <div className="space-y-2">
// //                       <Label htmlFor="notes">Notes</Label>
// //                       <Textarea
// //                         id="notes"
// //                         placeholder="Describe the interaction details..."
// //                         value={newAttempt.notes}
// //                         onChange={(e) => handleNewAttemptChange('notes', e.target.value)}
// //                         rows={5}
// //                       />
// //                     </div>
                    
// //                     <div className="flex gap-2">
// //                       <Button 
// //                         type="submit" 
// //                         disabled={isLoading || !newAttempt.notes}
// //                       >
// //                         <Send className="mr-2 h-4 w-4" />
// //                         Record Attempt
// //                       </Button>
                      
// //                       <Button
// //                         type="button"
// //                         variant="outline"
// //                         onClick={() => {
// //                           // In a real app, this would generate a follow-up message template
// //                           toast({
// //                             title: "Template generated",
// //                             description: "Follow-up message template copied to clipboard.",
// //                           })
// //                         }}
// //                       >
// //                         <Clipboard className="mr-2 h-4 w-4" />
// //                         Generate Template
// //                       </Button>
// //                     </div>
// //                   </form>
// //                 </CardContent>
// //               </Card>
// //             </TabsContent>
// //           </Tabs>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // // app/(dashboard)/follow-ups/page.tsx
// // "use client"

// // import { useState, useEffect } from "react"
// // import Link from "next/link"
// // import { useRouter, useSearchParams } from "next/navigation"
// // import { 
// //   Table, 
// //   TableBody, 
// //   TableCell, 
// //   TableHead, 
// //   TableHeader, 
// //   TableRow 
// // } from "@/components/ui/table"
// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"
// // import { 
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// // import { Pagination } from "@/components/ui/pagination"
// // import { Badge } from "@/components/ui/badge"
// // import { Search, Plus, Filter, UserCheck, ChevronRight, X, Mail, Phone } from "lucide-react"
// // import { useToast } from "@/hooks/use-toast"
// // import { formatDate, getInitials, getStatusColor } from "@/lib/utils"

// // interface FollowUp {
// //   _id: string
// //   personType: 'New Attendee' | 'Member'
// //   personName: string
// //   personEmail?: string
// //   personPhone: string
// //   status: 'Pending' | 'In Progress' | 'Completed' | 'Failed'
// //   assignedTo: {
// //     _id: string;
// //     email: string;
// //   }
// //   nextFollowUpDate?: string
// //   createdAt: string
// // }

// // interface PaginationInfo {
// //   page: number
// //   limit: number
// //   total: number
// //   pages: number
// // }

// // export default function FollowUpsPage() {
// //   const router = useRouter()
// //   const searchParams = useSearchParams()
// //   const { toast } = useToast()
  
// //   const [followUps, setFollowUps] = useState<FollowUp[]>([])
// //   const [pagination, setPagination] = useState<PaginationInfo>({
// //     page: 1,
// //     limit: 10,
// //     total: 0,
// //     pages: 0,
// //   })
// //   const [isLoading, setIsLoading] = useState(true)
// //   const [searchTerm, setSearchTerm] = useState("")
// //   const [filters, setFilters] = useState({
// //     status: "",
// //     personType: "",
// //     assignedTo: "",
// //   })
  
// //   useEffect(() => {
// //     const page = parseInt(searchParams.get("page") || "1")
// //     const search = searchParams.get("search") || ""
// //     const status = searchParams.get("status") || ""
// //     const personType = searchParams.get("personType") || ""
// //     const assignedTo = searchParams.get("assignedTo") || ""
    
// //     setSearchTerm(search)
// //     setFilters({
// //       status,
// //       personType,
// //       assignedTo,
// //     })
    
// //     fetchFollowUps(page, search, status, personType, assignedTo)
// //   }, [searchParams])

// //   const fetchFollowUps = async (
// //     page: number, 
// //     search: string, 
// //     status: string, 
// //     personType: string, 
// //     assignedTo: string
// //   ) => {
// //     try {
// //       setIsLoading(true)
      
// //       // Build query string
// //       let queryParams = new URLSearchParams()
// //       queryParams.append("page", page.toString())
// //       queryParams.append("limit", pagination.limit.toString())
      
// //       if (search) queryParams.append("search", search)
// //       if (status) queryParams.append("status", status)
// //       if (personType) queryParams.append("personType", personType)
// //       if (assignedTo) queryParams.append("assignedTo", assignedTo)
      
// //       // In a real implementation, you would fetch actual data from your API
// //       // This is just simulating the API response
// //       await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
// //       // Mock data
// //       const mockFollowUps: FollowUp[] = Array.from({ length: 10 }).map((_, i) => ({
// //         _id: `followup${i + 1}`,
// //         personType: i % 2 === 0 ? 'New Attendee' : 'Member',
// //         personName: `Person ${i + 1}`,
// //         personEmail: `person${i + 1}@example.com`,
// //         personPhone: `+1234567890${i}`,
// //         status: ['Pending', 'In Progress', 'Completed', 'Failed'][i % 4] as any,
// //         assignedTo: {
// //           _id: 'user1',
// //           email: 'user@example.com'
// //         },
// //         nextFollowUpDate: i % 3 === 0 ? new Date(Date.now() + 86400000 * (i + 1)).toISOString() : undefined,
// //         createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
// //       }))
      
// //       setFollowUps(mockFollowUps)
// //       setPagination({
// //         page,
// //         limit: 10,
// //         total: 35, // Mock total
// //         pages: 4,  // Mock pages
// //       })
// //     } catch (error) {
// //       console.error("Error fetching follow-ups:", error)
// //       toast({
// //         title: "Error",
// //         description: "Failed to load follow-ups data. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   const handleSearch = (e: React.FormEvent) => {
// //     e.preventDefault()
// //     updateUrlParams({ search: searchTerm, page: 1 })
// //   }

// //   const handleFilterChange = (key: string, value: string) => {
// //     setFilters(prev => ({ ...prev, [key]: value }))
// //     updateUrlParams({ [key]: value, page: 1 })
// //   }

// //   const clearFilters = () => {
// //     setFilters({
// //       status: "",
// //       personType: "",
// //       assignedTo: "",
// //     })
// //     setSearchTerm("")
// //     router.push("/dashboard/follow-ups")
// //   }

// //   const updateUrlParams = (params: Record<string, any>) => {
// //     const newParams = new URLSearchParams(searchParams.toString())
    
// //     Object.entries(params).forEach(([key, value]) => {
// //       if (value) {
// //         newParams.set(key, value.toString())
// //       } else {
// //         newParams.delete(key)
// //       }
// //     })
    
// //     router.push(`/dashboard/follow-ups?${newParams.toString()}`)
// //   }

// //   const handlePageChange = (page: number) => {
// //     updateUrlParams({ page })
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex items-center justify-between">
// //         <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
// //         <Button asChild>
// //           <Link href="/dashboard/follow-ups/new">
// //             <Plus className="mr-2 h-4 w-4" /> New Follow-up
// //           </Link>
// //         </Button>
// //       </div>
      
// //       <Card>
// //         <CardHeader className="pb-3">
// //           <CardTitle>Follow-up Management</CardTitle>
// //         </CardHeader>
// //         <CardContent>
// //           <div className="space-y-4">
// //             <div className="flex flex-col sm:flex-row gap-2">
// //               <form onSubmit={handleSearch} className="flex gap-2 flex-1">
// //                 <div className="relative flex-1">
// //                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
// //                   <Input
// //                     type="search"
// //                     placeholder="Search by name, email, or phone..."
// //                     className="pl-8"
// //                     value={searchTerm}
// //                     onChange={(e) => setSearchTerm(e.target.value)}
// //                   />
// //                 </div>
// //                 <Button type="submit">Search</Button>
// //               </form>
              
// //               <div className="flex items-center gap-2">
// //                 <Select
// //                   value={filters.status}
// //                   onValueChange={(value) => handleFilterChange("status", value)}
// //                 >
// //                   <SelectTrigger className="w-[180px]">
// //                     <SelectValue placeholder="Status" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="">All Statuses</SelectItem>
// //                     <SelectItem value="Pending">Pending</SelectItem>
// //                     <SelectItem value="In Progress">In Progress</SelectItem>
// //                     <SelectItem value="Completed">Completed</SelectItem>
// //                     <SelectItem value="Failed">Failed</SelectItem>
// //                   </SelectContent>
// //                 </Select>
                
// //                 <Select
// //                   value={filters.personType}
// //                   onValueChange={(value) => handleFilterChange("personType", value)}
// //                 >
// //                   <SelectTrigger className="w-[180px]">
// //                     <SelectValue placeholder="Person Type" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="">All Types</SelectItem>
// //                     <SelectItem value="New Attendee">New Attendee</SelectItem>
// //                     <SelectItem value="Member">Member</SelectItem>
// //                   </SelectContent>
// //                 </Select>
                
// //                 <Button
// //                   variant="outline"
// //                   size="icon"
// //                   onClick={clearFilters}
// //                   title="Clear filters"
// //                 >
// //                   <X className="h-4 w-4" />
// //                 </Button>
// //               </div>
// //             </div>
            
// //             {(searchTerm || filters.status || filters.personType) && (
// //               <div className="flex flex-wrap gap-2">
// //                 {searchTerm && (
// //                   <Badge variant="secondary" className="flex items-center gap-1">
// //                     Search: {searchTerm}
// //                     <Button
// //                       variant="ghost"
// //                       size="icon"
// //                       className="h-4 w-4 p-0 ml-1"
// //                       onClick={() => {
// //                         setSearchTerm("")
// //                         updateUrlParams({ search: "" })
// //                       }}
// //                     >
// //                       <X className="h-3 w-3" />
// //                     </Button>
// //                   </Badge>
// //                 )}
                
// //                 {filters.status && (
// //                   <Badge variant="secondary" className="flex items-center gap-1">
// //                     Status: {filters.status}
// //                     <Button
// //                       variant="ghost"
// //                       size="icon"
// //                       className="h-4 w-4 p-0 ml-1"
// //                       onClick={() => handleFilterChange("status", "")}
// //                     >
// //                       <X className="h-3 w-3" />
// //                     </Button>
// //                   </Badge>
// //                 )}
                
// //                 {filters.personType && (
// //                   <Badge variant="secondary" className="flex items-center gap-1">
// //                     Type: {filters.personType}
// //                     <Button
// //                       variant="ghost"
// //                       size="icon"
// //                       className="h-4 w-4 p-0 ml-1"
// //                       onClick={() => handleFilterChange("personType", "")}
// //                     >
// //                       <X className="h-3 w-3" />
// //                     </Button>
// //                   </Badge>
// //                 )}
// //               </div>
// //             )}
            
// //             <div className="rounded-md border">
// //               <Table>
// //                 <TableHeader>
// //                   <TableRow>
// //                     <TableHead>Person</TableHead>
// //                     <TableHead>Contact</TableHead>
// //                     <TableHead>Status</TableHead>
// //                     <TableHead>Assigned To</TableHead>
// //                     <TableHead>Next Follow-up</TableHead>
// //                     <TableHead>Actions</TableHead>
// //                   </TableRow>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {isLoading ? (
// //                     <TableRow>
// //                       <TableCell colSpan={6} className="text-center py-10">
// //                         Loading follow-ups...
// //                       </TableCell>
// //                     </TableRow>
// //                   ) : followUps.length === 0 ? (
// //                     <TableRow>
// //                       <TableCell colSpan={6} className="text-center py-10">
// //                         No follow-ups found. Try adjusting your search or filters.
// //                       </TableCell>
// //                     </TableRow>
// //                   ) : (
// //                     followUps.map((followUp) => (
// //                       <TableRow key={followUp._id}>
// //                         <TableCell>
// //                           <div className="flex items-center gap-2">
// //                             <Avatar className="h-8 w-8">
// //                               <AvatarFallback>{getInitials(followUp.personName, "")}</AvatarFallback>
// //                             </Avatar>
// //                             <div>
// //                               <p className="font-medium">{followUp.personName}</p>
// //                               <Badge variant="outline">{followUp.personType}</Badge>
// //                             </div>
// //                           </div>
// //                         </TableCell>
// //                         <TableCell>
// //                           <div className="flex flex-col space-y-1">
// //                             {followUp.personEmail && (
// //                               <div className="flex items-center gap-1">
// //                                 <Mail className="h-3 w-3 text-gray-500" />
// //                                 <span className="text-sm">{followUp.personEmail}</span>
// //                               </div>
// //                             )}
// //                             <div className="flex items-center gap-1">
// //                               <Phone className="h-3 w-3 text-gray-500" />
// //                               <span className="text-sm">{followUp.personPhone}</span>
// //                             </div>
// //                           </div>
// //                         </TableCell>
// //                         <TableCell>
// //                           <Badge className={getStatusColor(followUp.status)}>
// //                             {followUp.status}
// //                           </Badge>
// //                         </TableCell>
// //                         <TableCell>
// //                           <span className="text-sm">{followUp.assignedTo.email}</span>
// //                         </TableCell>
// //                         <TableCell>
// //                           {followUp.nextFollowUpDate ? (
// //                             formatDate(new Date(followUp.nextFollowUpDate))
// //                           ) : (
// //                             <span className="text-gray-500">Not scheduled</span>
// //                           )}
// //                         </TableCell>
// //                         <TableCell>
// //                           <div className="flex items-center gap-2">
// //                             <Button variant="ghost" size="icon" asChild>
// //                               <Link href={`/dashboard/follow-ups/${followUp._id}`}>
// //                                 <ChevronRight className="h-4 w-4" />
// //                               </Link>
// //                             </Button>
// //                           </div>
// //                         </TableCell>
// //                       </TableRow>
// //                     ))
// //                   )}
// //                 </TableBody>
// //               </Table>
// //             </div>
            
// //             <Pagination
// //               currentPage={pagination.page}
// //               totalPages={pagination.pages}
// //               onPageChange={handlePageChange}
// //             />
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   )
// // }

// //app\(dashboard)\follow-ups\page.tsx

// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { useRouter, useSearchParams } from "next/navigation"
// import { 
//   Table, 
//   TableBody, 
//   TableCell, 
//   TableHead, 
//   TableHeader, 
//   TableRow 
// } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { Pagination } from "@/components/ui/pagination"
// import { Badge } from "@/components/ui/badge"
// import { Search, Plus, Filter, UserCheck, ChevronRight, X, Mail, Phone } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { formatDate, getInitials, getStatusColor } from "@/lib/utils"

// interface FollowUp {
//   _id: string
//   personType: 'New Attendee' | 'Member'
//   personName: string
//   personEmail?: string
//   personPhone: string
//   status: 'Pending' | 'In Progress' | 'Completed' | 'Failed'
//   assignedTo: {
//     _id: string;
//     email: string;
//   }
//   nextFollowUpDate?: string
//   createdAt: string
// }

// interface PaginationInfo {
//   page: number
//   limit: number
//   total: number
//   pages: number
// }

// export default function FollowUpsPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { toast } = useToast()
  
//   const [followUps, setFollowUps] = useState<FollowUp[]>([])
//   const [pagination, setPagination] = useState<PaginationInfo>({
//     page: 1,
//     limit: 10,
//     total: 0,
//     pages: 0,
//   })
//   const [isLoading, setIsLoading] = useState(true)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [filters, setFilters] = useState({
//     status: "",
//     personType: "",
//     assignedTo: "",
//   })
  
//   useEffect(() => {
//     const page = parseInt(searchParams.get("page") || "1")
//     const search = searchParams.get("search") || ""
//     const status = searchParams.get("status") || ""
//     const personType = searchParams.get("personType") || ""
//     const assignedTo = searchParams.get("assignedTo") || ""
    
//     setSearchTerm(search)
//     setFilters({
//       status,
//       personType,
//       assignedTo,
//     })
    
//     fetchFollowUps(page, search, status, personType, assignedTo)
//   }, [searchParams])

//   const fetchFollowUps = async (
//     page: number, 
//     search: string, 
//     status: string, 
//     personType: string, 
//     assignedTo: string
//   ) => {
//     try {
//       setIsLoading(true)
      
//       // Build query string
//       let queryParams = new URLSearchParams()
//       queryParams.append("page", page.toString())
//       queryParams.append("limit", pagination.limit.toString())
      
//       if (search) queryParams.append("search", search)
//       if (status) queryParams.append("status", status)
//       if (personType) queryParams.append("personType", personType)
//       if (assignedTo) queryParams.append("assignedTo", assignedTo)
      
//       // In a real implementation, you would fetch actual data from your API
//       // This is just simulating the API response
//       await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
//       // Mock data
//       const mockFollowUps: FollowUp[] = Array.from({ length: 10 }).map((_, i) => ({
//         _id: `followup${i + 1}`,
//         personType: i % 2 === 0 ? 'New Attendee' : 'Member',
//         personName: `Person ${i + 1}`,
//         personEmail: `person${i + 1}@example.com`,
//         personPhone: `+1234567890${i}`,
//         status: ['Pending', 'In Progress', 'Completed', 'Failed'][i % 4] as any,
//         assignedTo: {
//           _id: 'user1',
//           email: 'user@example.com'
//         },
//         nextFollowUpDate: i % 3 === 0 ? new Date(Date.now() + 86400000 * (i + 1)).toISOString() : undefined,
//         createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
//       }))
      
//       setFollowUps(mockFollowUps)
//       setPagination({
//         page,
//         limit: 10,
//         total: 35, // Mock total
//         pages: 4,  // Mock pages
//       })
//     } catch (error) {
//       console.error("Error fetching follow-ups:", error)
//       toast({
//         title: "Error",
//         description: "Failed to load follow-ups data. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault()
//     updateUrlParams({ search: searchTerm, page: 1 })
//   }

//   const handleFilterChange = (key: string, value: string) => {
//     // If "all" is selected, treat it as an empty string in the state and URL
//     const actualValue = value === "all" ? "" : value
    
//     setFilters(prev => ({ ...prev, [key]: actualValue }))
    
//     // Update URL parameters - remove the parameter if value is "all"
//     if (value === "all") {
//       const newParams = new URLSearchParams(searchParams.toString())
//       newParams.delete(key)
//       newParams.set("page", "1")
//       router.push(`/dashboard/follow-ups?${newParams.toString()}`)
//     } else {
//       updateUrlParams({ [key]: value, page: 1 })
//     }
//   }

//   const clearFilters = () => {
//     setFilters({
//       status: "",
//       personType: "",
//       assignedTo: "",
//     })
//     setSearchTerm("")
//     router.push("/dashboard/follow-ups")
//   }

//   const updateUrlParams = (params: Record<string, any>) => {
//     const newParams = new URLSearchParams(searchParams.toString())
    
//     Object.entries(params).forEach(([key, value]) => {
//       if (value) {
//         newParams.set(key, value.toString())
//       } else {
//         newParams.delete(key)
//       }
//     })
    
//     router.push(`/dashboard/follow-ups?${newParams.toString()}`)
//   }

//   const handlePageChange = (page: number) => {
//     updateUrlParams({ page })
//   }

//   // Helper to get the select value (handles the "all" case)
//   const getSelectValue = (value: string) => {
//     return value || "all"
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
//         <Button asChild>
//           <Link href="/dashboard/follow-ups/new">
//             <Plus className="mr-2 h-4 w-4" /> New Follow-up
//           </Link>
//         </Button>
//       </div>
      
//       <Card>
//         <CardHeader className="pb-3">
//           <CardTitle>Follow-up Management</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex flex-col sm:flex-row gap-2">
//               <form onSubmit={handleSearch} className="flex gap-2 flex-1">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
//                   <Input
//                     type="search"
//                     placeholder="Search by name, email, or phone..."
//                     className="pl-8"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//                 <Button type="submit">Search</Button>
//               </form>
              
//               <div className="flex items-center gap-2">
//                 <Select
//                   value={getSelectValue(filters.status)}
//                   onValueChange={(value) => handleFilterChange("status", value)}
//                 >
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Statuses</SelectItem>
//                     <SelectItem value="Pending">Pending</SelectItem>
//                     <SelectItem value="In Progress">In Progress</SelectItem>
//                     <SelectItem value="Completed">Completed</SelectItem>
//                     <SelectItem value="Failed">Failed</SelectItem>
//                   </SelectContent>
//                 </Select>
                
//                 <Select
//                   value={getSelectValue(filters.personType)}
//                   onValueChange={(value) => handleFilterChange("personType", value)}
//                 >
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Person Type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Types</SelectItem>
//                     <SelectItem value="New Attendee">New Attendee</SelectItem>
//                     <SelectItem value="Member">Member</SelectItem>
//                   </SelectContent>
//                 </Select>
                
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={clearFilters}
//                   title="Clear filters"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
            
//             {(searchTerm || filters.status || filters.personType) && (
//               <div className="flex flex-wrap gap-2">
//                 {searchTerm && (
//                   <Badge variant="secondary" className="flex items-center gap-1">
//                     Search: {searchTerm}
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-4 w-4 p-0 ml-1"
//                       onClick={() => {
//                         setSearchTerm("")
//                         updateUrlParams({ search: "" })
//                       }}
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                   </Badge>
//                 )}
                
//                 {filters.status && (
//                   <Badge variant="secondary" className="flex items-center gap-1">
//                     Status: {filters.status}
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-4 w-4 p-0 ml-1"
//                       onClick={() => handleFilterChange("status", "all")}
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                   </Badge>
//                 )}
                
//                 {filters.personType && (
//                   <Badge variant="secondary" className="flex items-center gap-1">
//                     Type: {filters.personType}
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-4 w-4 p-0 ml-1"
//                       onClick={() => handleFilterChange("personType", "all")}
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                   </Badge>
//                 )}
//               </div>
//             )}
            
//             <div className="rounded-md border">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Person</TableHead>
//                     <TableHead>Contact</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Assigned To</TableHead>
//                     <TableHead>Next Follow-up</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {isLoading ? (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center py-10">
//                         Loading follow-ups...
//                       </TableCell>
//                     </TableRow>
//                   ) : followUps.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={6} className="text-center py-10">
//                         No follow-ups found. Try adjusting your search or filters.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     followUps.map((followUp) => (
//                       <TableRow key={followUp._id}>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             <Avatar className="h-8 w-8">
//                               <AvatarFallback>{getInitials(followUp.personName, "")}</AvatarFallback>
//                             </Avatar>
//                             <div>
//                               <p className="font-medium">{followUp.personName}</p>
//                               <Badge variant="outline">{followUp.personType}</Badge>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex flex-col space-y-1">
//                             {followUp.personEmail && (
//                               <div className="flex items-center gap-1">
//                                 <Mail className="h-3 w-3 text-gray-500" />
//                                 <span className="text-sm">{followUp.personEmail}</span>
//                               </div>
//                             )}
//                             <div className="flex items-center gap-1">
//                               <Phone className="h-3 w-3 text-gray-500" />
//                               <span className="text-sm">{followUp.personPhone}</span>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <Badge className={getStatusColor(followUp.status)}>
//                             {followUp.status}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <span className="text-sm">{followUp.assignedTo.email}</span>
//                         </TableCell>
//                         <TableCell>
//                           {followUp.nextFollowUpDate ? (
//                             formatDate(new Date(followUp.nextFollowUpDate))
//                           ) : (
//                             <span className="text-gray-500">Not scheduled</span>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             <Button variant="ghost" size="icon" asChild>
//                               <Link href={`/dashboard/follow-ups/${followUp._id}`}>
//                                 <ChevronRight className="h-4 w-4" />
//                               </Link>
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
            
//             <Pagination
//               currentPage={pagination.page}
//               totalPages={pagination.pages}
//               onPageChange={handlePageChange}
//             />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


// app/(dashboard)/follow-ups/page.tsx - Main follow-up listing page
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Plus, ChevronRight, X, Mail, Phone, 
  Calendar, AlertCircle, CheckCircle, XCircle, Clock 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getInitials } from "@/lib/utils"

// WhatsApp Icon Component
const WhatsAppIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" />
    <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.695 1.447h.005c9.975 0 16.944-9.95 13.467-17.949-1.382-3.254-4.363-5.505-8.453-6.146C9.337-.329 3.708 2.868 1.364 8.93.359 11.177-.22 13.697.12 16.205c.124.895.33 1.77.572 2.625.493 1.73 2.283 1.03 2.773-.857.087-.334.167-.67.248-1.015.344-1.437-.24-1.68-1.223-2.647-.655-.642-.908-1.678-.543-2.647 2.611-6.9 12.25-7.836 17.622-2.399 2.91 2.94 2.84 9.042-.15 11.79-1.54 1.432-3.962.574-4.258-1.334-.203-1.297.27-2.588.774-3.906.283-.686.159-1.695-.15-2.094-.437-.462-1.13-.284-1.72-.076a10.8 10.8 0 0 0-2.935 1.574c-.947.673-1.946 1.324-2.698 2.229-.732.872-1.162 2.063-1.947 2.96-.49.559-1.248 1.348-1.986 1.613-.12.043-.21.074-.3.114-.82.403-1.27.36-1.402.24-.625-.547-.748-2.364-.748-2.364.943-5.309 8-4.27 10.949-2.341.217.145.447.313.68.495 1.088.856 2.13 1.77 2.419 3.136.275 1.296.26 2.612.065 3.038.977 1.605 1.55 2.708 1.55 4.35 0 5.356-5.244 9.78-11.663 9.78-2.068 0-4.077-.54-5.848-1.557L0 23.956l3.92-1.018a12.027 12.027 0 0 1-1.386-1.7c-3.858-6.144 1.006-13.324 3.205-15.36 1.222-1.128 5.907-4.197 10.463-2.913 5.75 1.62 7.88 5.04 8.015 9.992.184 6.637-5.394 9.548-5.758 9.777-.364.228-1.105.254-1.83-.35-1.069-1.496-1.878-3.294-2.412-5.072-.331-1.101-.391-2.165.047-3.197.33-.781.89-1.356 1.427-1.93.334-.36.61-.739.903-1.1.156-.226.322-.434.49-.627a.31.31 0 0 0 .088-.063c.192-.195.345-.362.463-.506.128-.155.23-.315.302-.488-.24.068-.483.14-.731.215-.474.147-1.095.284-1.471.284-.75 0-1.26-.436-1.743-.436a1.396 1.396 0 0 0-.513.101c-.147.054-.29.135-.437.214a7.796 7.796 0 0 0-1.81 1.367c-.138.155-.295.329-.442.49-.31.317-.607.65-.877 1.002-.121.195-.238.389-.346.588-.079.151-.156.304-.225.456a3.92 3.92 0 0 0-.155.378 4.7 4.7 0 0 0-.152.532c-.044.2-.07.402-.093.605a4.277 4.277 0 0 0-.031.534c.004.13.02.26.032.389.018.192.042.383.08.571.066.328.161.647.266.955.161.475.355.948.532 1.403.107.274.218.552.29.846.064.263.11.534.14.813.017.184.028.368.028.554 0 .071-.007.144-.01.216a7.764 7.764 0 0 1-.042.493c-.028.205-.069.406-.113.607-.055.24-.121.476-.2.708-.075.223-.16.44-.25.66-.105.249-.221.494-.345.735-.102.195-.207.387-.319.574-.11.184-.226.362-.345.54-.259.39-.544.758-.833 1.118-.196.245-.387.493-.591.733-.16.189-.313.383-.48.568-.354.391-.706.776-1.072 1.144-.64.64-1.331 1.224-2.079 1.735-.372.254-.754.491-1.145.717-.37.213-.747.414-1.132.599-.32.154-.645.301-.976.427-.153.059-.309.111-.464.166"   
      fill-rule="evenodd" clip-rule="evenodd"/>
  </svg>
);

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
  attempts: number;
  requiredAttempts: number;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function FollowUpsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    responseCategory: "",
    personType: "",
    assignedTo: "",
  });
  
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const responseCategory = searchParams.get("responseCategory") || "";
    const personType = searchParams.get("personType") || "";
    const assignedTo = searchParams.get("assignedTo") || "";
    
    setSearchTerm(search);
    setFilters({
      status,
      responseCategory,
      personType,
      assignedTo,
    });
    
    fetchFollowUps(page, search, status, responseCategory, personType, assignedTo);
  }, [searchParams, fetchFollowUps]);

  const fetchFollowUps = async (
    page: number, 
    search: string, 
    status: string, 
    responseCategory: string,
    personType: string, 
    assignedTo: string
  ) => {
    try {
      setIsLoading(true);
      
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", pagination.limit.toString());
      
      if (search) queryParams.append("search", search);
      if (status) queryParams.append("status", status);
      if (responseCategory) queryParams.append("responseCategory", responseCategory);
      if (personType) queryParams.append("personType", personType);
      if (assignedTo) queryParams.append("assignedTo", assignedTo);
      
      // In a real implementation, you would fetch actual data from your API
      // const response = await fetch(`/api/follow-ups?${queryParams.toString()}`);
      // const data = await response.json();
      
      // For demonstration purposes, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Fake loading delay
      
      // Mock data
      const mockFollowUps: FollowUp[] = Array.from({ length: 10 }).map((_, i) => ({
        _id: `followup${i + 1}`,
        personType: ['New Convert', 'New Attendee', 'Member'][i % 3] as any,
        personName: `Person ${i + 1}`,
        personEmail: `person${i + 1}@example.com`,
        personPhone: `+1234567890${i}`,
        personWhatsApp: i % 2 === 0 ? `+1234567890${i}` : undefined,
        status: ['Pending', 'In Progress', 'Completed', 'Failed'][i % 4] as any,
        responseCategory: ['Promising', 'Undecided', 'Cold'][i % 3] as any,
        assignedTo: {
          _id: 'user1',
          email: 'user@example.com'
        },
        nextFollowUpDate: i % 3 === 0 ? new Date(Date.now() + 86400000 * (i + 1)).toISOString() : undefined,
        attempts: i % 4 + 1,
        requiredAttempts: i % 2 === 0 ? 8 : 4,
        createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
      }));
      
      setFollowUps(mockFollowUps);
      setPagination({
        page,
        limit: 10,
        total: 35, // Mock total
        pages: 4,  // Mock pages
      });
    } catch (error: Error) {
      console.error("Error fetching follow-ups:", error);
      toast({
        title: "Error",
        description: "Failed to load follow-ups data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchTerm, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === "all" ? "" : value;
    
    setFilters(prev => ({ ...prev, [key]: actualValue }));
    
    if (value === "all") {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete(key);
      newParams.set("page", "1");
      router.push(`/follow-ups?${newParams.toString()}`);
    } else {
      updateUrlParams({ [key]: value, page: 1 });
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      responseCategory: "",
      personType: "",
      assignedTo: "",
    });
    setSearchTerm("");
    router.push("/follow-ups");
  };

  const updateUrlParams = (params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    
    router.push(`/follow-ups?${newParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
  };

  // Helper to get the select value (handles the "all" case)
  const getSelectValue = (value: string) => {
    return value || "all";
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Failed':
        return <XCircle className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Helper function to get status color based on response category
  const getStatusColor = (status: string, responseCategory: string) => {
    if (status === 'Completed') {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
    } else if (status === 'Failed') {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
    } else {
      // For pending and in progress, use response category
      switch (responseCategory) {
        case 'Promising': // Green - promising lead
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
        case 'Undecided': // Yellow - keep pursuing
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
        case 'Cold': // Red - do not pursue
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500";
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
        <Button asChild>
          <Link href="/follow-ups/new">
            <Plus className="mr-2 h-4 w-4" /> New Follow-up
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Follow-up Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search by name, email, or phone..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={getSelectValue(filters.status)}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={getSelectValue(filters.responseCategory)}
                  onValueChange={(value) => handleFilterChange("responseCategory", value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Response" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Responses</SelectItem>
                    <SelectItem value="Promising">Promising</SelectItem>
                    <SelectItem value="Undecided">Undecided</SelectItem>
                    <SelectItem value="Cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={getSelectValue(filters.personType)}
                  onValueChange={(value) => handleFilterChange("personType", value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Person Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="New Convert">New Convert</SelectItem>
                    <SelectItem value="New Attendee">New Attendee</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {(searchTerm || filters.status || filters.responseCategory || filters.personType || filters.assignedTo) && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchTerm}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => {
                        setSearchTerm("");
                        updateUrlParams({ search: "" });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.status && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("status", "all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.responseCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Response: {filters.responseCategory}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("responseCategory", "all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.personType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.personType}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("personType", "all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.assignedTo && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Assigned: {filters.assignedTo}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("assignedTo", "all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        Loading follow-ups...
                      </TableCell>
                    </TableRow>
                  ) : followUps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        No follow-ups found. Try adjusting your search or filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    followUps.map((followUp) => (
                      <TableRow key={followUp._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getInitials(followUp.personName, "")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{followUp.personName}</p>
                              <Badge variant="outline">{followUp.personType}</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {followUp.personEmail && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">{followUp.personEmail}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-500" />
                              <span className="text-sm">{followUp.personPhone}</span>
                            </div>
                            {followUp.personWhatsApp && (
                              <div className="flex items-center gap-1">
                                <WhatsAppIcon className="h-3 w-3 text-green-500" />
                                <span className="text-sm">{followUp.personWhatsApp}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`flex items-center gap-1 ${getStatusColor(followUp.status, followUp.responseCategory)}`}>
                            {getStatusIcon(followUp.status)}
                            <span>{followUp.status}</span>
                          </Badge>
                          {followUp.status !== 'Completed' && followUp.status !== 'Failed' && (
                            <Badge 
                              variant="outline" 
                              className="mt-1"
                            >
                              {followUp.responseCategory}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{followUp.attempts} of {followUp.requiredAttempts}</span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${(followUp.attempts / followUp.requiredAttempts) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{followUp.assignedTo.email}</span>
                        </TableCell>
                        <TableCell>
                          {followUp.nextFollowUpDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <span>{formatDate(new Date(followUp.nextFollowUpDate))}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/follow-ups/${followUp._id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}