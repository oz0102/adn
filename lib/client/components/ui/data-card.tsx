import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface DataCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  footer?: React.ReactNode;
  isLoading?: boolean;
}

export function DataCard({
  title,
  children,
  icon,
  className,
  action,
  footer,
  isLoading = false,
}: DataCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {title}
        </CardTitle>
        {action && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={action.onClick}
            disabled={isLoading}
          >
            {action.label}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      {footer && (
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
