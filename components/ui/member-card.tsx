import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  status?: 'active' | 'inactive';
  tags?: string[];
  onClick?: () => void;
  className?: string;
}

export function MemberCard({
  name,
  role,
  email,
  phone,
  imageUrl,
  status = 'active',
  tags = [],
  onClick,
  className,
}: MemberCardProps) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all hover:border-primary/50 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{name}</h3>
              {status && (
                <Badge variant={status === 'active' ? "default" : "secondary"}>
                  {status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
            {role && <p className="text-sm text-muted-foreground">{role}</p>}
            {email && (
              <p className="text-sm text-muted-foreground truncate">{email}</p>
            )}
            {phone && (
              <p className="text-sm text-muted-foreground">{phone}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
