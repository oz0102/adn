// Analytics dashboard page for Social Media Tracker
'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { GrowthSummary, PlatformDistribution, FollowerHistoryChart } from '@/components/social-media/analytics-components';
import { Button } from '@/lib/client/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/client/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/client/components/ui/tabs';
import { socialMediaService } from '@/services/socialMediaService';
import { toast } from '@/lib/client/components/ui/use-toast';
import { RefreshCwIcon } from 'lucide-react';

interface SocialMediaAccountAnalyticsEntry {
  _id: string;
  platform: string; // Consider using a more specific enum/type if available
  username: string;
  followerCount: number;
  lastFollowerUpdate?: string;
  followerHistory?: { date: string; count: number }[];
  // Add other properties as needed based on actual data structure
}

interface ApiErrorResponse {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function SocialMediaAnalyticsPage() {
  const [accounts, setAccounts] = useState<SocialMediaAccountAnalyticsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('30');

  // Fetch all accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Fetch all social media accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data: SocialMediaAccountAnalyticsEntry[] = await socialMediaService.getAccounts();
      setAccounts(data);
      
      // Set first account as selected if available
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0]._id);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch accounts';
      const apiError = error as ApiErrorResponse;
      toast({
        title: 'Error',
        description: apiError?.response?.data?.error || errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccount]);

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update followers';
      const apiError = error as ApiErrorResponse;
      toast({
        title: 'Error',
        description: apiError?.response?.data?.error || errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Get the selected account object
  const getSelectedAccount = () => {
    return accounts.find(account => account._id === selectedAccount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Analytics</h1>
          <p className="text-muted-foreground">
            Track growth and analyze trends across your social media platforms.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={updateAllFollowers} 
          disabled={isUpdating || accounts.length === 0}
        >
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          {isUpdating ? 'Updating...' : 'Update Data'}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Loading analytics data...</div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-10">
          No social media accounts added yet. Add accounts to see analytics.
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <GrowthSummary accounts={accounts} />
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="account">Account Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <PlatformDistribution accounts={accounts} />
                
                {/* Add more overview charts here */}
              </div>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-full sm:w-64">
                  <Select 
                    value={selectedAccount} 
                    onValueChange={setSelectedAccount}
                    disabled={accounts.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account._id} value={account._id}>
                          {account.platform} - @{account.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-40">
                  <Select 
                    value={timeRange} 
                    onValueChange={setTimeRange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedAccount && (
                <FollowerHistoryChart 
                  account={getSelectedAccount()} 
                  days={parseInt(timeRange, 10)}
                />
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
