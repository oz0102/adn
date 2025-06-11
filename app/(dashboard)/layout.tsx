"use client"

import { Sidebar } from "@/lib/client/components/dashboard/sidebar"
import { Header } from "@/lib/client/components/dashboard/header"
import { SessionProvider } from "@/lib/client/components/session-provider"
import { ThemeProvider } from "@/lib/client/components/theme-provider"
import { Toaster } from "@/lib/client/components/ui/toaster"
import { AuthSync } from "@/lib/client/components/auth-sync"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthSync />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header />
            <main className="relative flex-1 overflow-y-auto focus:outline-none p-6">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
