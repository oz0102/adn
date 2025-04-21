// Layout component for Social Media Analytics
import React from 'react';

export default function SocialMediaAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      {children}
    </div>
  );
}
