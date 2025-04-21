// Root layout for Social Media Tracker
import React from 'react';
import { SocialMediaNav } from '@/components/social-media/social-media-nav';

export default function SocialMediaRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SocialMediaNav className="lg:sticky lg:top-8" />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
