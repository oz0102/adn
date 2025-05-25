"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building, 
  Users, 
  Calendar, 
  Settings, 
  ChevronRight,
  Home
} from 'lucide-react';

interface CenterLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default function CenterLayout({ children, params }: CenterLayoutProps) {
  const centerId = params.id;
  const pathname = usePathname();
  
  const menuItems = [
    {
      title: 'Dashboard',
      href: `/centers/${centerId}/dashboard`,
      icon: <Home className="h-5 w-5" />,
    },
    {
      title: 'Members',
      href: `/centers/${centerId}/members`,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Clusters',
      href: `/centers/${centerId}/clusters`,
      icon: <Building className="h-5 w-5" />,
    },
    {
      title: 'Events',
      href: `/centers/${centerId}/events`,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: `/centers/${centerId}/settings`,
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row">
      {/* Entity-specific sidebar */}
      <div className="w-full md:w-64 bg-muted/30 border-r p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Center Navigation</span>
          </h2>
          <p className="text-sm text-muted-foreground">Manage this center</p>
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
            href="/centers"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Building className="h-5 w-5" />
            <span>All Centers</span>
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
