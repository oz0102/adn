// Main page component for Social Media Tracker
import React, { useState, useEffect } from 'react';
import { SocialMediaAccountCard } from '@/components/social-media/social-media-card';
import { SocialMediaDialog } from '@/components/social-media/social-media-dialog';
import { DeleteAccountDialog } from '@/components/social-media/delete-account-dialog';
import { Button } from '@/components/ui/button';
import { PlusIcon, RefreshCwIcon } from 'lucide-react';
import { socialMediaService } from '@/services/socialMediaService';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocialMediaPlatform } from '@/models/socialMediaAccount';

export default function SocialMediaTrackerPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [deleteAccount, setDeleteAccount] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');

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

  // Filter accounts based on active tab
  const filteredAccounts = accounts.filter(account => {
    if (activeTab === 'all') return true;
    return account.platform === activeTab;
  });

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

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Platforms</TabsTrigger>
          {Object.values(SocialMediaPlatform).map((platform) => (
            <TabsTrigger key={platform} value={platform}>
              {platform}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="text-center py-10">Loading accounts...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-10">
              {activeTab === 'all' 
                ? 'No social media accounts added yet. Click "Add Account" to get started.'
                : `No ${activeTab} accounts added yet.`}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAccounts.map((account) => (
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
