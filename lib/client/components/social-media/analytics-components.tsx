// Analytics components for displaying social media growth metrics
'use client'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/client/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SocialMediaPlatform } from '@/models/socialMediaAccount'; // Assuming this exports the enum/type
import { getPlatformColor } from './social-media-card';

// Define a more specific type for social media account analytics data
interface SocialMediaAccountAnalytics {
  _id: string; // Assuming an ID field
  platform: SocialMediaPlatform;
  username: string;
  currentFollowers: number;
  lastUpdated: string; // Or Date
  followerHistory: Array<{ date: string; count: number }>; // Or Date for date
  weeklyGrowth?: { count: number; percentage: number }; // Optional if not always present
  monthlyGrowth?: { count: number; percentage: number }; // Optional if not always present
  // Add any other relevant fields that are used by these components
}

// Format date for chart display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// Format follower count for tooltip
const formatFollowerCount = (value: number) => {
  return value.toLocaleString();
};

// Growth summary component
export const GrowthSummary = ({ accounts }: { accounts: SocialMediaAccountAnalytics[] }) => {
  // Calculate total followers and growth
  const totalFollowers = accounts.reduce((sum, account) => sum + account.currentFollowers, 0);
  
  const totalWeeklyGrowth = accounts.reduce((sum, account) => {
    return sum + (account.weeklyGrowth?.count || 0);
  }, 0);
  
  const totalMonthlyGrowth = accounts.reduce((sum, account) => {
    return sum + (account.monthlyGrowth?.count || 0);
  }, 0);
  
  // Calculate percentages
  const weeklyPercentage = totalFollowers > 0 && (totalFollowers - totalWeeklyGrowth) !== 0
    ? (totalWeeklyGrowth / (totalFollowers - totalWeeklyGrowth)) * 100 
    : 0;
  
  const monthlyPercentage = totalFollowers > 0 && (totalFollowers - totalMonthlyGrowth) !== 0
    ? (totalMonthlyGrowth / (totalFollowers - totalMonthlyGrowth)) * 100 
    : 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <CardDescription>Across all platforms</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalWeeklyGrowth > 0 ? '+' : ''}{totalWeeklyGrowth.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {weeklyPercentage.toFixed(2)}% change
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalMonthlyGrowth > 0 ? '+' : ''}{totalMonthlyGrowth.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {monthlyPercentage.toFixed(2)}% change
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Platform distribution component
export const PlatformDistribution = ({ accounts }: { accounts: SocialMediaAccountAnalytics[] }) => {
  // Group followers by platform
  const platformData = Object.values(SocialMediaPlatform).map(platform => {
    const platformAccounts = accounts.filter(account => account.platform === platform);
    const totalFollowers = platformAccounts.reduce((sum, account) => sum + account.currentFollowers, 0);
    
    return {
      platform,
      followers: totalFollowers,
      color: getPlatformColor(platform as SocialMediaPlatform).replace('bg-', '') // Assuming getPlatformColor expects SocialMediaPlatform
    };
  }).filter(item => item.followers > 0);
  
  // Sort by follower count (descending)
  platformData.sort((a, b) => b.followers - a.followers);
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Platform Distribution</CardTitle>
        <CardDescription>Followers by platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={platformData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip formatter={formatFollowerCount} />
              <Legend />
              {platformData.map((entry) => (
                <Line
                  key={entry.platform}
                  type="monotone"
                  dataKey="followers"
                  name={entry.platform}
                  stroke={`var(--${entry.color})`}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Follower history chart component
export const FollowerHistoryChart = ({ 
  account, 
  days = 30 
}: { 
  account: SocialMediaAccountAnalytics;
  days?: number;
}) => {
  // Prepare data for chart
  const historyData = [...account.followerHistory]
    .filter(record => {
      const recordDate = new Date(record.date);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return recordDate >= cutoffDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(record => ({
      date: record.date,
      followers: record.count
    }));
  
  // Add current followers if not in history or if history is empty and lastUpdated is different
  if (historyData.length === 0 || 
      (historyData.length > 0 && new Date(historyData[historyData.length - 1].date).getTime() !== new Date(account.lastUpdated).getTime())) {
    historyData.push({
      date: account.lastUpdated,
      followers: account.currentFollowers
    });
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Follower History</CardTitle>
        <CardDescription>
          {account.platform} - @{account.username} - Last {days} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {historyData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  formatter={formatFollowerCount}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="followers"
                  name="Followers"
                  stroke={`var(--${getPlatformColor(account.platform).replace('bg-', '')})`}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                Not enough history data available. Check back after more updates.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
