// // UI components for Social Media Tracker
// //components\social-media\social-media-card.tsx
// 'use client'
// import React from 'react';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { ArrowUpIcon, ArrowDownIcon, RefreshCwIcon } from 'lucide-react';
// import { SocialMediaPlatform } from '@/models/socialMediaAccount';

// // Platform icon mapping
// export const PlatformIcon = ({ platform }: { platform: SocialMediaPlatform }) => {
//   switch (platform) {
//     case SocialMediaPlatform.TWITTER:
//       return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>;
//     case SocialMediaPlatform.FACEBOOK:
//       return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>;
//     case SocialMediaPlatform.YOUTUBE:
//       return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" /></svg>;
//     case SocialMediaPlatform.INSTAGRAM:
//       return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>;
//     case SocialMediaPlatform.TIKTOK:
//       return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>;
//     case SocialMediaPlatform.TELEGRAM:
//       return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>;
//     default:
//       return null;
//   }
// };

// // Growth indicator component
// export const GrowthIndicator = ({ value }: { value: number }) => {
//   if (value > 0) {
//     return (
//       <div className="flex items-center text-green-600">
//         <ArrowUpIcon className="h-4 w-4 mr-1" />
//         <span>{value.toLocaleString()}</span>
//       </div>
//     );
//   } else if (value < 0) {
//     return (
//       <div className="flex items-center text-red-600">
//         <ArrowDownIcon className="h-4 w-4 mr-1" />
//         <span>{Math.abs(value).toLocaleString()}</span>
//       </div>
//     );
//   } else {
//     return <span>0</span>;
//   }
// };

// // Platform color mapping
// export const getPlatformColor = (platform: SocialMediaPlatform) => {
//   switch (platform) {
//     case SocialMediaPlatform.TWITTER:
//       return 'bg-blue-500';
//     case SocialMediaPlatform.FACEBOOK:
//       return 'bg-blue-600';
//     case SocialMediaPlatform.YOUTUBE:
//       return 'bg-red-600';
//     case SocialMediaPlatform.INSTAGRAM:
//       return 'bg-pink-500';
//     case SocialMediaPlatform.TIKTOK:
//       return 'bg-black';
//     case SocialMediaPlatform.TELEGRAM:
//       return 'bg-blue-400';
//     default:
//       return 'bg-gray-500';
//   }
// };

// // Social Media Account Card component
// export const SocialMediaAccountCard = ({
//   account,
//   onUpdate,
//   onEdit,
//   onDelete
// }: {
//   account: any;
//   onUpdate: () => void;
//   onEdit: () => void;
//   onDelete: () => void;
// }) => {
//   return (
//     <Card className="overflow-hidden">
//       <CardHeader className="pb-2">
//         <div className="flex justify-between items-center">
//           <div className="flex items-center space-x-2">
//             <div className={`p-2 rounded-full ${getPlatformColor(account.platform)}`}>
//               <PlatformIcon platform={account.platform} />
//             </div>
//             <div>
//               <CardTitle className="text-lg">{account.platform}</CardTitle>
//               <CardDescription>@{account.username}</CardDescription>
//             </div>
//           </div>
//           <Badge variant="outline" className="ml-auto">
//             {new Date(account.lastUpdated).toLocaleDateString()}
//           </Badge>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div>
//             <div className="text-sm text-muted-foreground mb-1">Current Followers</div>
//             <div className="text-2xl font-bold">{account.currentFollowers.toLocaleString()}</div>
//           </div>
          
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <div className="text-sm text-muted-foreground mb-1">Weekly Growth</div>
//               <div className="flex items-center">
//                 <GrowthIndicator value={account.weeklyGrowth?.count || 0} />
//                 <span className="text-xs text-muted-foreground ml-2">
//                   ({(account.weeklyGrowth?.percentage || 0).toFixed(2)}%)
//                 </span>
//               </div>
//             </div>
            
//             <div>
//               <div className="text-sm text-muted-foreground mb-1">Monthly Growth</div>
//               <div className="flex items-center">
//                 <GrowthIndicator value={account.monthlyGrowth?.count || 0} />
//                 <span className="text-xs text-muted-foreground ml-2">
//                   ({(account.monthlyGrowth?.percentage || 0).toFixed(2)}%)
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//       <CardFooter className="flex justify-between pt-2">
//         <Button variant="outline" size="sm" onClick={onUpdate}>
//           <RefreshCwIcon className="h-4 w-4 mr-2" />
//           Update
//         </Button>
//         <div className="space-x-2">
//           <Button variant="ghost" size="sm" onClick={onEdit}>
//             Edit
//           </Button>
//           <Button variant="destructive" size="sm" onClick={onDelete}>
//             Delete
//           </Button>
//         </div>
//       </CardFooter>
//     </Card>
//   );
// };


"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpIcon, ArrowDownIcon, RefreshCwIcon, ExternalLinkIcon, MoreVerticalIcon } from "lucide-react"
import { SocialMediaPlatform } from "@/models/socialMediaAccount"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Platform icon mapping - preserved from original
export const PlatformIcon = ({ platform }: { platform: SocialMediaPlatform }) => {
  switch (platform) {
    case SocialMediaPlatform.TWITTER:
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )
    case SocialMediaPlatform.FACEBOOK:
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      )
    case SocialMediaPlatform.YOUTUBE:
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
            clipRule="evenodd"
          />
        </svg>
      )
    case SocialMediaPlatform.INSTAGRAM:
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
            clipRule="evenodd"
          />
        </svg>
      )
    case SocialMediaPlatform.TIKTOK:
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      )
    case SocialMediaPlatform.TELEGRAM:
      return (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      )
    default:
      return null
  }
}

// Enhanced Growth indicator component
export const GrowthIndicator = ({ value, percentage }: { value: number; percentage?: number }) => {
  if (value > 0) {
    return (
      <div className="flex items-center text-green-600">
        <ArrowUpIcon className="h-4 w-4 mr-1" />
        <span className="font-medium">{value.toLocaleString()}</span>
        {percentage !== undefined && <span className="text-xs ml-1.5 text-green-500">(+{percentage.toFixed(2)}%)</span>}
      </div>
    )
  } else if (value < 0) {
    return (
      <div className="flex items-center text-red-600">
        <ArrowDownIcon className="h-4 w-4 mr-1" />
        <span className="font-medium">{Math.abs(value).toLocaleString()}</span>
        {percentage !== undefined && <span className="text-xs ml-1.5 text-red-500">({percentage.toFixed(2)}%)</span>}
      </div>
    )
  } else {
    return <span className="text-muted-foreground">No change</span>
  }
}

// Export the original getPlatformColor function to maintain compatibility with analytics-components.tsx
export const getPlatformColor = (platform: SocialMediaPlatform) => {
  switch (platform) {
    case SocialMediaPlatform.TWITTER:
      return "bg-blue-500"
    case SocialMediaPlatform.FACEBOOK:
      return "bg-blue-600"
    case SocialMediaPlatform.YOUTUBE:
      return "bg-red-600"
    case SocialMediaPlatform.INSTAGRAM:
      return "bg-pink-500"
    case SocialMediaPlatform.TIKTOK:
      return "bg-black"
    case SocialMediaPlatform.TELEGRAM:
      return "bg-blue-400"
    default:
      return "bg-gray-500"
  }
}

// Enhanced platform color mapping with gradients and border colors
export const getPlatformStyles = (platform: SocialMediaPlatform) => {
  switch (platform) {
    case SocialMediaPlatform.TWITTER:
      return {
        bg: "bg-gradient-to-r from-blue-500/10 to-blue-600/5",
        border: "border-blue-500/20",
        color: "text-blue-500",
        iconBg: "bg-blue-500",
        progressColor: "bg-blue-500",
      }
    case SocialMediaPlatform.FACEBOOK:
      return {
        bg: "bg-gradient-to-r from-blue-600/10 to-blue-700/5",
        border: "border-blue-600/20",
        color: "text-blue-600",
        iconBg: "bg-blue-600",
        progressColor: "bg-blue-600",
      }
    case SocialMediaPlatform.YOUTUBE:
      return {
        bg: "bg-gradient-to-r from-red-600/10 to-red-700/5",
        border: "border-red-600/20",
        color: "text-red-600",
        iconBg: "bg-red-600",
        progressColor: "bg-red-600",
      }
    case SocialMediaPlatform.INSTAGRAM:
      return {
        bg: "bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-orange-500/5",
        border: "border-pink-500/20",
        color: "text-pink-500",
        iconBg: "bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500",
        progressColor: "bg-pink-500",
      }
    case SocialMediaPlatform.TIKTOK:
      return {
        bg: "bg-gradient-to-r from-black/10 to-cyan-500/5",
        border: "border-black/20",
        color: "text-black",
        iconBg: "bg-black",
        progressColor: "bg-black",
      }
    case SocialMediaPlatform.TELEGRAM:
      return {
        bg: "bg-gradient-to-r from-blue-400/10 to-blue-500/5",
        border: "border-blue-400/20",
        color: "text-blue-400",
        iconBg: "bg-blue-400",
        progressColor: "bg-blue-400",
      }
    default:
      return {
        bg: "bg-gradient-to-r from-gray-500/10 to-gray-600/5",
        border: "border-gray-500/20",
        color: "text-gray-500",
        iconBg: "bg-gray-500",
        progressColor: "bg-gray-500",
      }
  }
}

// Format large numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

// Enhanced Social Media Account Card component
export const SocialMediaAccountCard = ({
  account,
  onUpdate,
  onEdit,
  onDelete,
}: {
  account: any
  onUpdate: () => void
  onEdit: () => void
  onDelete: () => void
}) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const platformStyles = getPlatformStyles(account.platform)

  // Handle update with loading state
  const handleUpdate = async () => {
    setIsUpdating(true)
    await onUpdate()
    setIsUpdating(false)
  }

  // Calculate progress values for growth visualization (0-100)
  const weeklyGrowthPercentage = account.weeklyGrowth?.percentage || 0
  const monthlyGrowthPercentage = account.monthlyGrowth?.percentage || 0
  const weeklyProgress = Math.min(Math.abs(weeklyGrowthPercentage) * 5, 100)
  const monthlyProgress = Math.min(Math.abs(monthlyGrowthPercentage) * 2, 100)

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md border-t-4 ${platformStyles.border}`}>
      <CardHeader className={`${platformStyles.bg} pb-3 pt-4`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${platformStyles.iconBg} text-white`}>
              <PlatformIcon platform={account.platform} />
            </div>
            <div>
              <CardTitle className={`text-lg ${platformStyles.color}`}>{account.platform}</CardTitle>
              <CardDescription className="flex items-center">@{account.username}</CardDescription>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="ml-auto">
                  {new Date(account.lastUpdated).toLocaleDateString()}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last updated</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-5">
          <div className="flex justify-between items-baseline">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current Followers</div>
              <div className="text-3xl font-bold">{formatNumber(account.currentFollowers)}</div>
            </div>

            {account.profileUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={account.profileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visit profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Weekly Growth</span>
                <GrowthIndicator
                  value={account.weeklyGrowth?.count || 0}
                  percentage={account.weeklyGrowth?.percentage || 0}
                />
              </div>
              <div className="relative w-full">
                <Progress
                  value={weeklyProgress}
                  className={`h-1.5 ${weeklyGrowthPercentage >= 0 ? "bg-muted/50" : "bg-red-100"}`}
                />
                <div
                  className={`absolute top-0 left-0 h-1.5 rounded-full ${weeklyGrowthPercentage >= 0 ? platformStyles.progressColor : "bg-red-500"}`}
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Monthly Growth</span>
                <GrowthIndicator
                  value={account.monthlyGrowth?.count || 0}
                  percentage={account.monthlyGrowth?.percentage || 0}
                />
              </div>
              <div className="relative w-full">
                <Progress
                  value={monthlyProgress}
                  className={`h-1.5 ${monthlyGrowthPercentage >= 0 ? "bg-muted/50" : "bg-red-100"}`}
                />
                <div
                  className={`absolute top-0 left-0 h-1.5 rounded-full ${monthlyGrowthPercentage >= 0 ? platformStyles.progressColor : "bg-red-500"}`}
                  style={{ width: `${monthlyProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-2 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpdate}
          disabled={isUpdating}
          className={`${platformStyles.border} hover:${platformStyles.bg}`}
        >
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
          {isUpdating ? "Updating..." : "Update"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit Account</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}
