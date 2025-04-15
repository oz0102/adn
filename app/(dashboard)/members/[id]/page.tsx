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
  }, [params.id, toast]);

  const handleDeleteMember = async () => {
    try {
      setIsDeleting(true)
      
      // In a real implementation, you would send a delete request to your API
      // This is just simulating the API call
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake API call delay
      
      toast({
        title: "Success",
        description: "Member deleted successfully",
      })
      
      // Redirect back to the members list
      router.push("/dashboard/members")
    } catch (error) {
      console.error("Error deleting member:", error)
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  const getFullName = (member: MemberDetails) => {
    return `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`;
  }

  const getFullAddress = (address: MemberDetails['address']) => {
    return `${address.street}, ${address.city}, ${address.state}, ${address.country}${address.postalCode ? ' ' + address.postalCode : ''}`;
  }

  if (isLoading && !member) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="mx-auto h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Loading member details...</h3>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="mx-auto h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Member not found</h3>
          <p className="text-gray-500 mb-4">
            The requested member could not be found.
          </p>
          <Button asChild>
            <Link href="/dashboard/members">Return to Members</Link>
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
            <Link href="/dashboard/members">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Member Details</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href={`/dashboard/members/${member._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Member</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this member? This action cannot be undone
                  and all associated data will be permanently lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteMember}
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-xl">{getInitials(getFullName(member), "")}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{getFullName(member)}</h2>
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                <Badge>{member.gender}</Badge>
                <Badge variant="outline">{member.maritalStatus}</Badge>
                <Badge variant="outline">{member.memberId}</Badge>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              {member.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{member.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{member.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{getFullAddress(member.address)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Born: {formatDate(new Date(member.dateOfBirth))}</span>
              </div>
              
              {member.occupation && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span>{member.occupation}</span>
                </div>
              )}
              
              {member.employer && (
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-sm text-gray-500">at {member.employer}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 pt-2">
              {member.clusterId && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>Cluster: <Link href={`/dashboard/clusters/${member.clusterId._id}`} className="text-blue-600 hover:underline">{member.clusterId.name}</Link></span>
                </div>
              )}
              
              {member.smallGroupId && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-gray-500" />
                  <span>Small Group: <Link href={`/dashboard/small-groups/${member.smallGroupId._id}`} className="text-blue-600 hover:underline">{member.smallGroupId.name}</Link></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="spiritual">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="spiritual">
                <Award className="mr-2 h-4 w-4" />
                Spiritual Growth
              </TabsTrigger>
              <TabsTrigger value="teams">
                <Users className="mr-2 h-4 w-4" />
                Teams
              </TabsTrigger>
              <TabsTrigger value="training">
                <Book className="mr-2 h-4 w-4" />
                Training
              </TabsTrigger>
              <TabsTrigger value="followups">
                <UserCheck className="mr-2 h-4 w-4" />
                Follow-ups
              </TabsTrigger>
              <TabsTrigger value="attendance">
                <Calendar className="mr-2 h-4 w-4" />
                Attendance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="spiritual">
              <MemberSpiritualGrowthTab memberId={member._id} />
            </TabsContent>
            
            <TabsContent value="teams">
              <MemberTeamsTab memberId={member._id} />
            </TabsContent>
            
            <TabsContent value="training">
              <MemberTrainingTab memberId={member._id} />
            </TabsContent>
            
            <TabsContent value="followups">
              <MemberFollowUpsTab memberId={member._id} />
            </TabsContent>
            
            <TabsContent value="attendance">
              <MemberAttendanceTab memberId={member._id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}