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
  ArrowUpIcon,
  LineChartIcon,
  LayoutDashboardIcon,
  ListIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { socialMediaService } from "@/services/socialMediaService"; // Corrected: This will now import the object containing all service methods
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ISocialMediaAccount, SocialMediaPlatform, IFollowerHistoryEntry } from "@/models/socialMediaAccount"; // Import the interface
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GrowthSummary } from "@/components/social-media/analytics-components";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import { ICenter } from "@/models/center";

// Type for populated account, matching service layer if possible
export interface PopulatedSocialMediaAccount extends Omit<ISocialMediaAccount, "centerId" | "createdBy"> {
  _id: string; // Ensure _id is string if it's transformed from ObjectId
  centerId?: { _id: string; name: string; } | null; 
  createdBy?: { _id: string; email: string; } | null;
  followerHistory: IFollowerHistoryEntry[];
}

// Mock service for updating all followers - replace with actual if available
const mockUpdateAllFollowersService = async () => {
  console.warn("mockUpdateAllFollowersService called. Implement actual service.");
  // Simulate API call
  return new Promise(resolve => setTimeout(resolve, 1000));
};

export default function SocialMediaTrackerPage() {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState<PopulatedSocialMediaAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<PopulatedSocialMediaAccount | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<PopulatedSocialMediaAccount | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  const canManageSocialMedia = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"]) : false;
  const canViewSocialMedia = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"]) : false;

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // Determine scope based on user role
      let filters: any = {}; // Define filters type more strictly if possible
      if (checkPermission(user, ["CENTER_ADMIN"])) {
        const centerAdminRole = user.assignedRoles?.find(r => r.role === "CENTER_ADMIN");
        if (centerAdminRole?.scopeId) {
          filters.scope = "CENTER";
          filters.centerId = centerAdminRole.scopeId;
        } else {
          // Center admin without specific centerId, might mean they can see all center accounts or none if not HQ
          // This case needs clarification based on business logic. For now, assume they see accounts for their center(s).
          // If a center admin can be assigned to multiple centers, this logic needs adjustment.
          // Fallback to HQ if no specific center, or throw error, or show no accounts.
        }
      } else if (checkPermission(user, ["HQ_ADMIN"])) {
        // HQ_ADMIN can see all accounts, or filter by scope=HQ or specific centerId if they choose
        // For now, let's assume they see all by default, or you can add UI filters for them
      }

      const data = await socialMediaService.getAllSocialMediaAccounts(filters); // Corrected: Use the imported object
      // Ensure _id is string if necessary, and other transformations
      const transformedData = data.map(acc => ({
        ...acc,
        _id: acc._id.toString(),
        centerId: acc.centerId ? { ...acc.centerId, _id: acc.centerId._id.toString() } : null,
        createdBy: acc.createdBy ? { ...acc.createdBy, _id: acc.createdBy._id.toString() } : null,
      })) as PopulatedSocialMediaAccount[];
      setAccounts(transformedData);
    } catch (error: any) {
      console.error("Failed to fetch accounts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (canViewSocialMedia) {
      fetchAccounts();
    }
  }, [canViewSocialMedia, fetchAccounts]);

  const updateAllFollowers = async () => {
    if (!canManageSocialMedia) return;
    try {
      setIsUpdating(true);
      // Replace with actual service if available
      // await socialMediaService.updateAllFollowerCounts(); // Corrected: Use the imported object
      await mockUpdateAllFollowersService();
      await fetchAccounts();
      toast({
        title: "Followers updated",
        description: "All social media accounts have been updated.",
      });
    } catch (error: any) {
      console.error("Failed to update all followers:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update followers",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAccountFollowers = async (id: string) => {
    if (!canManageSocialMedia) return;
    try {
      await socialMediaService.updateFollowerCount(id, 0); // Corrected: Use the imported object. The `0` here is a placeholder, the service should fetch the actual count
      await fetchAccounts();
      toast({
        title: "Followers updated",
        description: "Account followers have been updated.",
      });
    } catch (error: any) {
      console.error(`Failed to update followers for account ${id}:`, error);
      toast({
        title: "Error",
        description: error.message || "Failed to update followers for this account",
        variant: "destructive",
      });
    }
  };

  const getFilteredAccounts = (platform: string) => {
    if (platform === "all") return accounts;
    return accounts.filter(account => account.platform === platform);
  };

  if (!user) {
    return <div className="text-center py-10">Authenticating...</div>;
  }

  if (!canViewSocialMedia && !isLoading) {
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
          {isLoading ? (
            <GrowthSummary accounts={[]} isLoading={true} /> // Show skeleton within GrowthSummary
          ) : accounts.length === 0 ? (
            <div className="text-center py-10">
              No social media accounts added yet. Click "Add Account" to get started.
            </div>
          ) : (
            <>
              <GrowthSummary accounts={accounts} isLoading={false} />
              <div className="grid gap-4 md:grid-cols-3 mt-6">
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
            </>
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

      {canManageSocialMedia && (
        <SocialMediaDialog
          isOpen={isAddDialogOpen || !!editAccount}
          onClose={() => {
            setIsAddDialogOpen(false);
            setEditAccount(null);
          }}
          initialData={editAccount}
          onSuccess={() => {
            fetchAccounts();
            setIsAddDialogOpen(false); 
            setEditAccount(null);
          }}
          user={user} // Pass user for permission checks within dialog if needed
        />
      )}

      {canManageSocialMedia && deleteAccount && (
        <DeleteAccountDialog
          isOpen={!!deleteAccount}
          onClose={() => setDeleteAccount(null)}
          account={deleteAccount} // account here is PopulatedSocialMediaAccount
          onSuccess={() => {
            fetchAccounts();
            setDeleteAccount(null);
          }}
        />
      )}
    </div>
  );
}

