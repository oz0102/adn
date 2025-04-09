// components/teams/members-tab.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Filter, X } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"

interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  role: 'Lead' | 'Assistant' | 'Member';
  joinDate: string;
}

interface TeamMembersTabProps {
  teamId: string;
  members: TeamMember[];
}

export function TeamMembersTab({ teamId, members }: TeamMembersTabProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  
  // Filter members based on search and role
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = !roleFilter || member.role === roleFilter
    
    return matchesSearch && matchesRole
  })
  
  const handleAddMember = () => {
    toast({
      title: "Feature not implemented",
      description: "Adding team members will be implemented in a future update.",
    })
    setIsAddMemberOpen(false)
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Team Members</CardTitle>
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add an existing church member to this team.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {/* Form would go here - simplified for demo */}
              <p className="text-sm text-gray-500 mb-4">
                Search for a church member to add to this team.
              </p>
              <Input
                placeholder="Search members..."
                className="mb-4"
              />
              <p className="text-sm text-gray-500">
                This feature is not fully implemented in the demo.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search members..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={roleFilter === "" ? "default" : "outline"} 
                size="sm"
                onClick={() => setRoleFilter("")}
              >
                All
              </Button>
              <Button 
                variant={roleFilter === "Lead" ? "default" : "outline"} 
                size="sm"
                onClick={() => setRoleFilter("Lead")}
              >
                Lead
              </Button>
              <Button 
                variant={roleFilter === "Assistant" ? "default" : "outline"} 
                size="sm"
                onClick={() => setRoleFilter("Assistant")}
              >
                Assistant
              </Button>
              <Button 
                variant={roleFilter === "Member" ? "default" : "outline"} 
                size="sm"
                onClick={() => setRoleFilter("Member")}
              >
                Member
              </Button>
            </div>
          </div>
          
          {(searchTerm || roleFilter) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {roleFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Role: {roleFilter}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => setRoleFilter("")}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No members found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(member.firstName, member.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          member.role === "Lead" ? "default" : 
                          member.role === "Assistant" ? "secondary" : 
                          "outline"
                        }>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          {member.email && <p className="text-sm">{member.email}</p>}
                          <p className="text-sm text-gray-500">{member.phoneNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/members/${member._id}`}>
                            View
                          </Link>
                        </Button>
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
  )
}