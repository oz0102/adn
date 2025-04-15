// app/(dashboard)/follow-ups/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  Edit, 
  Trash2,
  AlertCircle,
  Plus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getInitials, getStatusColor } from "@/lib/utils"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface FollowUpAttempt {
  _id: string;
  attemptNumber: number;
  date: string;
  contactMethod: string;
  response: string;
  notes?: string;
  conductedBy: {
    _id: string;
    email: string;
  };
}

interface FollowUpDetails {
  _id: string;
  personType: 'New Attendee' | 'Member';
  personInfo: {
    id?: string;
    name: string;
    email?: string;
    phone: string;
    whatsappNumber?: string;
    address?: string;
    visitDate?: string;
  };
  missedEvent?: {
    name: string;
    date: string;
    type: string;
  };
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  assignedTo: {
    _id: string;
    email: string;
  };
  attempts: FollowUpAttempt[];
  nextFollowUpDate?: string;
  createdAt: string;
}

export default function FollowUpDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [followUp, setFollowUp] = useState<FollowUpDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddingAttempt, setIsAddingAttempt] = useState(false)
  const [formData, setFormData] = useState({
    contactMethod: "",
    response: "",
    notes: "",
    nextFollowUpDate: ""
  })

  useEffect(() => {
    const fetchFollowUpData = async () => {
      try {
        setIsLoading(true)
        
        // In a real implementation, fetch actual data from your API
        // This is just simulating the API response
        await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
        // Mock data
        const mockFollowUp: FollowUpDetails = {
          _id: params.id,
          personType: "New Attendee",
          personInfo: {
            name: "John Smith",
            email: "john.smith@example.com",
            phone: "+12345678901",
            whatsappNumber: "+12345678901",
            address: "123 Main St, New York, NY 10001",
            visitDate: "2023-06-15T00:00:00.000Z",
          },
          status: "In Progress",
          assignedTo: {
            _id: "user1",
            email: "pastor@example.com"
          },
          attempts: [
            {
              _id: "attempt1",
              attemptNumber: 1,
              date: "2023-06-18T00:00:00.000Z",
              contactMethod: "Call",
              response: "No Response",
              notes: "Called but no answer. Left a voicemail.",
              conductedBy: {
                _id: "user1",
                email: "pastor@example.com"
              }
            },
            {
              _id: "attempt2",
              attemptNumber: 2,
              date: "2023-06-20T00:00:00.000Z",
              contactMethod: "SMS",
              response: "Positive",
              notes: "Responded to the message. Said they will try to come next Sunday.",
              conductedBy: {
                _id: "user1",
                email: "pastor@example.com"
              }
            }
          ],
          nextFollowUpDate: "2023-06-25T00:00:00.000Z",
          createdAt: "2023-06-16T00:00:00.000Z"
        }
        
        setFollowUp(mockFollowUp)

        // Initialize form with next follow-up date if available
        if (mockFollowUp.nextFollowUpDate) {
          setFormData(prev => ({
            ...prev,
            nextFollowUpDate: new Date(mockFollowUp.nextFollowUpDate).toISOString().split('T')[0]
          }))
        }
      } catch (error) {
        console.error("Error fetching follow-up:", error)
        toast({
          title: "Error",
          description: "Failed to load follow-up details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    };
    
    fetchFollowUpData();
  }, [params.id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitAttempt = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.contactMethod || !formData.response) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // In a real implementation, you would send data to your API
      // This is just simulating the API call
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
      // Simulate adding a new attempt
      if (followUp) {
        const newAttempt: FollowUpAttempt = {
          _id: `attempt${followUp.attempts.length + 1}`,
          attemptNumber: followUp.attempts.length + 1,
          date: new Date().toISOString(),
          contactMethod: formData.contactMethod,
          response: formData.response,
          notes: formData.notes,
          conductedBy: {
            _id: "user1", // In a real app, this would be the current user
            email: "pastor@example.com"
          }
        }
        
        const updatedFollowUp = {
          ...followUp,
          attempts: [...followUp.attempts, newAttempt],
          nextFollowUpDate: formData.nextFollowUpDate 
            ? new Date(formData.nextFollowUpDate).toISOString()
            : followUp.nextFollowUpDate
        }
        
        setFollowUp(updatedFollowUp)
        
        toast({
          title: "Success",
          description: "Follow-up attempt recorded successfully",
        })
        
        // Reset form and close dialog
        setFormData({
          contactMethod: "",
          response: "",
          notes: "",
          nextFollowUpDate: formData.nextFollowUpDate
        })
        setIsAddingAttempt(false)
      }
    } catch (error) {
      console.error("Error adding follow-up attempt:", error)
      toast({
        title: "Error",
        description: "Failed to record follow-up attempt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setIsLoading(true)
      
      // In a real implementation, you would send data to your API
      // This is just simulating the API call
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
      if (followUp) {
        const updatedFollowUp = {
          ...followUp,
          status: newStatus as FollowUpDetails['status']
        }
        
        setFollowUp(updatedFollowUp)
        
        toast({
          title: "Status updated",
          description: `Follow-up status changed to ${newStatus}`,
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFollowUp = async () => {
    try {
      setIsDeleting(true)
      
      // In a real implementation, you would send a delete request to your API
      // This is just simulating the API call
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
      toast({
        title: "Success",
        description: "Follow-up deleted successfully",
      })
      
      // Redirect back to the follow-ups list
      router.push("/dashboard/follow-ups")
    } catch (error) {
      console.error("Error deleting follow-up:", error)
      toast({
        title: "Error",
        description: "Failed to delete follow-up. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  if (isLoading && !followUp) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Loading follow-up details...</h3>
        </div>
      </div>
    )
  }

  if (!followUp) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Follow-up not found</h3>
          <p className="text-gray-500 mb-4">
            The requested follow-up details could not be found.
          </p>
          <Button asChild>
            <Link href="/dashboard/follow-ups">Return to Follow-ups</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/follow-ups">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Follow-up Details</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select defaultValue={followUp.status} onValueChange={handleUpdateStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isAddingAttempt} onOpenChange={setIsAddingAttempt}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Attempt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Follow-up Attempt</DialogTitle>
                <DialogDescription>
                  Record a new follow-up attempt for {followUp.personInfo.name}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmitAttempt}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactMethod">Contact Method *</Label>
                    <Select
                      value={formData.contactMethod}
                      onValueChange={(value) => handleSelectChange("contactMethod", value)}
                      required
                    >
                      <SelectTrigger id="contactMethod">
                        <SelectValue placeholder="Select contact method" />
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
                    <Label htmlFor="response">Response *</Label>
                    <Select
                      value={formData.response}
                      onValueChange={(value) => handleSelectChange("response", value)}
                      required
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Add details about the attempt"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nextFollowUpDate">Next Follow-up Date</Label>
                    <Input
                      id="nextFollowUpDate"
                      name="nextFollowUpDate"
                      type="date"
                      value={formData.nextFollowUpDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddingAttempt(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Add Attempt
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Follow-up</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this follow-up? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteFollowUp}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Person Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{getInitials(followUp.personInfo.name, "")}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{followUp.personInfo.name}</h3>
                <Badge variant="outline">{followUp.personType}</Badge>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              {followUp.personInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{followUp.personInfo.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{followUp.personInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>Assigned to: {followUp.assignedTo.email}</span>
              </div>
              
              {followUp.personInfo.visitDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Visit date: {formatDate(new Date(followUp.personInfo.visitDate as string))}</span>
                </div>
              )}
              
              {followUp.nextFollowUpDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Next follow-up: {formatDate(new Date(followUp.nextFollowUpDate as string))}</span>
                </div>
              )}
            </div>
            
            {followUp.missedEvent && (
              <div className="pt-2">
                <h4 className="font-medium text-sm mb-2">Missed Event</h4>
                <div className="text-sm">
                  <p><strong>Event:</strong> {followUp.missedEvent.name}</p>
                  <p><strong>Date:</strong> {formatDate(new Date(followUp.missedEvent.date))}</p>
                  <p><strong>Type:</strong> {followUp.missedEvent.type}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Follow-up Attempts</CardTitle>
            <Badge className={getStatusColor(followUp.status)}>
              {followUp.status}
            </Badge>
          </CardHeader>
          <CardContent>
            {followUp.attempts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No follow-up attempts recorded yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddingAttempt(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Attempt
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {followUp.attempts.map((attempt) => (
                  <div 
                    key={attempt._id} 
                    className="border rounded-md p-4 relative"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Attempt #{attempt.attemptNumber}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(new Date(attempt.date))}
                        </p>
                        <p className="text-xs text-gray-400">
                          By: {attempt.conductedBy.email}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {attempt.contactMethod}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={
                        attempt.response === "Positive"
                          ? "bg-green-100 text-green-800"
                          : attempt.response === "Negative"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }>
                        {attempt.response}
                      </Badge>
                    </div>
                    
                    {attempt.notes && (
                      <div className="text-sm border-t pt-3">
                        <p className="font-medium mb-1">Notes:</p>
                        <p>{attempt.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}