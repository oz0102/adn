// Main dashboard component for Social Media Tracker
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3Icon, UsersIcon, TrendingUpIcon } from 'lucide-react';

export default function SocialMediaDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Media Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your social media accounts and track follower growth.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage Accounts</div>
            <p className="text-xs text-muted-foreground">
              Add, edit, and remove social media accounts
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/social-media" className="w-full">
              <Button className="w-full">View Accounts</Button>
            </Link>
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
    </div>
  );
}
