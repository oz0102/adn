// app/(dashboard)/attendance/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Calendar, 
  Edit, 
  Trash2,
  Check,
  X,
  Clock,
  Search,
  Filter,
  Download
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatDateTime, getInitials, getStatusColor } from "@/lib/utils"
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

interface AttendanceMember {
  _id: string;
  memberId: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber: string;
  };
  status: 'Present' | 'Absent' | 'Excused';
  checkInTime?: string;
}

interface AttendanceDetails {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  eventType: string;
  date: string;
  members: AttendanceMember[];
  totalPresent: number;
  totalAbsent: number;
  totalExcused: number;
  notes?: string;
  recordedBy: {
    _id: string;
    email: string;
  };
}

export default function AttendanceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [attendance, setAttendance] = useState<AttendanceDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [memberFilter, setMemberFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [filteredMembers, setFilteredMembers] = useState<AttendanceMember[]>([])

  useEffect(() => {
    fetchAttendance()
  }, [params.id])

  useEffect(() => {
    if (attendance) {
      let filtered = [...attendance.members]
      
      if (memberFilter) {
        filtered = filtered.filter(member => 
          member.memberId.firstName.toLowerCase().includes(memberFilter.toLowerCase()) ||
          member.memberId.lastName.toLowerCase().includes(memberFilter.toLowerCase()) ||
          (member.memberId.email && member.memberId.email.toLowerCase().includes(memberFilter.toLowerCase()))
        )
      }
      
      if (statusFilter) {
        filtered = filtered.filter(member => member.status === statusFilter)
      }
      
      setFilteredMembers(filtered)
    }
  }, [attendance, memberFilter, statusFilter])

  const fetchAttendance = async () => {
    try {
      setIsLoading(true)
      
      // In a real implementation, fetch actual data from your API
      // This is just simulating the API response
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
      // Mock data
      const mockAttendance: AttendanceDetails = {
        _id: params.id,
        eventId: {
          _id: "event1",
          title: "Sunday Service",
          startDate: "2023-06-18T09:00:00.000Z",
          endDate: "2023-06-18T11:00:00.000Z",
        },
        eventType: "Sunday Service",
        date: "2023-06-18T00:00:00.000Z",
        members: Array.from({ length: 30 }).map((_, i) => ({
          _id: `member${i}`,
          memberId: {
            _id: `member${i}`,
            firstName: `First${i}`,
            lastName: `Last${i}`,
            email: i % 3 !== 0 ? `member${i}@example.com` : undefined,
            phoneNumber: `+123456789${i % 10}`,
          },
          status: ['Present', 'Absent', 'Excused'][i % 3] as any,
          checkInTime: i % 3 === 0 ? new Date(new Date("2023-06-18T09:00:00.000Z").getTime() + (i * 2 * 60000)).toISOString() : undefined,
        })),
        totalPresent: 20,
        totalAbsent: 5,
        totalExcused: 5,
        notes: "Regular Sunday service with good attendance",
        recordedBy: {
          _id: "user1",
          email: "user@example.com"
        }
      }
      
      setAttendance(mockAttendance)
      setFilteredMembers(mockAttendance.members)
    } catch (error) {
      console.error("Error fetching attendance:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      // In a real implementation, call your API to delete the attendance record
      await new Promise(resolve => setTimeout(resolve, 1000)) // Fake deletion delay
      
      toast({
        title: "Attendance record deleted",
        description: "The attendance record has been successfully deleted.",
      })
      
      router.push("/dashboard/attendance")
    } catch (error) {
      console.error("Error deleting attendance:", error)
      toast({
        title: "Error",
        description: "Failed to delete attendance record. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = () => {
    // In a real app, this would generate a CSV or Excel file for download
    toast({
      title: "Export initiated",
      description: "The attendance data is being prepared for download.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p>Loading attendance details...</p>
      </div>
    )
  }

  if (!attendance) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Attendance Record Not Found</h2>
          <p className="mb-4">The attendance record you are looking for does not exist or has been deleted.</p>
          <Button asChild>
            <Link href="/dashboard/attendance">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Attendance
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
            <Link href="/dashboard/attendance">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/attendance/${params.id}/edit`}>
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
                  This action cannot be undone. This will permanently delete the attendance record
                  and all associated data.
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
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">{attendance.eventId.title}</h2>
                <Badge variant="outline" className="mt-1">{attendance.eventType}</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(new Date(attendance.date))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {new Date(attendance.eventId.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(attendance.eventId.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Attendance Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{attendance.totalPresent}</div>
                    <div className="text-sm text-green-700 dark:text-green-500">Present</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{attendance.totalAbsent}</div>
                    <div className="text-sm text-red-700 dark:text-red-500">Absent</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{attendance.totalExcused}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-500">Excused</div>
                  </div>
                </div>
              </div>
              
              {attendance.notes && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-gray-700">{attendance.notes}</p>
                </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <div className="text-sm text-gray-500">
                  Recorded by: {attendance.recordedBy.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Attendance List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search members..."
                    className="pl-8"
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value)}
                  />
                </div>
                
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Excused">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6">
                          No members found matching your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member._id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getInitials(member.memberId.firstName, member.memberId.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {member.memberId.firstName} {member.memberId.lastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {member.memberId.email || member.memberId.phoneNumber}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.status === 'Present' ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : member.status === 'Absent' ? (
                                <X className="h-5 w-5 text-red-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-yellow-500" />
                              )}
                              <Badge className={
                                member.status === 'Present' ? 'bg-green-100 text-green-800' :
                                member.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }>
                                {member.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.checkInTime ? (
                              formatDateTime(new Date(member.checkInTime))
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}