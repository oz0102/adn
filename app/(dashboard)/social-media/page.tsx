// //\app\(dashboard)\social-media\page.tsx
// // Improved main page component for Social Media Tracker with integrated dashboard

// 'use client'

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { SocialMediaAccountCard } from '@/components/social-media/social-media-card';
// import { SocialMediaDialog } from '@/components/social-media/social-media-dialog';
// import { DeleteAccountDialog } from '@/components/social-media/delete-account-dialog';
// import { Button } from '@/components/ui/button';
// import { PlusIcon, RefreshCwIcon, BarChart3Icon, TrendingUpIcon } from 'lucide-react';
// import { socialMediaService } from '@/services/socialMediaService';
// import { toast } from '@/components/ui/use-toast';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { SocialMediaPlatform } from '@/models/socialMediaAccount';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { GrowthSummary } from '@/components/social-media/analytics-components';

// export default function SocialMediaTrackerPage() {
//   const [accounts, setAccounts] = useState<any[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [editAccount, setEditAccount] = useState<any>(null);
//   const [deleteAccount, setDeleteAccount] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState('dashboard');

//   // Fetch all accounts on component mount
//   useEffect(() => {
//     fetchAccounts();
//   }, []);

//   // Fetch all social media accounts
//   const fetchAccounts = async () => {
//     try {
//       setIsLoading(true);
//       const data = await socialMediaService.getAccounts();
//       setAccounts(data);
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.response?.data?.error || 'Failed to fetch accounts',
//         variant: 'destructive'
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Update follower counts for all accounts
//   const updateAllFollowers = async () => {
//     try {
//       setIsUpdating(true);
//       await socialMediaService.updateAllFollowerCounts();
//       await fetchAccounts();
//       toast({
//         title: 'Followers updated',
//         description: 'All social media accounts have been updated.'
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.response?.data?.error || 'Failed to update followers',
//         variant: 'destructive'
//       });
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Update follower count for a specific account
//   const updateAccountFollowers = async (id: string) => {
//     try {
//       await socialMediaService.updateFollowerCount(id);
//       await fetchAccounts();
//       toast({
//         title: 'Followers updated',
//         description: 'Account followers have been updated.'
//       });
//     } catch (error: any) {
//       toast({
//         title: 'Error',
//         description: error.response?.data?.error || 'Failed to update followers',
//         variant: 'destructive'
//       });
//     }
//   };

//   // Filter accounts based on platform tab
//   const getFilteredAccounts = (platform: string) => {
//     if (platform === 'all') return accounts;
//     return accounts.filter(account => account.platform === platform);
//   };

//   return (
//     <div className="container mx-auto py-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Social Media Tracker</h1>
//           <p className="text-muted-foreground">
//             Track follower counts and growth across your social media platforms.
//           </p>
//         </div>
//         <div className="flex space-x-2">
//           <Button 
//             variant="outline" 
//             onClick={updateAllFollowers} 
//             disabled={isUpdating || accounts.length === 0}
//           >
//             <RefreshCwIcon className="h-4 w-4 mr-2" />
//             {isUpdating ? 'Updating...' : 'Update All'}
//           </Button>
//           <Button onClick={() => setIsAddDialogOpen(true)}>
//             <PlusIcon className="h-4 w-4 mr-2" />
//             Add Account
//           </Button>
//         </div>
//       </div>

//       <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="mb-4">
//           <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
//           <TabsTrigger value="accounts">Accounts</TabsTrigger>
//           {Object.values(SocialMediaPlatform).map((platform) => (
//             <TabsTrigger key={platform} value={platform}>
//               {platform}
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         {/* Dashboard Tab */}
//         <TabsContent value="dashboard" className="mt-0">
//           {isLoading ? (
//             <div className="text-center py-10">Loading dashboard...</div>
//           ) : accounts.length === 0 ? (
//             <div className="text-center py-10">
//               No social media accounts added yet. Click "Add Account" to get started.
//             </div>
//           ) : (
//             <>
//               {/* Growth Summary */}
//               <GrowthSummary accounts={accounts} />
              
//               {/* Quick Actions */}
//               <div className="grid gap-4 md:grid-cols-3 mt-6">
//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Accounts</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">Manage Accounts</div>
//                     <p className="text-xs text-muted-foreground">
//                       Add, edit, and remove social media accounts
//                     </p>
//                   </CardContent>
//                   <CardFooter>
//                     <Button className="w-full" onClick={() => setActiveTab('accounts')}>
//                       View Accounts
//                     </Button>
//                   </CardFooter>
//                 </Card>

//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Analytics</CardTitle>
//                     <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">Track Growth</div>
//                     <p className="text-xs text-muted-foreground">
//                       Monitor follower counts and analyze trends
//                     </p>
//                   </CardContent>
//                   <CardFooter>
//                     <Link href="/social-media/analytics" className="w-full">
//                       <Button className="w-full">View Analytics</Button>
//                     </Link>
//                   </CardFooter>
//                 </Card>

//                 <Card>
//                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                     <CardTitle className="text-sm font-medium">Growth</CardTitle>
//                     <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">Weekly & Monthly</div>
//                     <p className="text-xs text-muted-foreground">
//                       Compare growth rates across platforms
//                     </p>
//                   </CardContent>
//                   <CardFooter>
//                     <Link href="/social-media/analytics" className="w-full">
//                       <Button className="w-full">View Growth</Button>
//                     </Link>
//                   </CardFooter>
//                 </Card>
//               </div>

//               {/* Getting Started Guide */}
//               <div className="mt-8">
//                 <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
//                 <div className="space-y-4">
//                   <div className="p-4 border rounded-lg bg-card">
//                     <h3 className="font-medium">1. Add Your Social Media Accounts</h3>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       Start by adding your social media accounts from Twitter, Facebook, YouTube, Instagram, TikTok, and Telegram.
//                     </p>
//                   </div>
                  
//                   <div className="p-4 border rounded-lg bg-card">
//                     <h3 className="font-medium">2. Update Follower Counts</h3>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       Use the update buttons to fetch the latest follower counts from each platform.
//                     </p>
//                   </div>
                  
//                   <div className="p-4 border rounded-lg bg-card">
//                     <h3 className="font-medium">3. Track Growth Over Time</h3>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       Visit the analytics page to see weekly and monthly growth metrics and visualize your progress.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </TabsContent>

//         {/* Accounts Tab */}
//         <TabsContent value="accounts" className="mt-0">
//           {isLoading ? (
//             <div className="text-center py-10">Loading accounts...</div>
//           ) : accounts.length === 0 ? (
//             <div className="text-center py-10">
//               No social media accounts added yet. Click "Add Account" to get started.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {accounts.map((account) => (
//                 <SocialMediaAccountCard
//                   key={account._id}
//                   account={account}
//                   onUpdate={() => updateAccountFollowers(account._id)}
//                   onEdit={() => setEditAccount(account)}
//                   onDelete={() => setDeleteAccount(account)}
//                 />
//               ))}
//             </div>
//           )}
//         </TabsContent>

//         {/* Platform-specific Tabs */}
//         {Object.values(SocialMediaPlatform).map((platform) => (
//           <TabsContent key={platform} value={platform} className="mt-0">
//             {isLoading ? (
//               <div className="text-center py-10">Loading accounts...</div>
//             ) : getFilteredAccounts(platform).length === 0 ? (
//               <div className="text-center py-10">
//                 No {platform} accounts added yet. Click "Add Account" to get started.
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {getFilteredAccounts(platform).map((account) => (
//                   <SocialMediaAccountCard
//                     key={account._id}
//                     account={account}
//                     onUpdate={() => updateAccountFollowers(account._id)}
//                     onEdit={() => setEditAccount(account)}
//                     onDelete={() => setDeleteAccount(account)}
//                   />
//                 ))}
//               </div>
//             )}
//           </TabsContent>
//         ))}
//       </Tabs>

//       {/* Add/Edit Account Dialog */}
//       <SocialMediaDialog
//         isOpen={isAddDialogOpen || !!editAccount}
//         onClose={() => {
//           setIsAddDialogOpen(false);
//           setEditAccount(null);
//         }}
//         initialData={editAccount}
//         onSuccess={fetchAccounts}
//       />

//       {/* Delete Account Dialog */}
//       {deleteAccount && (
//         <DeleteAccountDialog
//           isOpen={!!deleteAccount}
//           onClose={() => setDeleteAccount(null)}
//           account={deleteAccount}
//           onSuccess={fetchAccounts}
//         />
//       )}
//     </div>
//   );
// }


"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SocialMediaAccountCard } from "@/components/social-media/social-media-card"
import { SocialMediaDialog } from "@/components/social-media/social-media-dialog"
import { DeleteAccountDialog } from "@/components/social-media/delete-account-dialog"
import { Button } from "@/components/ui/button"
import {
  PlusIcon,
  RefreshCwIcon,
  BarChart3Icon,
  TrendingUpIcon,
  UsersIcon,
  ArrowUpIcon,
  LineChartIcon,
  LayoutDashboardIcon,
  ListIcon,
} from "lucide-react"
import { socialMediaService } from "@/services/socialMediaService"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SocialMediaPlatform } from "@/models/socialMediaAccount"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GrowthSummary } from "@/components/social-media/analytics-components"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function SocialMediaTrackerPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<any>(null)
  const [deleteAccount, setDeleteAccount] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("dashboard")

  // Fetch all accounts on component mount
  useEffect(() => {
    fetchAccounts()
  }, [])

  // Fetch all social media accounts
  const fetchAccounts = async () => {
    try {
      setIsLoading(true)
      const data = await socialMediaService.getAccounts()
      setAccounts(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch accounts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update follower counts for all accounts
  const updateAllFollowers = async () => {
    try {
      setIsUpdating(true)
      await socialMediaService.updateAllFollowerCounts()
      await fetchAccounts()
      toast({
        title: "Followers updated",
        description: "All social media accounts have been updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update followers",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Update follower count for a specific account
  const updateAccountFollowers = async (id: string) => {
    try {
      await socialMediaService.updateFollowerCount(id)
      await fetchAccounts()
      toast({
        title: "Followers updated",
        description: "Account followers have been updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update followers",
        variant: "destructive",
      })
    }
  }

  // Filter accounts based on platform tab
  const getFilteredAccounts = (platform: string) => {
    if (platform === "all") return accounts
    return accounts.filter((account) => account.platform === platform)
  }

  // Calculate total followers across all platforms
  const getTotalFollowers = () => {
    return accounts.reduce((sum, account) => sum + (account.followerCount || 0), 0)
  }

  // Get platform counts
  const getPlatformCounts = () => {
    const counts: Record<string, number> = {}
    Object.values(SocialMediaPlatform).forEach((platform) => {
      counts[platform] = accounts.filter((account) => account.platform === platform).length
    })
    return counts
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Tracker</h1>
          <p className="text-muted-foreground mt-1">Monitor your social presence and track growth across platforms</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={updateAllFollowers}
            disabled={isUpdating || accounts.length === 0}
            className="h-10"
          >
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
            {isUpdating ? "Updating..." : "Update All"}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="h-10">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {!isLoading && accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
              <p className="text-xs text-muted-foreground">
                Across {Object.values(getPlatformCounts()).filter((count) => count > 0).length} platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalFollowers().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Combined audience size</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Platform</CardTitle>
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {accounts.length > 0 ? Object.entries(getPlatformCounts()).sort((a, b) => b[1] - a[1])[0][0] : "None"}
              </div>
              <p className="text-xs text-muted-foreground">Most accounts on this platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <RefreshCwIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {accounts.length > 0
                  ? new Date(Math.max(...accounts.map((a) => new Date(a.updatedAt).getTime()))).toLocaleDateString()
                  : "Never"}
              </div>
              <p className="text-xs text-muted-foreground">Most recent follower count update</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <TabsList className="mb-0 bg-transparent h-12 p-0">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
              >
                <LayoutDashboardIcon className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="accounts"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
              >
                <ListIcon className="h-4 w-4 mr-2" />
                All Accounts
              </TabsTrigger>
              {Object.values(SocialMediaPlatform).map((platform) => (
                <TabsTrigger
                  key={platform}
                  value={platform}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
                >
                  {platform}
                  {accounts.filter((account) => account.platform === platform).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {accounts.filter((account) => account.platform === platform).length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6 space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-[180px] w-full rounded-lg" />
                <Skeleton className="h-[180px] w-full rounded-lg" />
                <Skeleton className="h-[180px] w-full rounded-lg" />
              </div>
            </div>
          ) : accounts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <PlusIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Start tracking your social media growth by adding your first account.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Growth Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Growth Summary</CardTitle>
                  <CardDescription>Track your follower growth across all platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <GrowthSummary accounts={accounts} />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Manage Accounts</CardTitle>
                      <ListIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">Accounts</div>
                      <p className="text-xs text-muted-foreground mt-1">Add, edit, and remove social media accounts</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab("accounts")}>
                        View Accounts
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                      <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">Track Growth</div>
                      <p className="text-xs text-muted-foreground mt-1">Monitor follower counts and analyze trends</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="/social-media/analytics" className="w-full">
                        <Button variant="outline" className="w-full">
                          View Analytics
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Growth</CardTitle>
                      <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">Weekly & Monthly</div>
                      <p className="text-xs text-muted-foreground mt-1">Compare growth rates across platforms</p>
                    </CardContent>
                    <CardFooter>
                      <Link href="/social-media/analytics" className="w-full">
                        <Button variant="outline" className="w-full">
                          View Growth
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </div>

              {/* Getting Started Guide */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
                        <span className="font-semibold text-primary">1</span>
                      </div>
                      <h3 className="font-medium text-lg mb-2">Add Your Accounts</h3>
                      <p className="text-sm text-muted-foreground">
                        Start by adding your social media accounts from Twitter, Facebook, YouTube, Instagram, TikTok,
                        and Telegram.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
                        <span className="font-semibold text-primary">2</span>
                      </div>
                      <h3 className="font-medium text-lg mb-2">Update Followers</h3>
                      <p className="text-sm text-muted-foreground">
                        Use the update buttons to fetch the latest follower counts from each platform.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50">
                    <CardContent className="pt-6">
                      <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
                        <span className="font-semibold text-primary">3</span>
                      </div>
                      <h3 className="font-medium text-lg mb-2">Track Growth</h3>
                      <p className="text-sm text-muted-foreground">
                        Visit the analytics page to see weekly and monthly growth metrics and visualize your progress.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-[220px] w-full rounded-lg" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <PlusIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Start tracking your social media growth by adding your first account.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <SocialMediaAccountCard
                  key={account._id}
                  account={account}
                  onUpdate={() => updateAccountFollowers(account._id)}
                  onEdit={() => setEditAccount(account)}
                  onDelete={() => setDeleteAccount(account)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Platform-specific Tabs */}
        {Object.values(SocialMediaPlatform).map((platform) => (
          <TabsContent key={platform} value={platform} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[220px] w-full rounded-lg" />
                ))}
              </div>
            ) : getFilteredAccounts(platform).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <PlusIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No {platform} accounts</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Add your {platform} accounts to start tracking your growth.
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add {platform} Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredAccounts(platform).map((account) => (
                  <SocialMediaAccountCard
                    key={account._id}
                    account={account}
                    onUpdate={() => updateAccountFollowers(account._id)}
                    onEdit={() => setEditAccount(account)}
                    onDelete={() => setDeleteAccount(account)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Add/Edit Account Dialog */}
      <SocialMediaDialog
        isOpen={isAddDialogOpen || !!editAccount}
        onClose={() => {
          setIsAddDialogOpen(false)
          setEditAccount(null)
        }}
        initialData={editAccount}
        onSuccess={fetchAccounts}
      />

      {/* Delete Account Dialog */}
      {deleteAccount && (
        <DeleteAccountDialog
          isOpen={!!deleteAccount}
          onClose={() => setDeleteAccount(null)}
          account={deleteAccount}
          onSuccess={fetchAccounts}
        />
      )}
    </div>
  )
}
