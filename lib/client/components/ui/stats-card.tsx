import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  className?: string;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  change,
  changeType = 'neutral',
  className,
  isLoading = false,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {(description || change !== undefined) && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                {change !== undefined && (
                  <span className={cn(
                    "mr-1 flex items-center",
                    changeType === 'increase' && "text-green-500",
                    changeType === 'decrease' && "text-red-500"
                  )}>
                    {changeType === 'increase' && '↑'}
                    {changeType === 'decrease' && '↓'}
                    {change}%
                  </span>
                )}
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
