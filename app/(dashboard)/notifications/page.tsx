// app/(dashboard)/notifications/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {} from "@/lib/client/components/ui/card"
import { Button } from "@/lib/client/components/ui/button"
import { Pagination } from "@/lib/client/components/ui/pagination"
import { Badge } from "@/lib/client/components/ui/badge"
import { 
  Bell,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  User,
  Users,
  Check
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/client/components/ui/select"
import { useToast } from "@/lib/client/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/lib/client/components/ui/dialog"
import { Textarea } from "@/lib/client/components/ui/textarea"
import { Label } from "@/lib/client/components/ui/label"
import { Input } from "@/lib/client/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/lib/client/components/ui/tabs"

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  link?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "Info",
    targetAll: true,
    targetRoles: [] as string[],
    targetUsers: [] as string[],
    expiresInDays: "30"
  });
  
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const type = searchParams.get("type") || "";
    
    setTypeFilter(type);
    
    const fetchNotificationsData = async () => {
      try {
        setIsLoading(true);
        
        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("limit", pagination.limit.toString());
        
        if (type) queryParams.append("type", type);
        
        // In a real implementation, you would fetch actual data from your API
        // This is just simulating the API response
        await new Promise(resolve => setTimeout(resolve, 500)); // Fake loading delay
        
        // Mock data for unread notifications
        const mockNotifications: Notification[] = Array.from({ length: 5 }).map((_, i) => {
          const type: 'Info' | 'Success' | 'Warning' | 'Error' = 
            i % 4 === 0 ? 'Info' : 
            i % 4 === 1 ? 'Success' : 
            i % 4 === 2 ? 'Warning' : 'Error';
          
          return {
            _id: `notification${i + 1}`,
            title: `${type} Notification ${i + 1}`,
            message: `This is a ${type.toLowerCase()} notification message. It contains important information that you need to know.`,
            type,
            read: false,
            createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            link: i % 2 === 0 ? `/dashboard/example/${i}` : undefined
          };
        });

        // Mock data for read notifications
        const mockReadNotifications: Notification[] = Array.from({ length: 10 }).map((_, i) => {
          const type: 'Info' | 'Success' | 'Warning' | 'Error' = 
            i % 4 === 0 ? 'Info' : 
            i % 4 === 1 ? 'Success' : 
            i % 4 === 2 ? 'Warning' : 'Error';
          
          return {
            _id: `read-notification${i + 1}`,
            title: `Read ${type} Notification ${i + 1}`,
            message: `This is a read ${type.toLowerCase()} notification message that you have already viewed.`,
            type,
            read: true,
            createdAt: new Date(Date.now() - 86400000 * (i + 5)).toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            link: i % 3 === 0 ? `/dashboard/example/${i}` : undefined
          };
        });
        
        setNotifications(mockNotifications);
        setReadNotifications(mockReadNotifications);
        setPagination({
          page,
          limit: 10,
          total: 15, // Mock total
          pages: 2,  // Mock pages
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotificationsData();
  }, [searchParams, pagination.limit, toast]);

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    updateUrlParams({ type, page: 1 });
  };

  const updateUrlParams = (params: Record<string, string | number | boolean | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    
    router.push(`/dashboard/notifications?${newParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
  };

  const handleMarkAsRead = (id: string) => {
    // Move notification from unread to read
    const notification = notifications.find(n => n._id === id);
    if (notification) {
      setNotifications(notifications.filter(n => n._id !== id));
      setReadNotifications([{ ...notification, read: true }, ...readNotifications]);
      
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    }
  };

  const handleMarkAllAsRead = () => {
    // Move all notifications to read
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setReadNotifications([...updatedNotifications, ...readNotifications]);
    setNotifications([]);
    
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const handleCreateNotification = () => {
    // In a real implementation, submit to API
    toast({
      title: "Notification created",
      description: "The notification has been created and sent.",
    });
    
    setIsCreatingNotification(false);
    
    // Reset form
    setNewNotification({
      title: "",
      message: "",
      type: "Info",
      targetAll: true,
      targetRoles: [],
      targetUsers: [],
      expiresInDays: "30"
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'Success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'Error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'Info':
        return "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800";
      case 'Success':
        return "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800";
      case 'Warning':
        return "bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800";
      case 'Error':
        return "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800";
      default:
        return "bg-gray-50 border-gray-100 dark:bg-gray-900/20 dark:border-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )}
          <Button onClick={() => setIsCreatingNotification(true)}>
            <Plus className="mr-2 h-4 w-4" /> Send Notification
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={typeFilter === "" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleTypeChange("")}
            >
              <Bell className="mr-2 h-4 w-4" /> All
            </Button>
            <Button 
              variant={typeFilter === "Info" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleTypeChange("Info")}
            >
              <Info className="mr-2 h-4 w-4 text-blue-500" /> Info
            </Button>
            <Button 
              variant={typeFilter === "Success" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleTypeChange("Success")}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Success
            </Button>
            <Button 
              variant={typeFilter === "Warning" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleTypeChange("Warning")}
            >
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" /> Warning
            </Button>
            <Button 
              variant={typeFilter === "Error" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleTypeChange("Error")}
            >
              <XCircle className="mr-2 h-4 w-4 text-red-500" /> Error
            </Button>
          </div>
        </div>

        <Tabs defaultValue="unread">
          <TabsList>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> 
              Unread
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="flex items-center gap-2">
              <Check className="h-4 w-4" /> 
              Read
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unread" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Unread Notifications</h3>
                <p className="text-gray-500">
                  You have no unread notifications at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border rounded-lg p-4 ${getNotificationColors(notification.type)}`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        {getNotificationIcon(notification.type)}
                        <h3 className="font-semibold">{notification.title}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        Mark as read
                      </Button>
                    </div>
                    <p className="mb-2">{notification.message}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{formatDate(new Date(notification.createdAt))}</span>
                      {notification.link && (
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                          <Link href={notification.link}>View details</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="read" className="mt-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : readNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Check className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Read Notifications</h3>
                <p className="text-gray-500">
                  You have no read notifications.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {readNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getNotificationIcon(notification.type)}
                      <h3 className="font-semibold">{notification.title}</h3>
                    </div>
                    <p className="mb-2">{notification.message}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{formatDate(new Date(notification.createdAt))}</span>
                      {notification.link && (
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                          <Link href={notification.link}>View details</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isCreatingNotification} onOpenChange={setIsCreatingNotification}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Create a notification to send to church members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Notification message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                className="min-h-24"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Notification Type</Label>
              <Select
                value={newNotification.type}
                onValueChange={(value) => setNewNotification({...newNotification, type: value})}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Info">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" /> Info
                    </div>
                  </SelectItem>
                  <SelectItem value="Success">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Success
                    </div>
                  </SelectItem>
                  <SelectItem value="Warning">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" /> Warning
                    </div>
                  </SelectItem>
                  <SelectItem value="Error">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" /> Error
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Target Recipients</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="targetAll"
                    checked={newNotification.targetAll}
                    onChange={() => setNewNotification({...newNotification, targetAll: true})}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="targetAll" className="cursor-pointer flex items-center gap-2">
                    <Users className="h-4 w-4" /> All Church Members
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="targetSpecific"
                    checked={!newNotification.targetAll}
                    onChange={() => setNewNotification({...newNotification, targetAll: false})}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="targetSpecific" className="cursor-pointer flex items-center gap-2">
                    <User className="h-4 w-4" /> Specific Roles/Members
                  </Label>
                </div>
              </div>
            </div>
            
            {!newNotification.targetAll && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="targetRoles">Target Roles</Label>
                  <Select>
                    <SelectTrigger id="targetRoles">
                      <SelectValue placeholder="Select roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="pastor">Pastor</SelectItem>
                      <SelectItem value="clusterLead">Cluster Lead</SelectItem>
                      <SelectItem value="smallGroupLead">Small Group Lead</SelectItem>
                      <SelectItem value="member">Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetUsers">Target Specific Members</Label>
                  <Select>
                    <SelectTrigger id="targetUsers">
                      <SelectValue placeholder="Select members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">John Smith</SelectItem>
                      <SelectItem value="user2">Sarah Johnson</SelectItem>
                      <SelectItem value="user3">Michael Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="expiresInDays">Expires After</Label>
              <Select
                value={newNotification.expiresInDays}
                onValueChange={(value) => setNewNotification({...newNotification, expiresInDays: value})}
              >
                <SelectTrigger id="expiresInDays">
                  <SelectValue placeholder="Select expiry period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingNotification(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotification}>
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}