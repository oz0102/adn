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
  CheckCircle,
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
    fetchFollowUp()
  }, [params.id])

  const fetchFollowUp = async () => {
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
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      // In a real implementation, call your API to delete the follow-up
      await new Promise(resolve => setTimeout(resolve, 1000)) // Fake deletion delay
      
      toast({
        title: "Follow-up deleted",
        description: "The follow-up has been successfully deleted.",
      })
      
      router.push("/dashboard/follow-ups")
    } catch (error) {
      console.error("Error deleting follow-up:", error)
      toast({
        title: "Error",
        description: "Failed to delete follow-up. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitAttempt = async () => {
    if (!formData.contactMethod || !formData.response) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsAddingAttempt(true)
      
      // In a real implementation, submit to your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Fake submission delay
      
      // Simulate successful update
      if (followUp) {
        const newAttempt: FollowUpAttempt = {
          _id: `attempt${followUp.attempts.length + 1}`,
          attemptNumber: followUp.attempts.length + 1,
          date: new Date().toISOString(),
          contactMethod: formData.contactMethod,
          response: formData.response,
          notes: formData.notes,
          conductedBy: followUp.assignedTo
        }
        
        let newStatus = followUp.status
        if (formData.response === 'Positive') {
          newStatus = 'Completed'
        } else if (formData.response === 'Negative') {
          newStatus = 'Failed'
        } else {
          newStatus = 'In Progress'
        }
        
        const updatedFollowUp = {
          ...followUp,
          attempts: [...followUp.attempts, newAttempt],
          status: newStatus,
          nextFollowUpDate: formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate).toISOString() : undefined
        }
        
        setFollowUp(updatedFollowUp)
        
        toast({
          title: "Attempt added",
          description: `Follow-up attempt has been recorded.`,
        })
        
        setFormData({
          contactMethod: "",
          response: "",
          notes: "",
          nextFollowUpDate: ""
        })
      }
    } catch (error) {
      console.error("Error adding follow-up attempt:", error)
      toast({
        title: "Error",
        description: "Failed to add follow-up attempt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingAttempt(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p>Loading follow-up details...</p>
      </div>
    )
  }

  if (!followUp) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Follow-up Not Found</h2>
          <p className="mb-4">The follow-up you are looking for does not exist or has been deleted.</p>
          <Button asChild>
            <Link href="/dashboard/follow-ups">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Follow-ups
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/follow-ups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Follow-up Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/follow-ups/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the follow-up
                  record and all associated attempts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white hover:bg-red-700"
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
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarFallback className="text-xl">
                    {getInitials(followUp.personInfo.name, "")}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{followUp.personInfo.name}</h2>
                <Badge variant="outline">{followUp.personType}</Badge>
              </div>
              
              <div className="space-y-2">
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
                {followUp.personInfo.address && (
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <span>{followUp.personInfo.address}</span>
                  </div>
                )}
                {followUp.personInfo.visitDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Visit Date: {formatDate(new Date(followUp.personInfo.visitDate))}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Follow-up Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge className={getStatusColor(followUp.status)}>
                      {followUp.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned To:</span>
                    <span>{followUp.assignedTo.email}</span>
                  </div>
                  {followUp.nextFollowUpDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next Follow-up:</span>
                      <span>{formatDate(new Date(followUp.nextFollowUpDate))}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span>{formatDate(new Date(followUp.createdAt))}</span>
                  </div>
                </div>
              </div>
              
              {followUp.missedEvent && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Missed Event</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Event:</span>
                      <span>{followUp.missedEvent.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span>{formatDate(new Date(followUp.missedEvent.date))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span>{followUp.missedEvent.type}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Follow-up Attempts</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Add Attempt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Follow-up Attempt</DialogTitle>
                  <DialogDescription>
                    Record a new follow-up attempt with this person.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactMethod">Contact Method</Label>
                    <Select
                      value={formData.contactMethod}
                      onValueChange={(value) => handleFormChange("contactMethod", value)}
                    >
                      <SelectTrigger id="contactMethod">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Call">Phone Call</SelectItem>
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
                      value={formData.response}
                      onValueChange={(value) => handleFormChange("response", value)}
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
                      placeholder="Add any notes about the follow-up attempt"
                      value={formData.notes}
                      onChange={(e) => handleFormChange("notes", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nextFollowUpDate">Next Follow-up Date (Optional)</Label>
                    <Input
                      id="nextFollowUpDate"
                      type="date"
                      value={formData.nextFollowUpDate}
                      onChange={(e) => handleFormChange("nextFollowUpDate", e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setFormData({
                      contactMethod: "",
                      response: "",
                      notes: "",
                      nextFollowUpDate: ""
                    })}
                    disabled={isAddingAttempt}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAttempt}
                    disabled={isAddingAttempt}
                  >
                    {isAddingAttempt ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {followUp.attempts.length === 0 ? (
              <div className="py-10 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Follow-up Attempts Yet</h3>
                <p className="text-gray-500 mb-4">
                  Record your first follow-up attempt with this person.
                </p>
                <Button onClick={() => setFormData({
                  contactMethod: "",
                  response: "",
                  notes: "",
                  nextFollowUpDate: ""
                })}>
                  <Plus className="mr-2 h-4 w-4" /> Add Attempt
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {followUp.attempts.map((attempt) => (
                  <div key={attempt._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Attempt #{attempt.attemptNumber}</Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(new Date(attempt.date))}
                        </span>
                      </div>
                      <Badge className={
                        attempt.response === 'Positive' ? 'bg-green-100 text-green-800' :
                        attempt.response === 'Negative' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {attempt.response}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Contact Method:</span>
                        <span>{attempt.contactMethod}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Conducted By:</span>
                        <span>{attempt.conductedBy.email}</span>
                      </div>
                      {attempt.notes && (
                        <div>
                          <p className="font-medium">Notes:</p>
                          <p className="text-gray-700 mt-1">{attempt.notes}</p>
                        </div>
                      )}
                    </div>
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