// components/dashboard/activity-feed.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { DataCard } from '@/lib/client/components/ui/data-card';
import { Activity, User, Calendar, MessageSquare } from 'lucide-react';
import { Badge } from '@/lib/client/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/lib/client/hooks/use-toast';
import { Skeleton } from '@/lib/client/components/ui/skeleton';

interface ActivityItem {
  id: string;
  type: 'member_added' | 'event_created' | 'follow_up_completed' | 'notification_sent';
  title: string;
  description: string;
  timestamp: Date | string;
  user: {
    name: string;
    role: string;
  };
}

interface MemberData {
  _id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface EventData {
  _id: string;
  name: string;
  createdAt: string;
  organizer?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface FollowUpData {
  _id: string;
  completedAt?: string;
  updatedAt: string;
  memberId?: {
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface NotificationData {
  _id: string;
  title: string;
  createdAt: string;
  senderId?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface ActivityFeedProps {
  className?: string;
  limit?: number;
}

export function ActivityFeed({ className, limit = 5 }: ActivityFeedProps) {
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        
        // Fetch recent members
        const membersResponse = await fetch('/api/members?limit=2&sortBy=createdAt&sortOrder=desc');
        const membersData = await membersResponse.json();
        
        // Fetch recent events
        const eventsResponse = await fetch('/api/events?limit=2&sortBy=createdAt&sortOrder=desc');
        const eventsData = await eventsResponse.json();
        
        // Fetch recent follow-ups
        const followUpsResponse = await fetch('/api/follow-ups?limit=2&status=Completed&sortBy=completedAt&sortOrder=desc');
        const followUpsData = await followUpsResponse.json();
        
        // Fetch recent notifications
        const notificationsResponse = await fetch('/api/notifications?limit=2&sortBy=createdAt&sortOrder=desc');
        const notificationsData = await notificationsResponse.json();
        
        // Combine and transform the data
        const combinedActivities: ActivityItem[] = [];
        
        // Add members
        if (membersData.success && membersData.data.members) {
          membersData.data.members.forEach((member: MemberData) => {
            combinedActivities.push({
              id: `member-${member._id}`,
              type: 'member_added',
              title: 'New Member Added',
              description: `${member.firstName} ${member.lastName} was added as a new member`,
              timestamp: member.createdAt,
              user: {
                name: member.createdBy?.firstName ? `${member.createdBy.firstName} ${member.createdBy.lastName}` : 'System',
                role: member.createdBy?.role || 'System'
              }
            });
          });
        }
        
        // Add events
        if (eventsData.success && eventsData.data.events) {
          eventsData.data.events.forEach((event: EventData) => {
            combinedActivities.push({
              id: `event-${event._id}`,
              type: 'event_created',
              title: 'Event Created',
              description: `${event.name} was scheduled`,
              timestamp: event.createdAt,
              user: {
                name: event.organizer?.firstName ? `${event.organizer.firstName} ${event.organizer.lastName}` : 'System',
                role: event.organizer?.role || 'System'
              }
            });
          });
        }
        
        // Add follow-ups
        if (followUpsData.success && followUpsData.data.followUps) {
          followUpsData.data.followUps.forEach((followUp: FollowUpData) => {
            combinedActivities.push({
              id: `followup-${followUp._id}`,
              type: 'follow_up_completed',
              title: 'Follow-up Completed',
              description: `Follow-up with ${followUp.memberId?.firstName} ${followUp.memberId?.lastName} was completed`,
              timestamp: followUp.completedAt || followUp.updatedAt,
              user: {
                name: followUp.assignedTo?.firstName ? `${followUp.assignedTo.firstName} ${followUp.assignedTo.lastName}` : 'System',
                role: followUp.assignedTo?.role || 'System'
              }
            });
          });
        }
        
        // Add notifications
        if (notificationsData.success && notificationsData.data.notifications) {
          notificationsData.data.notifications.forEach((notification: NotificationData) => {
            combinedActivities.push({
              id: `notification-${notification._id}`,
              type: 'notification_sent',
              title: 'Notification Sent',
              description: notification.title,
              timestamp: notification.createdAt,
              user: {
                name: notification.senderId?.firstName ? `${notification.senderId.firstName} ${notification.senderId.lastName}` : 'System',
                role: notification.senderId?.role || 'System'
              }
            });
          });
        }
        
        // Sort by timestamp (newest first)
        combinedActivities.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA;
        });
        
        setActivities(combinedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: 'Error',
          description: 'Failed to load activity feed',
          variant: 'destructive',
        });
        
        // Fallback to sample data if API calls fail
        setActivities([
          {
            id: '1',
            type: 'member_added',
            title: 'New Member Added',
            description: 'John Doe was added as a new member',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            user: {
              name: 'Admin User',
              role: 'Admin'
            }
          },
          {
            id: '2',
            type: 'event_created',
            title: 'Event Created',
            description: 'Sunday Service was scheduled',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            user: {
              name: 'Pastor James',
              role: 'Pastor'
            }
          },
          {
            id: '3',
            type: 'follow_up_completed',
            title: 'Follow-up Completed',
            description: 'Follow-up with Sarah Johnson was completed',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            user: {
              name: 'Mary Wilson',
              role: 'ClusterLead'
            }
          },
          {
            id: '4',
            type: 'notification_sent',
            title: 'Notifications Sent',
            description: 'Event reminder sent to 24 members',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
            user: {
              name: 'System',
              role: 'System'
            }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, [toast]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'member_added':
        return <User className="h-4 w-4" />;
      case 'event_created':
        return <Calendar className="h-4 w-4" />;
      case 'follow_up_completed':
        return <MessageSquare className="h-4 w-4" />;
      case 'notification_sent':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityTypeLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'member_added':
        return 'Member';
      case 'event_created':
        return 'Event';
      case 'follow_up_completed':
        return 'Follow-up';
      case 'notification_sent':
        return 'Notification';
      default:
        return 'Activity';
    }
  };

  return (
    <DataCard 
      title="Recent Activity" 
      icon={<Activity className="h-4 w-4" />}
      className={className}
      action={{
        label: "View All",
        onClick: () => console.log("View all activities")
      }}
      isLoading={isLoading}
    >
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, limit).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {getActivityTypeLabel(activity.type)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{formatDate(activity.timestamp)}</span>
                  <span className="mx-1">•</span>
                  <span>{activity.user.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DataCard>
  );
}
