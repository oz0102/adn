// // app/(dashboard)/follow-ups/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  Mail, 
  Phone, 
  User, 
  Clock, 
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Clipboard,
  Send
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getInitials, getStatusColor } from "@/lib/utils"

interface FollowUpAttempt {
  attemptNumber: number
  date: string
  contactMethod: 'Email' | 'SMS' | 'WhatsApp' | 'Call' | 'In Person'
  response: 'Positive' | 'Negative' | 'No Response'
  notes?: string
  conductedBy: {
    _id: string
    email: string
  }
}

interface FollowUp {
  _id: string
  personType: 'New Attendee' | 'Member'
  personName: string
  personEmail?: string
  personPhone: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed'
  assignedTo: {
    _id: string
    email: string
  }
  nextFollowUpDate?: string
  attempts: FollowUpAttempt[]
  eventDetails?: {
    eventName: string
    eventDate: string
  }
  notes?: string
  createdAt: string
}

export default function FollowUpDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  
  const [followUp, setFollowUp] = useState<FollowUp | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newAttempt, setNewAttempt] = useState({
    contactMethod: 'Call' as 'Email' | 'SMS' | 'WhatsApp' | 'Call' | 'In Person',
    response: 'No Response' as 'Positive' | 'Negative' | 'No Response',
    notes: ''
  })
  const [status, setStatus] = useState<FollowUp['status']>('Pending')
  const [nextFollowUpDate, setNextFollowUpDate] = useState('')
  
  useEffect(() => {
    const fetchFollowUpData = async () => {
      try {
        setIsLoading(true)
        
        // In a real implementation, you would fetch actual data from your API
        // This is just simulating the API response
        await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
        
        // Mock data
        const mockFollowUp: FollowUp = {
          _id: params.id,
          personType: Math.random() > 0.5 ? 'New Attendee' : 'Member',
          personName: 'John Smith',
          personEmail: 'john.smith@example.com',
          personPhone: '+1234567890',
          status: 'In Progress',
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
              notes: 'Responded to text message. Will try to attend next service.',
              conductedBy: {
                _id: 'user1',
                email: 'pastor@church.org'
              }
            }
          ],
          eventDetails: {
            eventName: 'Sunday Service',
            eventDate: new Date(Date.now() - 14 * 86400000).toISOString()
          },
          notes: 'First-time visitor. Seemed interested in small groups.',
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
        }
        
        setFollowUp(mockFollowUp)
        setStatus(mockFollowUp.status)
        
        if (mockFollowUp.nextFollowUpDate) {
          setNextFollowUpDate(new Date(mockFollowUp.nextFollowUpDate).toISOString().split('T')[0])
        }
      } catch (error) {
        console.error("Error fetching follow-up:", error)
        toast({
          title: "Error",
          description: "Failed to load follow-up data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    };
    
    fetchFollowUpData();
  }, [params.id, toast]);
  
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as FollowUp['status'])
  }
  
  const handleNewAttemptChange = (field: keyof typeof newAttempt, value: string) => {
    setNewAttempt(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleSubmitAttempt = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAttempt.notes) {
      toast({
        title: "Missing information",
        description: "Please provide notes about the follow-up attempt",
        variant: "destructive",
      })
      return
    }
    
    try {
      // In a real implementation, you would send data to your API
      // This is just simulating the API call
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
      // Update local state to simulate successful save
      if (followUp) {
        const newAttemptNumber = followUp.attempts.length + 1
        const newAttemptData: FollowUpAttempt = {
          attemptNumber: newAttemptNumber,
          date: new Date().toISOString(),
          contactMethod: newAttempt.contactMethod,
          response: newAttempt.response,
          notes: newAttempt.notes,
          conductedBy: {
            _id: 'user1',
            email: 'pastor@church.org' // In a real app, this would be the current user
          }
        }
        
        setFollowUp({
          ...followUp,
          attempts: [...followUp.attempts, newAttemptData],
          status: status,
          nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined
        })
        
        // Reset the form
        setNewAttempt({
          contactMethod: 'Call',
          response: 'No Response',
          notes: ''
        })
        
        toast({
          title: "Success",
          description: "Follow-up attempt recorded successfully",
        })
      }
    } catch (error) {
      console.error("Error saving follow-up attempt:", error)
      toast({
        title: "Error",
        description: "Failed to save follow-up attempt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSaveChanges = async () => {
    try {
      // In a real implementation, you would send data to your API
      // This is just simulating the API call
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
      // Update local state to simulate successful save
      if (followUp) {
        setFollowUp({
          ...followUp,
          status: status,
          nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : undefined
        })
        
        toast({
          title: "Success",
          description: "Follow-up details updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating follow-up:", error)
      toast({
        title: "Error",
        description: "Failed to update follow-up details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const getStatusIcon = (status: FollowUp['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'Pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }
  
  const getResponseIcon = (response: FollowUpAttempt['response']) => {
    switch (response) {
      case 'Positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Negative':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'No Response':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }
  
  if (isLoading && !followUp) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading follow-up details...</h2>
          <p className="text-gray-500">Please wait while we fetch the data.</p>
        </div>
      </div>
    )
  }
  
  if (!followUp) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Follow-up not found</h2>
          <p className="text-gray-500 mb-4">The requested follow-up record could not be found.</p>
          <Button asChild>
            <Link href="/dashboard/follow-ups">Back to Follow-ups</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" asChild>
            <Link href="/dashboard/follow-ups">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Follow-up Details</h1>
        </div>
        <Badge className={`${getStatusColor(followUp.status)} text-base px-3 py-1`}>
          {getStatusIcon(followUp.status)}
          <span className="ml-1">{followUp.status}</span>
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
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
                  <CardDescription>History of past follow-up attempts</CardDescription>
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
                          
                          <div>
                            <p className="text-sm font-medium">Notes</p>
                            <p className="text-sm">{attempt.notes || "No notes provided."}</p>
                          </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        rows={5}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={isLoading || !newAttempt.notes}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Record Attempt
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          // In a real app, this would generate a follow-up message template
                          toast({
                            title: "Template generated",
                            description: "Follow-up message template copied to clipboard.",
                          })
                        }}
                      >
                        <Clipboard className="mr-2 h-4 w-4" />
                        Generate Template
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}