import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  subject: string;
  content: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  status: 'Pending' | 'Sent' | 'Failed';
  recipientName?: string;
  sentAt?: Date | string;
  relatedEntityType?: string;
  relatedEntityName?: string;
  onClick?: () => void;
  onResend?: () => void;
  className?: string;
}

export function NotificationCard({
  subject,
  content,
  type,
  status,
  recipientName,
  sentAt,
  relatedEntityType,
  relatedEntityName,
  onClick,
  onResend,
  className,
}: NotificationCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'Sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'Failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'Email':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'SMS':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500';
      case 'WhatsApp':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500';
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
        <CardTitle className="text-base font-medium">{subject}</CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline" className={cn("font-normal", getTypeColor())}>
            {type}
          </Badge>
          <Badge variant="outline" className={cn("font-normal", getStatusColor())}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {content}
        </p>
        
        {recipientName && (
          <div className="text-sm">
            <span className="font-medium">Recipient:</span> {recipientName}
          </div>
        )}
        
        {sentAt && (
          <div className="text-sm">
            <span className="font-medium">Sent:</span> {formatDate(sentAt)}
          </div>
        )}
        
        {relatedEntityType && relatedEntityName && (
          <div className="text-sm">
            <span className="font-medium">Related to:</span> {relatedEntityType} - {relatedEntityName}
          </div>
        )}
        
        {onResend && status === 'Failed' && (
          <div className="pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onResend();
              }}
            >
              Resend
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
