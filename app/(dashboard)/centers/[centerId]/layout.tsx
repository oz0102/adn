// app/(dashboard)/centers/[id]/layout.tsx
import React from 'react';

interface CenterLayoutProps {
  children: React.ReactNode;
  // Params are still available if needed by child pages, but not used by this layout itself.
  params: { centerId: string };
}

export default function CenterLayout({ children }: CenterLayoutProps) {
  return <>{children}</>;
}
