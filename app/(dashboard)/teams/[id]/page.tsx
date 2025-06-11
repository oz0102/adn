// app/(dashboard)/teams/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/client/components/ui/tabs"
import { Button } from "@/lib/client/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/client/components/ui/card"
import { Avatar, AvatarFallback } from "@/lib/client/components/ui/avatar"
import { Badge } from "@/lib/client/components/ui/badge"
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Users,
  UserPlus,
  CalendarDays
} from "lucide-react"
import { useToast } from "@/lib/client/hooks/use-toast"
import { getInitials } from "@/lib/utils"
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
} from "@/lib/client/components/ui/alert-dialog"
import { TeamMembersTab } from "@/lib/client/components/teams/members-tab"
import { TeamEventsTab } from "@/lib/client/components/teams/events-tab"
import { TeamResponsibilitiesTab } from "@/lib/client/components/teams/responsibilities-tab"

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  role: 'Lead' | 'Assistant' | 'Member';
  joinDate: string;
}

interface Team {
  _id: string;
  name: string;
  description: string;
  category: string;
  leaderId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assistantLeaderIds: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  members: TeamMember[];
  responsibilities: string[];
  meetingSchedule?: {
    day: string;
    time: string;
    frequency: string;
  };
}

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [team, setTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true)
        
        // In a real implementation, fetch actual data from your API
        // This is just simulating the API response
        await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
        // Mock data
        const mockTeam: Team = {
          _id: params.id,
          name: "Worship Team",
          description: "The worship team is responsible for leading the congregation in worship during services and events.",
          category: "Worship",
          leaderId: {
            _id: "member1",
            firstName: "John",
            lastName: "Smith",
            email: "john.smith@example.com",
          },
          assistantLeaderIds: [
            {
              _id: "member2",
              firstName: "Sarah",
              lastName: "Johnson",
              email: "sarah.johnson@example.com",
            }
          ],
          members: Array.from({ length: 12 }).map((_, i) => ({
            _id: `member${i + 1}`,
            firstName: `First${i + 1}`,
            lastName: `Last${i + 1}`,
            email: i % 2 === 0 ? `member${i + 1}@example.com` : undefined,
            phoneNumber: `+123456789${i}`,
            role: i === 0 ? 'Lead' : i === 1 ? 'Assistant' : 'Member',
            joinDate: new Date(new Date().getTime() - (Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
          })),
          responsibilities: [
            "Lead worship during Sunday services",
            "Conduct rehearsals before each service",
            "Maintain instruments and equipment",
            "Develop new worship songs and arrangements",
            "Train new worship team members"
          ],
          meetingSchedule: {
            day: "Saturday",
            time: "16:00",
            frequency: "Weekly"
          }
        }
        
        setTeam(mockTeam)
      } catch (error) {
        console.error("Error fetching team:", error)
        toast({
          title: "Error",
          description: "Failed to load team details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTeamData();
  }, [params.id, toast])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      // In a real implementation, call your API to delete the team
      await new Promise(resolve => setTimeout(resolve, 1000)) // Fake deletion delay
      
      toast({
        title: "Team deleted",
        description: "The team has been successfully deleted.",
      })
      
      router.push("/dashboard/teams")
    } catch (error) {
      console.error("Error deleting team:", error)
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p>Loading team details...</p>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
          <p className="mb-4">The team you are looking for does not exist or has been deleted.</p>
          <Button asChild>
            <Link href="/dashboard/teams">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teams
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
            <Link href="/dashboard/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Team Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/teams/${params.id}/edit`}>
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
                  This action cannot be undone. This will permanently delete the team
                  and remove all team memberships.
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
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">{team.name}</h2>
                <Badge variant="outline" className="mt-1">{team.category}</Badge>
              </div>
              
              <div>
                <p className="text-gray-700">{team.description}</p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Leadership</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Team Lead</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(team.leaderId.firstName, team.leaderId.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{team.leaderId.firstName} {team.leaderId.lastName}</p>
                        <p className="text-sm text-gray-500">{team.leaderId.email}</p>
                      </div>
                    </div>
                  </div>

                  {team.assistantLeaderIds.length > 0 && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-1">Assistant Leader{team.assistantLeaderIds.length > 1 ? 's' : ''}</h4>
                      <div className="space-y-2">
                        {team.assistantLeaderIds.map(assistant => (
                          <div key={assistant._id} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {getInitials(assistant.firstName, assistant.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{assistant.firstName} {assistant.lastName}</p>
                              <p className="text-sm text-gray-500">{assistant.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {team.meetingSchedule && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Meeting Schedule</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <span>{team.meetingSchedule.day}s</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500 ml-6">Time:</span>
                    <span>{team.meetingSchedule.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 ml-6">Frequency:</span>
                    <span>{team.meetingSchedule.frequency}</span>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span><strong>{team.members.length}</strong> team members</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="members">
                <Users className="h-4 w-4 mr-2" /> Members
              </TabsTrigger>
              <TabsTrigger value="responsibilities">
                <UserPlus className="h-4 w-4 mr-2" /> Responsibilities
              </TabsTrigger>
              <TabsTrigger value="events">
                <CalendarDays className="h-4 w-4 mr-2" /> Events
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="members">
              <TeamMembersTab teamId={params.id} members={team.members} />
            </TabsContent>
            
            <TabsContent value="responsibilities">
              <TeamResponsibilitiesTab teamId={params.id} responsibilities={team.responsibilities} />
            </TabsContent>
            
            <TabsContent value="events">
              <TeamEventsTab teamId={params.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}