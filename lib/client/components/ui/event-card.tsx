import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

interface EventCardProps {
  title: string;
  description?: string;
  startDate: Date | string;
  endDate?: Date | string;
  location?: string;
  eventType?: string;
  imageUrl?: string;
  onClick?: () => void;
  onRegister?: () => void;
  className?: string;
}

export function EventCard({
  title,
  description,
  startDate,
  endDate,
  location,
  eventType,
  imageUrl,
  onClick,
  onRegister,
  className,
}: EventCardProps) {
  const formattedStartDate = formatDate(new Date(startDate));
  const formattedEndDate = endDate ? formatDate(new Date(endDate)) : null;
  
  const startTime = new Date(startDate).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const endTime = endDate ? new Date(endDate).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : null;

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
        <div className="relative h-48 w-full">
          <Image 
            src={imageUrl} 
            alt={title} 
            fill
            className="object-cover"
          />
          {eventType && (
            <Badge className="absolute top-2 right-2 z-10">
              {eventType}
            </Badge>
          )}
        </div>
      )}
      <CardHeader className={cn(
        "px-4 py-3",
        !imageUrl && eventType && "flex flex-row items-center justify-between"
      )}>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {!imageUrl && eventType && (
          <Badge>
            {eventType}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {formattedStartDate}
              {formattedEndDate && formattedStartDate !== formattedEndDate && (
                <> - {formattedEndDate}</>
              )}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              {startTime}
              {endTime && (
                <> - {endTime}</>
              )}
            </span>
          </div>
          
          {location && (
            <div className="flex items-center text-sm">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
        
        {onRegister && (
          <div className="pt-2">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onRegister();
              }}
              className="w-full"
            >
              Register
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
