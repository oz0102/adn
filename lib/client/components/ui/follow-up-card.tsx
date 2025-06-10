import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FollowUpCardProps {
  personName: string;
  personType: 'New Attendee' | 'Member';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  eventName?: string;
  eventDate?: Date | string;
  nextFollowUpDate?: Date | string;
  assignedTo?: string;
  attempts?: number;
  onClick?: () => void;
  onUpdateStatus?: (status: 'Pending' | 'In Progress' | 'Completed' | 'Failed') => void;
  className?: string;
}

export function FollowUpCard({
  personName,
  personType,
  status,
  eventName,
  eventDate,
  nextFollowUpDate,
  assignedTo,
  attempts = 0,
  onClick,
  onUpdateStatus,
  className,
}: FollowUpCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'Failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500';
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:border-primary/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">{personName}</CardTitle>
        <Badge variant="outline" className={cn("font-normal", getStatusColor())}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-2">
        <div className="flex justify-between items-center">
          <Badge variant="secondary">{personType}</Badge>
          {attempts > 0 && (
            <span className="text-xs text-muted-foreground">
              {attempts} attempt{attempts !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {eventName && (
          <div className="text-sm">
            <span className="font-medium">Event:</span> {eventName}
            {eventDate && <> ({formatDate(eventDate)})</>}
          </div>
        )}
        
        {nextFollowUpDate && (
          <div className="text-sm">
            <span className="font-medium">Next follow-up:</span> {formatDate(nextFollowUpDate)}
          </div>
        )}
        
        {assignedTo && (
          <div className="text-sm">
            <span className="font-medium">Assigned to:</span> {assignedTo}
          </div>
        )}
        
        {onUpdateStatus && (
          <div className="pt-2 flex flex-wrap gap-2">
            {status !== 'Completed' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus('Completed');
                }}
              >
                Mark Complete
              </Button>
            )}
            {status !== 'In Progress' && status !== 'Completed' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus('In Progress');
                }}
              >
                Start
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
