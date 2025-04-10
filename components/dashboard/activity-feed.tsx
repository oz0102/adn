// components/dashboard/activity-feed.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { DataCard } from '@/components/ui/data-card';
import { Activity, User, Calendar, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

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

interface ActivityFeedProps {
  className?: string;
  limit?: number;
}

export function ActivityFeed({ className, limit = 5 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    // For now, we'll use placeholder data
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
      },
      {
        id: '5',
        type: 'member_added',
        title: 'New Member Added',
        description: 'Jane Smith was added as a new member',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        user: {
          name: 'Admin User',
          role: 'Admin'
        }
      },
      {
        id: '6',
        type: 'event_created',
        title: 'Event Created',
        description: 'Bible Study was scheduled',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 hours ago
        user: {
          name: 'Pastor James',
          role: 'Pastor'
        }
      }
    ]);
  }, []);

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
    >
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
    </DataCard>
  );
}
