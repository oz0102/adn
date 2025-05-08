// Navigation component for Social Media Tracker
'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BarChart3Icon, HomeIcon } from 'lucide-react';

interface SocialMediaNavProps {
  className?: string;
}

export function SocialMediaNav({ className }: SocialMediaNavProps) {
  const pathname = usePathname();
  
  const navItems = [
    {
      title: "Home",
      href: "/social-media",
      icon: <HomeIcon className="mr-2 h-4 w-4" />,
    },
    {
      title: "Analytics",
      href: "/social-media/analytics",
      icon: <BarChart3Icon className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}>
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "default" : "ghost"}
          className="justify-start"
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
