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
    fetchMember()
  }, [params.id])

  const fetchMember = async () => {
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
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      // In a real implementation, call your API to delete the member
      await new Promise(resolve => setTimeout(resolve, 1000)) // Fake deletion delay
      
      toast({
        title: "Member deleted",
        description: "The member has been successfully deleted.",
      })
      
      router.push("/dashboard/members")
    } catch (error) {
      console.error("Error deleting member:", error)
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p>Loading member details...</p>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Member Not Found</h2>
          <p className="mb-4">The member you are looking for does not exist or has been deleted.</p>
          <Button asChild>
            <Link href="/dashboard/members">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
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
            <Link href="/dashboard/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Member Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/members/${params.id}/edit`}>
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
                  This action cannot be undone. This will permanently delete the member
                  and remove their data from the system.
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
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl">
                  {getInitials(member.firstName, member.lastName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">
                {member.firstName} {member.middleName && member.middleName + " "}{member.lastName}
              </h2>
              <p className="text-gray-500 mb-2">{member.memberId}</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {member.clusterId && (
                  <Badge variant="secondary">
                    {member.clusterId.name}
                  </Badge>
                )}
                {member.smallGroupId && (
                  <Badge variant="secondary">
                    {member.smallGroupId.name}
                  </Badge>
                )}
                <Badge>{member.gender}</Badge>
              </div>
              
              <div className="w-full space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span>{member.phoneNumber}</span>
                </div>
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span>{member.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span>
                    {member.address.street}, {member.address.city}, {member.address.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>Born: {formatDate(new Date(member.dateOfBirth))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span>{member.maritalStatus}</span>
                </div>
                {member.occupation && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-500" />
                    <span>
                      {member.occupation}
                      {member.employer && ` at ${member.employer}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="spiritual" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="spiritual">
                <Book className="h-4 w-4 mr-2" /> Spiritual Growth
              </TabsTrigger>
              <TabsTrigger value="teams">
                <Users className="h-4 w-4 mr-2" /> Teams
              </TabsTrigger>
              <TabsTrigger value="training">
                <Award className="h-4 w-4 mr-2" /> Training
              </TabsTrigger>
              <TabsTrigger value="followups">
                <UserCheck className="h-4 w-4 mr-2" /> Follow-ups
              </TabsTrigger>
              <TabsTrigger value="attendance">
                <Calendar className="h-4 w-4 mr-2" /> Attendance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="spiritual">
              <MemberSpiritualGrowthTab memberId={params.id} />
            </TabsContent>
            
            <TabsContent value="teams">
              <MemberTeamsTab memberId={params.id} />
            </TabsContent>
            
            <TabsContent value="training">
              <MemberTrainingTab memberId={params.id} />
            </TabsContent>
            
            <TabsContent value="followups">
              <MemberFollowUpsTab memberId={params.id} />
            </TabsContent>
            
            <TabsContent value="attendance">
              <MemberAttendanceTab memberId={params.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}