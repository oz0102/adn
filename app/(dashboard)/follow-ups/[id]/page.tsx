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
}, [params.id, toast])
