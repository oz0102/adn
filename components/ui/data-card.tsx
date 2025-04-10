import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
}

export function DataCard({
  title,
  children,
  icon,
  className,
  action,
  footer,
}: DataCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {title}
        </CardTitle>
        {action && (
          <Button variant="ghost" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
