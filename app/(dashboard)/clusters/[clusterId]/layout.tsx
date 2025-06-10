"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Layers, 
  Users, 
  Calendar, 
  Settings, 
  ChevronRight,
  Home,
  Network
} from 'lucide-react';

interface ClusterLayoutProps {
  children: React.ReactNode;
  params: { clusterId: string }; // Changed id to clusterId
}

export default function ClusterLayout({ children, params }: ClusterLayoutProps) {
  const clusterId = params.clusterId; // Changed params.id to params.clusterId
  const pathname = usePathname();
  
  const menuItems = [
    {
      title: 'Dashboard',
      href: `/clusters/${clusterId}/dashboard`, // This path is correct as (dashboard) is a route group
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Members',
      href: `/clusters/${clusterId}/dashboard/members`, // Added /dashboard segment
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Small Groups',
      href: `/clusters/${clusterId}/dashboard/small-groups`, // Corrected path
      icon: <Network className="h-5 w-5" />,
    },
    {
      title: 'Events',
      href: `/clusters/${clusterId}/dashboard/events`, // Added /dashboard segment
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: `/clusters/${clusterId}/settings`,
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row">
      {/* Entity-specific sidebar */}
      <div className="w-full md:w-64 bg-muted/30 border-r p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-600" />
            <span>Cluster Navigation</span>
          </h2>
          <p className="text-sm text-muted-foreground">Manage this cluster</p>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-6 pt-6 border-t">
          <Link
            href="/clusters"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Layers className="h-5 w-5" />
            <span>All Clusters</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Main Dashboard</span>
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 min-h-screen">
        {children}
      </div>
    </div>
  );
}
