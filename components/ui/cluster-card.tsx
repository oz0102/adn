import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClusterCardProps {
  id: string;
  name: string;
  location: string;
  leaderName?: string;
  memberCount?: number;
  meetingDay?: string;
  meetingTime?: string;
  meetingFrequency?: string;
  imageUrl?: string;
  onClick?: () => void;
  onViewMembers?: () => void;
  className?: string;
}

export function ClusterCard({
  id,
  name,
  location,
  leaderName,
  memberCount,
  meetingDay,
  meetingTime,
  meetingFrequency,
  imageUrl,
  onClick,
  onViewMembers,
  className,
}: ClusterCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:border-primary/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative h-40 w-full">
          <img 
            src={imageUrl} 
            alt={name} 
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Location</p>
          <p>{location}</p>
        </div>
        
        {leaderName && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Leader</p>
            <p>{leaderName}</p>
          </div>
        )}
        
        {memberCount !== undefined && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Members</p>
            <p>{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
          </div>
        )}
        
        {(meetingDay || meetingTime || meetingFrequency) && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Meeting Schedule</p>
            <p>
              {meetingDay && meetingDay}
              {meetingTime && ` at ${meetingTime}`}
              {meetingFrequency && ` (${meetingFrequency})`}
            </p>
          </div>
        )}
        
        {onViewMembers && (
          <div className="pt-2">
            <Button 
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onViewMembers();
              }}
            >
              View Members
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
