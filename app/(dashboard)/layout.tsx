"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthSync } from "@/components/auth-sync"

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
