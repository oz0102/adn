// app/(dashboard)/members/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User, 
  Edit, 
  Trash2,
  UserCheck,
  Briefcase,
  Book,
  Award,
  Users
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getInitials } from "@/lib/utils"
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
import { MemberSpiritualGrowthTab } from "@/components/members/spiritual-growth-tab"
import { MemberTeamsTab } from "@/components/members/teams-tab"
import { MemberTrainingTab } from "@/components/members/training-tab"
import { MemberFollowUpsTab } from "@/components/members/follow-ups-tab"
import { MemberAttendanceTab } from "@/components/members/attendance-tab"

interface MemberDetails {
  _id: string
  memberId: string
  firstName: string
  middleName?: string
  lastName: string
  gender: string
  dateOfBirth: string
  email?: string
  phoneNumber: string
  whatsappNumber?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode?: string
  }
  maritalStatus: string
  occupation?: string
  employer?: string
  clusterId?: {
    _id: string
    name: string
  }
  smallGroupId?: {
    _id: string
    name: string
  }
}

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [member, setMember] = useState<MemberDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setIsLoading(true)
        
        // In a real implementation, fetch actual data from your API
        // This is just simulating the API response
        await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
      // Mock data
      const mockMember: MemberDetails = {
        _id: params.id,
        memberId: "M1001",
        firstName: "John",
        middleName: "David",
        lastName: "Smith",
        gender: "Male",
        dateOfBirth: "1985-06-15T00:00:00.000Z",
        email: "john.smith@example.com",
        phoneNumber: "+12345678901",
        whatsappNumber: "+12345678901",
        address: {
          street: "123 Main St",
          city: "New York",
          state: "NY",
          country: "USA",
          postalCode: "10001"
        },
        maritalStatus: "Married",
        occupation: "Software Engineer",
        employer: "Tech Company Inc.",
        clusterId: {
          _id: "1",
          name: "North Cluster"
        },
        smallGroupId: {
          _id: "1",
          name: "Young Adults"
        }
      }
      
      setMember(mockMember)
    } catch (error) {
      console.error("Error fetching member:", error)
      toast({
        title: "Error",
        description: "Failed to load member details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  };
  
  fetchMemberData();
}, [params.id, toast])
