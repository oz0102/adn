/**
 * Session provider component
 * Updated to use the new client-side authentication hooks
 */

'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
