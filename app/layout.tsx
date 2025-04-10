/**
 * Root layout component
 * Updated to use the new client-side authentication provider
 */

import AuthProvider from '@/components/session-provider';
import './globals.css';

export const metadata = {
  title: 'ADN Church Management System',
  description: 'A comprehensive church management system for ADN',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
