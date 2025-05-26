// // app/(dashboard)/social-media/page.tsx
// "use client"

// import React, { useState, useEffect, useCallback } from "react";
// import Link from "next/link";
// import { SocialMediaAccountCard } from "@/components/social-media/social-media-card";
// import { SocialMediaDialog } from "@/components/social-media/social-media-dialog";
// import { DeleteAccountDialog } from "@/components/social-media/delete-account-dialog";
// import { Button } from "@/components/ui/button";
// import {
//   PlusIcon,
//   RefreshCwIcon,
//   BarChart3Icon,
//   TrendingUpIcon,
//   UsersIcon,
//   ArrowUpIcon,
//   LineChartIcon,
//   LayoutDashboardIcon,
//   ListIcon,
//   AlertTriangleIcon,
// } from "lucide-react";
// import { socialMediaService } from "@/services/socialMediaService"; // Corrected: This will now import the object containing all service methods
// import { useToast } from "@/components/ui/use-toast";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { ISocialMediaAccount, SocialMediaPlatform, IFollowerHistoryEntry } from "@/models/socialMediaAccount"; // Import the interface
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { GrowthSummary } from "@/components/social-media/analytics-components";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Badge } from "@/components/ui/badge";
// import { useAuthStore } from "@/lib/store";
// import { checkPermission } from "@/lib/permissions";
// import mongoose from "mongoose";
// import { ICenter } from "@/models/center";

// // Type for populated account, matching service layer if possible
// export interface PopulatedSocialMediaAccount extends Omit<ISocialMediaAccount, "centerId" | "createdBy"> {
//   _id: string; // Ensure _id is string if it's transformed from ObjectId
//   centerId?: { _id: string; name: string; } | null; 
//   createdBy?: { _id: string; email: string; } | null;
//   followerHistory: IFollowerHistoryEntry[];
// }

// // Mock service for updating all followers - replace with actual if available
// const mockUpdateAllFollowersService = async () => {
//   console.warn("mockUpdateAllFollowersService called. Implement actual service.");
//   // Simulate API call
//   return new Promise(resolve => setTimeout(resolve, 1000));
// };

// export default function SocialMediaTrackerPage() {
//   const { user } = useAuthStore();
//   const [accounts, setAccounts] = useState<PopulatedSocialMediaAccount[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [editAccount, setEditAccount] = useState<PopulatedSocialMediaAccount | null>(null);
//   const [deleteAccount, setDeleteAccount] = useState<PopulatedSocialMediaAccount | null>(null);
//   const [activeTab, setActiveTab] = useState("dashboard");
//   const { toast } = useToast();

//   const canManageSocialMedia = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"]) : false;
//   const canViewSocialMedia = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"]) : false;

//   const fetchAccounts = useCallback(async () => {
//     if (!user) return;
//     try {
//       setIsLoading(true);
//       // Determine scope based on user role
//       let filters: any = {}; // Define filters type more strictly if possible
//       if (checkPermission(user, ["CENTER_ADMIN"])) {
//         const centerAdminRole = user.assignedRoles?.find(r => r.role === "CENTER_ADMIN");
//         if (centerAdminRole?.scopeId) {
//           filters.scope = "CENTER";
//           filters.centerId = centerAdminRole.scopeId;
//         } else {
//           // Center admin without specific centerId, might mean they can see all center accounts or none if not HQ
//           // This case needs clarification based on business logic. For now, assume they see accounts for their center(s).
//           // If a center admin can be assigned to multiple centers, this logic needs adjustment.
//           // Fallback to HQ if no specific center, or throw error, or show no accounts.
//         }
//       } else if (checkPermission(user, ["HQ_ADMIN"])) {
//         // HQ_ADMIN can see all accounts, or filter by scope=HQ or specific centerId if they choose
//         // For now, let's assume they see all by default, or you can add UI filters for them
//       }

//       const data = await socialMediaService.getAllSocialMediaAccounts(filters); // Corrected: Use the imported object
//       // Ensure _id is string if necessary, and other transformations
//       const transformedData = data.map(acc => ({
//         ...acc,
//         _id: acc._id.toString(),
//         centerId: acc.centerId ? { ...acc.centerId, _id: acc.centerId._id.toString() } : null,
//         createdBy: acc.createdBy ? { ...acc.createdBy, _id: acc.createdBy._id.toString() } : null,
//       })) as PopulatedSocialMediaAccount[];
//       setAccounts(transformedData);
//     } catch (error: any) {
//       console.error("Failed to fetch accounts:", error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to fetch accounts",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [user, toast]);

//   useEffect(() => {
//     if (canViewSocialMedia) {
//       fetchAccounts();
//     }
//   }, [canViewSocialMedia, fetchAccounts]);

//   const updateAllFollowers = async () => {
//     if (!canManageSocialMedia) return;
//     try {
//       setIsUpdating(true);
//       // Replace with actual service if available
//       // await socialMediaService.updateAllFollowerCounts(); // Corrected: Use the imported object
//       await mockUpdateAllFollowersService();
//       await fetchAccounts();
//       toast({
//         title: "Followers updated",
//         description: "All social media accounts have been updated.",
//       });
//     } catch (error: any) {
//       console.error("Failed to update all followers:", error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update followers",
//         variant: "destructive",
//       });
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const updateAccountFollowers = async (id: string) => {
//     if (!canManageSocialMedia) return;
//     try {
//       await socialMediaService.updateFollowerCount(id, 0); // Corrected: Use the imported object. The `0` here is a placeholder, the service should fetch the actual count
//       await fetchAccounts();
//       toast({
//         title: "Followers updated",
//         description: "Account followers have been updated.",
//       });
//     } catch (error: any) {
//       console.error(`Failed to update followers for account ${id}:`, error);
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update followers for this account",
//         variant: "destructive",
//       });
//     }
//   };

//   const getFilteredAccounts = (platform: string) => {
//     if (platform === "all") return accounts;
//     return accounts.filter(account => account.platform === platform);
//   };

//   if (!user) {
//     return <div className="text-center py-10">Authenticating...</div>;
//   }

//   if (!canViewSocialMedia && !isLoading) {
//     return (
//       <div className="container mx-auto py-10 text-center">
//         <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
//         <h2 className="text-xl font-semibold mb-2">Permission Denied</h2>
//         <p className="text-muted-foreground">
//           You do not have permission to view this page.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Social Media Tracker</h1>
//           <p className="text-muted-foreground">
//             Track follower counts and growth across your social media platforms.
//           </p>
//         </div>
//         {canManageSocialMedia && (
//           <div className="flex space-x-2">
//             <Button 
//               variant="outline" 
//               onClick={updateAllFollowers} 
//               disabled={isUpdating || accounts.length === 0}
//             >
//               <RefreshCwIcon className="h-4 w-4 mr-2" />
//               {isUpdating ? "Updating..." : "Update All"}
//             </Button>
//             <Button onClick={() => setIsAddDialogOpen(true)}>
//               <PlusIcon className="h-4 w-4 mr-2" />
//               Add Account
//             </Button>
//           </div>
//         )}
//       </div>

//       <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="mb-4">
//           <TabsTrigger value="dashboard"><LayoutDashboardIcon className="mr-2 h-4 w-4"/>Dashboard</TabsTrigger>
//           <TabsTrigger value="accounts"><ListIcon className="mr-2 h-4 w-4"/>Accounts</TabsTrigger>
//           {Object.values(SocialMediaPlatform).map((platform) => (
//             <TabsTrigger key={platform} value={platform}>
//               {platform}
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         <TabsContent value="dashboard" className="mt-0">
//           {isLoading ? (
//             <GrowthSummary accounts={[]} isLoading={true} /> // Show skeleton within GrowthSummary
//           ) : accounts.length === 0 ? (
//             <div className="text-center py-10">
//               No social media accounts added yet. Click "Add Account" to get started.
//             </div>
//           ) : (
//             <>
//               <GrowthSummary accounts={accounts} isLoading={false} />
//               <div className="grid gap-4 md:grid-cols-3 mt-6">
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Manage Accounts</CardTitle>
//                     <UsersIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">{accounts.length} Accounts</div>
//                     <p className="text-xs text-muted-foreground">
//                       Add, edit, and remove social media accounts
//                     </p>
//                   </CardContent>
//                   <CardFooter>
//                     <Button className="w-full" onClick={() => setActiveTab("accounts")}>
//                       View Accounts
//                     </Button>
//                   </CardFooter>
//                 </Card>

//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Track Growth</CardTitle>
//                     <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">Analytics</div>
//                     <p className="text-xs text-muted-foreground">
//                       Monitor follower counts and analyze trends
//                     </p>
//                   </CardContent>
//                   <CardFooter>
//                     <Button className="w-full" asChild>
//                       <Link href="/dashboard/social-media/analytics">View Analytics</Link>
//                     </Button>
//                   </CardFooter>
//                 </Card>

//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Performance</CardTitle>
//                     <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">View Trends</div>
//                      <p className="text-xs text-muted-foreground">
//                       Compare growth rates across platforms
//                     </p>
//                   </CardContent>
//                    <CardFooter>
//                      <Button className="w-full" asChild>
//                       <Link href="/dashboard/social-media/analytics">View Growth</Link>
//                     </Button>
//                   </CardFooter>
//                 </Card>
//               </div>
//             </>
//           )}
//         </TabsContent>

//         <TabsContent value="accounts" className="mt-0">
//           {isLoading ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {[...Array(3)].map((_, i) => <SocialMediaAccountCard key={i} isLoading={true} />)}
//             </div>
//           ) : accounts.length === 0 ? (
//             <div className="text-center py-10">
//               No social media accounts added yet. {canManageSocialMedia && "Click \"Add Account\" to get started."}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {accounts.map((account) => (
//                 <SocialMediaAccountCard
//                   key={account._id}
//                   account={account}
//                   onUpdate={canManageSocialMedia ? () => updateAccountFollowers(account._id) : undefined}
//                   onEdit={canManageSocialMedia ? () => setEditAccount(account) : undefined}
//                   onDelete={canManageSocialMedia ? () => setDeleteAccount(account) : undefined}
//                   isLoading={false}
//                 />
//               ))}
//             </div>
//           )}
//         </TabsContent>

//         {Object.values(SocialMediaPlatform).map((platform) => (
//           <TabsContent key={platform} value={platform} className="mt-0">
//             {isLoading ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {[...Array(3)].map((_, i) => <SocialMediaAccountCard key={i} isLoading={true} />)}
//               </div>
//             ) : getFilteredAccounts(platform).length === 0 ? (
//               <div className="text-center py-10">
//                 No {platform} accounts added yet. {canManageSocialMedia && "Click \"Add Account\" to get started."}
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {getFilteredAccounts(platform).map((account) => (
//                   <SocialMediaAccountCard
//                     key={account._id}
//                     account={account}
//                     onUpdate={canManageSocialMedia ? () => updateAccountFollowers(account._id) : undefined}
//                     onEdit={canManageSocialMedia ? () => setEditAccount(account) : undefined}
//                     onDelete={canManageSocialMedia ? () => setDeleteAccount(account) : undefined}
//                     isLoading={false}
//                   />
//                 ))}
//               </div>
//             )}
//           </TabsContent>
//         ))}
//       </Tabs>

//       {canManageSocialMedia && (
//         <SocialMediaDialog
//           isOpen={isAddDialogOpen || !!editAccount}
//           onClose={() => {
//             setIsAddDialogOpen(false);
//             setEditAccount(null);
//           }}
//           initialData={editAccount}
//           onSuccess={() => {
//             fetchAccounts();
//             setIsAddDialogOpen(false); 
//             setEditAccount(null);
//           }}
//           user={user} // Pass user for permission checks within dialog if needed
//         />
//       )}

//       {canManageSocialMedia && deleteAccount && (
//         <DeleteAccountDialog
//           isOpen={!!deleteAccount}
//           onClose={() => setDeleteAccount(null)}
//           account={deleteAccount} // account here is PopulatedSocialMediaAccount
//           onSuccess={() => {
//             fetchAccounts();
//             setDeleteAccount(null);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// app/(dashboard)/social-media/page.tsx
"use client"

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SocialMediaAccountCard } from "@/components/social-media/social-media-card";
import { SocialMediaDialog } from "@/components/social-media/social-media-dialog";
import { DeleteAccountDialog } from "@/components/social-media/delete-account-dialog";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  RefreshCwIcon,
  BarChart3Icon,
  TrendingUpIcon,
  UsersIcon,
  LayoutDashboardIcon,
  ListIcon,
  AlertTriangleIcon,
} from "lucide-react";
// REMOVE socialMediaService import here!
// import { socialMediaService } from "@/services/socialMediaService";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Import only the types/interfaces needed on the client
import { SocialMediaPlatform } from "@/models/socialMediaAccount";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GrowthSummary } from "@/components/social-media/analytics-components";
import { useAuthStore } from "@/lib/store";
import { checkPermission } from "@/lib/permissions"; // Assuming this checkPermission is okay on client for UI rendering

// Define the type that matches the *API response* format for a populated account
// This might be slightly different from the Mongoose document interface
export interface PopulatedSocialMediaAccount {
  _id: string; // API should return string ID
  platform: SocialMediaPlatform;
  username: string;
  link: string;
  followerCount: number;
  lastFollowerUpdate?: string; // Dates might come as strings from API, or ISO strings
  followerHistory: {
      date: string; // Dates in history might also be strings
      count: number;
  }[];
  scope: "HQ" | "CENTER";
  centerId?: { _id: string; name: string; } | null; // Populate structure
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { _id: string; email: string; } | null; // Populate structure
}

// Define the type expected by GrowthSummary component
// This type should match GrowthSummary's props definition exactly
interface SocialMediaAccountAnalytics {
    _id: string;
    platform: SocialMediaPlatform;
    username: string;
    currentFollowers: number;
    lastUpdated: string; // GrowthSummary might expect Date objects
    followerHistory: Array<{
      date: string;
      count: number;
  }>; // Assuming GrowthSummary uses the original history structure
    scope: "HQ" | "CENTER";
    centerId?: { _id: string; name: string; } | null;
    // Add any other fields required by GrowthSummary
}


// Mock service - this should ideally call your server API
// const mockUpdateAllFollowersService = async () => { /* ... removed ... */ }; // Remove or update to call API

// Define the user type expected by the client-side useAuthStore
interface ClientUser {
    _id: string; // Client side user might have _id as string
    email: string;
    assignedRoles?: { role: string; scopeId?: string | null }[]; // Client side might get scopeId as string
    // ... other user properties needed client-side
}

// Ensure useAuthStore returns the correct type


export default function SocialMediaTrackerPage() {
  const { user } = useAuthStore() as { user: ClientUser | null };
  // Use client-side types for state
  const [accounts, setAccounts] = useState<PopulatedSocialMediaAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<PopulatedSocialMediaAccount | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<PopulatedSocialMediaAccount | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  // Client-side permission checks for UI elements (buttons, dialogs)
  // Add 'await' as checkPermission returns a Promise
  const [canManageSocialMedia, setCanManageSocialMedia] = useState(false);
  const [canViewSocialMedia, setCanViewSocialMedia] = useState(false);

  useEffect(() => {
      const checkPermissions = async () => {
          if (user) {
              setCanManageSocialMedia(await checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"]));
              setCanViewSocialMedia(await checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"]));
          } else {
              setCanManageSocialMedia(false);
              setCanViewSocialMedia(false);
          }
      };
      checkPermissions();
  }, [user]); // Re-check when user changes


  // Fetch accounts from the new API route
  const fetchAccounts = useCallback(async () => {
    if (!user || !canViewSocialMedia) { // Depend on canViewSocialMedia state
        setAccounts([]); // Clear accounts if no permission
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      // Construct URL with filters if needed, but the API route already filters by role
      const response = await fetch('/api/social-media'); // Call your API route
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: PopulatedSocialMediaAccount[] = await response.json();
      setAccounts(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch accounts";
      console.error("Failed to fetch accounts:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, canViewSocialMedia, toast]); // Depend on user, canViewSocialMedia, toast

  // Fetch accounts when user or permissions change
  useEffect(() => {
    if (user && canViewSocialMedia) {
      fetchAccounts();
    } else if (!user) {
        // Clear state if user logs out
        setAccounts([]);
        setIsLoading(false);
    }
  }, [user, canViewSocialMedia, fetchAccounts]); // Rerun when user, canViewSocialMedia, or fetchAccounts change


  // --- Data Mutation Handlers (Call API Routes/Server Actions) ---

  const updateAllFollowers = async () => {
    if (!canManageSocialMedia) return;
    try {
      setIsUpdating(true);
      // Replace with actual fetch call to your server update endpoint
      const response = await fetch('/api/social-media/update-all', { method: 'POST' }); // Example endpoint
      if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      await fetchAccounts(); // Refresh data after update
      toast({
        title: "Followers updated",
        description: "All social media accounts have been updated.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update followers";
      console.error("Failed to update all followers:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAccountFollowers = async (id: string) => {
    if (!canManageSocialMedia) return;
    try {
       // Replace with actual fetch call to your server update endpoint for a single account
      const response = await fetch(`/api/social-media/${id}/update`, { method: 'POST' }); // Example endpoint
       if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
       }
      await fetchAccounts(); // Refresh data
      toast({
        title: "Followers updated",
        description: "Account followers have been updated.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update followers for this account";
      console.error(`Failed to update followers for account ${id}:`, error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getFilteredAccounts = (platform: string) => {
    if (platform === "all") return accounts;
    return accounts.filter(account => account.platform === platform);
  };

  // Map fetched accounts to the type expected by GrowthSummary
   const accountsForAnalytics: SocialMediaAccountAnalytics[] = accounts.map(account => ({
       _id: account._id,
       platform: account.platform,
       username: account.username,
       currentFollowers: account.followerCount,
       lastUpdated: account.lastFollowerUpdate ? new Date(account.lastFollowerUpdate) : new Date(0), // Convert string to Date, provide fallback
       followerHistory: account.followerHistory.map(entry => ({
            date: new Date(entry.date), // Convert date string to Date
            count: entry.count
       })),
       scope: account.scope,
       centerId: account.centerId,
       // Add other properties if GrowthSummary needs them
   }));


  if (!user) {
     // Render loading or redirect if user is not available yet
     return <div className="text-center py-10">Authenticating...</div>;
  }

  if (!canViewSocialMedia && !isLoading) {
    // Only show permission denied if user is loaded and they don't have permission
    return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Permission Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Tracker</h1>
          <p className="text-muted-foreground">
            Track follower counts and growth across your social media platforms.
          </p>
        </div>
        {/* Conditionally render buttons based on client-side permission state */}
        {canManageSocialMedia && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={updateAllFollowers}
              disabled={isUpdating || accounts.length === 0}
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              {isUpdating ? "Updating..." : "Update All"}
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard"><LayoutDashboardIcon className="mr-2 h-4 w-4"/>Dashboard</TabsTrigger>
          <TabsTrigger value="accounts"><ListIcon className="mr-2 h-4 w-4"/>Accounts</TabsTrigger>
          {Object.values(SocialMediaPlatform).map((platform) => (
            <TabsTrigger key={platform} value={platform}>
              {platform}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          {/* Pass the mapped analytics accounts to GrowthSummary */}
          {/* GrowthSummary must be updated to accept isLoading prop if it doesn't already */}
          <GrowthSummary accounts={accountsForAnalytics} isLoading={isLoading} />

          {/* ... rest of dashboard content */}
           {/* Check accounts.length for displaying empty state */}
           {!isLoading && accounts.length === 0 && (
               <div className="text-center py-10">
                  No social media accounts added yet. {canManageSocialMedia && "Click \"Add Account\" to get started."}
               </div>
           )}

           {!isLoading && accounts.length > 0 && (
             <div className="grid gap-4 md:grid-cols-3 mt-6">
                {/* Cards */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Manage Accounts</CardTitle>
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{accounts.length} Accounts</div>
                    <p className="text-xs text-muted-foreground">
                      Add, edit, and remove social media accounts
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setActiveTab("accounts")}>
                      View Accounts
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Track Growth</CardTitle>
                    <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Analytics</div>
                    <p className="text-xs text-muted-foreground">
                      Monitor follower counts and analyze trends
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href="/dashboard/social-media/analytics">View Analytics</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                    <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">View Trends</div>
                     <p className="text-xs text-muted-foreground">
                      Compare growth rates across platforms
                    </p>
                  </CardContent>
                   <CardFooter>
                     <Button className="w-full" asChild>
                      <Link href="/dashboard/social-media/analytics">View Growth</Link>
                    </Button>
                  </CardFooter>
                </Card>
             </div>
           )}

        </TabsContent>

        <TabsContent value="accounts" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <SocialMediaAccountCard key={i} isLoading={true} />)}
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-10">
              No social media accounts added yet. {canManageSocialMedia && "Click \"Add Account\" to get started."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <SocialMediaAccountCard
                  key={account._id}
                  account={account} // account is PopulatedSocialMediaAccount
                  onUpdate={canManageSocialMedia ? () => updateAccountFollowers(account._id) : undefined} // Calls client-side handler which calls API
                  onEdit={canManageSocialMedia ? () => setEditAccount(account) : undefined}
                  onDelete={canManageSocialMedia ? () => setDeleteAccount(account) : undefined} // Delete handler needs implementing (call API)
                  isLoading={false}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {Object.values(SocialMediaPlatform).map((platform) => (
          <TabsContent key={platform} value={platform} className="mt-0">
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(3)].map((_, i) => <SocialMediaAccountCard key={i} isLoading={true} />)}
               </div>
            ) : getFilteredAccounts(platform).length === 0 ? (
              <div className="text-center py-10">
                No {platform} accounts added yet. {canManageSocialMedia && "Click \"Add Account\" to get started."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredAccounts(platform).map((account) => (
                  <SocialMediaAccountCard
                    key={account._id}
                    account={account}
                    onUpdate={canManageSocialMedia ? () => updateAccountFollowers(account._id) : undefined}
                    onEdit={canManageSocialMedia ? () => setEditAccount(account) : undefined}
                    onDelete={canManageSocialMedia ? () => setDeleteAccount(account) : undefined}
                    isLoading={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialogs */}
      {canManageSocialMedia && (
        <SocialMediaDialog
          isOpen={isAddDialogOpen || !!editAccount}
          onClose={() => {
            setIsAddDialogOpen(false);
            setEditAccount(null);
          }}
          initialData={editAccount} // editAccount is PopulatedSocialMediaAccount | null
          onSuccess={fetchAccounts} // Refetch data after successful add/edit
          user={user} // Pass client-side user object if dialog needs it (e.g., for form default values or client validation)
           // The dialog itself needs to call server API routes/Server Actions for saving data
        />
      )}

      {canManageSocialMedia && deleteAccount && (
        <DeleteAccountDialog
          isOpen={!!deleteAccount}
          onClose={() => setDeleteAccount(null)}
          account={deleteAccount} // account here is PopulatedSocialMediaAccount
          onSuccess={fetchAccounts} // Refetch data after successful delete
           // The dialog itself needs to call a server API route/Server Action for deletion
        />
      )}
    </div>
  );
}