"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Network, 
  Users, 
  Calendar, 
  Settings, 
  ChevronRight,
  Home,
  Layers
} from 'lucide-react';

interface GroupLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default function GroupLayout({ children, params }: GroupLayoutProps) {
  const groupId = params.id;
  const pathname = usePathname();
  
  const menuItems = [
    {
      title: 'Dashboard',
      href: `/groups/${groupId}/dashboard`,
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Members',
      href: `/groups/${groupId}/members`,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Events',
      href: `/groups/${groupId}/events`,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: `/groups/${groupId}/settings`,
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row">
      {/* Entity-specific sidebar */}
      <div className="w-full md:w-64 bg-muted/30 border-r p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            <span>Small Group Navigation</span>
          </h2>
          <p className="text-sm text-muted-foreground">Manage this small group</p>
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
            href="/groups"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Network className="h-5 w-5" />
            <span>All Small Groups</span>
          </Link>
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
