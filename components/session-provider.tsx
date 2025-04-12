// // components/session-provider.tsx
// "use client";

// import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

// export function SessionProvider({ children }: { children: React.ReactNode }) {
//   return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
// }

// // Also export as default for backward compatibility
// export default function AuthProvider({ children }: { children: React.ReactNode }) {
//   return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
// }



"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

// Also export as default for backward compatibility
export default SessionProvider;