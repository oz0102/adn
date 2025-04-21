// Improved main page component for Social Media Tracker with integrated dashboard
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SocialMediaAccountCard } from '@/components/social-media/social-media-card';
import { SocialMediaDialog } from '@/components/social-media/social-media-dialog';
import { DeleteAccountDialog } from '@/components/social-media/delete-account-dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon, RefreshCwIcon, BarChart3Icon, TrendingUpIcon } from 'lucide-react';
import { socialMediaService } from '@/services/socialMediaService';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialMediaPlatform } from '@/models/socialMediaAccount';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GrowthSummary } from '@/components/social-media/analytics-components';

export default function SocialMediaTrackerPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [deleteAccount, setDeleteAccount] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch all accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch all social media accounts
  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const data = await socialMediaService.getAccounts();
      setAccounts(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch accounts',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update follower counts for all accounts
  const updateAllFollowers = async () => {
    try {
      setIsUpdating(true);
      await socialMediaService.updateAllFollowerCounts();
      await fetchAccounts();
      toast({
        title: 'Followers updated',
        description: 'All social media accounts have been updated.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update followers',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update follower count for a specific account
  const updateAccountFollowers = async (id: string) => {
    try {
      await socialMediaService.updateFollowerCount(id);
      await fetchAccounts();
      toast({
        title: 'Followers updated',
        description: 'Account followers have been updated.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update followers',
        variant: 'destructive'
      });
    }
  };

  // Filter accounts based on platform tab
  const getFilteredAccounts = (platform: string) => {
    if (platform === 'all') return accounts;
    return accounts.filter(account => account.platform === platform);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Tracker</h1>
          <p className="text-muted-foreground">
            Track follower counts and growth across your social media platforms.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={updateAllFollowers} 
            disabled={isUpdating || accounts.length === 0}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            {isUpdating ? 'Updating...' : 'Update All'}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          {Object.values(SocialMediaPlatform).map((platform) => (
            <TabsTrigger key={platform} value={platform}>
              {platform}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-0">
          {isLoading ? (
            <div className="text-center py-10">Loading dashboard...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-10">
              No social media accounts added yet. Click "Add Account" to get started.
            </div>
          ) : (
            <>
              {/* Growth Summary */}
              <GrowthSummary accounts={accounts} />
              
              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accounts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Manage Accounts</div>
                    <p className="text-xs text-muted-foreground">
                      Add, edit, and remove social media accounts
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setActiveTab('accounts')}>
                      View Accounts
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                    <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Track Growth</div>
                    <p className="text-xs text-muted-foreground">
                      Monitor follower counts and analyze trends
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/social-media/analytics" className="w-full">
                      <Button className="w-full">View Analytics</Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Growth</CardTitle>
                    <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Weekly & Monthly</div>
                    <p className="text-xs text-muted-foreground">
                      Compare growth rates across platforms
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/social-media/analytics" className="w-full">
                      <Button className="w-full">View Growth</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>

              {/* Getting Started Guide */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-medium">1. Add Your Social Media Accounts</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start by adding your social media accounts from Twitter, Facebook, YouTube, Instagram, TikTok, and Telegram.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-medium">2. Update Follower Counts</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use the update buttons to fetch the latest follower counts from each platform.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-medium">3. Track Growth Over Time</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Visit the analytics page to see weekly and monthly growth metrics and visualize your progress.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="mt-0">
          {isLoading ? (
            <div className="text-center py-10">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-10">
              No social media accounts added yet. Click "Add Account" to get started.
            </div>
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
          <TabsContent key={platform} value={platform} className="mt-0">
            {isLoading ? (
              <div className="text-center py-10">Loading accounts...</div>
            ) : getFilteredAccounts(platform).length === 0 ? (
              <div className="text-center py-10">
                No {platform} accounts added yet. Click "Add Account" to get started.
              </div>
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
          setIsAddDialogOpen(false);
          setEditAccount(null);
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
  );
}
