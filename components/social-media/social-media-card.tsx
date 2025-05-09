// components/social-media/social-media-card.tsx
"use client"

import React from "react"; // Added React import
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge"; // Removed unused import
import { ArrowUpIcon, ArrowDownIcon, RefreshCwIcon, ExternalLinkIcon, MoreVerticalIcon, EditIcon, Trash2Icon } from "lucide-react";
import { SocialMediaPlatform } from "@/models/socialMediaAccount"; // Removed IFollowerHistoryEntry as it's not used here
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { PopulatedSocialMediaAccount } from "@/app/(dashboard)/social-media/page"; // Import the type from the page

// Platform icon mapping
export const PlatformIcon = ({ platform }: { platform: SocialMediaPlatform }) => {
  // Using a simple text representation for brevity, replace with actual SVGs if needed
  const iconStyle = "h-5 w-5";
  switch (platform) {
    case SocialMediaPlatform.Twitter: return <span className={iconStyle}>🐦</span>; // Placeholder
    case SocialMediaPlatform.Facebook: return <span className={iconStyle}>👍</span>; // Placeholder
    case SocialMediaPlatform.YouTube: return <span className={iconStyle}>▶️</span>; // Placeholder
    case SocialMediaPlatform.Instagram: return <span className={iconStyle}>📸</span>; // Placeholder
    case SocialMediaPlatform.TikTok: return <span className={iconStyle}>🎵</span>; // Placeholder
    case SocialMediaPlatform.Telegram: return <span className={iconStyle}>✈️</span>; // Placeholder
    default: return <span className={iconStyle}>🌐</span>; // Placeholder for unknown
  }
};

// Growth indicator component
export const GrowthIndicator = ({ value }: { value: number }) => {
  const absValue = Math.abs(value);
  const displayValue = isNaN(absValue) ? "N/A" : absValue.toLocaleString();

  // This is a simplified growth display. Real percentage would need previous value.
  // For now, just showing the count.

  if (value > 0) {
    return (
      <div className="flex items-center text-green-600">
        <ArrowUpIcon className="h-4 w-4 mr-1" />
        <span>{displayValue}</span>
      </div>
    );
  } else if (value < 0) {
    return (
      <div className="flex items-center text-red-600">
        <ArrowDownIcon className="h-4 w-4 mr-1" />
        <span>{displayValue}</span>
      </div>
    );
  } else {
    return <span>{displayValue}</span>;
  }
};

// Platform color mapping
export const getPlatformColor = (platform: SocialMediaPlatform) => {
  switch (platform) {
    case SocialMediaPlatform.Twitter: return "bg-sky-500 text-white";
    case SocialMediaPlatform.Facebook: return "bg-blue-600 text-white";
    case SocialMediaPlatform.YouTube: return "bg-red-600 text-white";
    case SocialMediaPlatform.Instagram: return "bg-pink-500 text-white";
    case SocialMediaPlatform.TikTok: return "bg-black text-white";
    case SocialMediaPlatform.Telegram: return "bg-sky-400 text-white";
    default: return "bg-gray-500 text-white";
  }
};

interface SocialMediaAccountCardProps {
  account?: PopulatedSocialMediaAccount; // Make account optional for skeleton
  onUpdate?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading: boolean;
}

export const SocialMediaAccountCard = ({
  account,
  onUpdate,
  onEdit,
  onDelete,
  isLoading
}: SocialMediaAccountCardProps) => {

  if (isLoading || !account) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-4">
          <Skeleton className="h-9 w-24" />
          <div className="space-x-2 flex">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  const lastUpdateDate = account.lastFollowerUpdate ? new Date(account.lastFollowerUpdate).toLocaleDateString() : "N/A";
  const followerCount = account.followerCount ?? 0;

  // Simplified growth calculation (difference from previous history entry)
  let weeklyGrowth = 0;
  let monthlyGrowth = 0;

  if (account.followerHistory && account.followerHistory.length > 1) {
    const history = [...account.followerHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestCount = history[0].count;
    
    // Find entry closest to 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyEntry = history.find(entry => new Date(entry.date) <= sevenDaysAgo);
    if (weeklyEntry) {
      weeklyGrowth = latestCount - weeklyEntry.count;
    }

    // Find entry closest to 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyEntry = history.find(entry => new Date(entry.date) <= thirtyDaysAgo);
    if (monthlyEntry) {
      monthlyGrowth = latestCount - monthlyEntry.count;
    }
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getPlatformColor(account.platform)}`}>
              <PlatformIcon platform={account.platform} />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">{account.platform}</CardTitle>
              <CardDescription>
                <a href={account.link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                  @{account.username} <ExternalLinkIcon className="h-3 w-3 ml-1" />
                </a>
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && <DropdownMenuItem onClick={onEdit}><EditIcon className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>}
              {onDelete && <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50"><Trash2Icon className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Followers</div>
            <div className="text-3xl font-bold">{followerCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Last updated: {lastUpdateDate}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Weekly Growth</div>
              <GrowthIndicator value={weeklyGrowth} />
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-1">Monthly Growth</div>
              <GrowthIndicator value={monthlyGrowth} />
            </div>
          </div>
          {account.notes && (
            <div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">Notes: {account.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        {onUpdate && (
          <Button variant="outline" size="sm" onClick={onUpdate} className="w-full">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Update Followers
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

