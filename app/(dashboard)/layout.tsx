// // app/(dashboard)/layout.tsx
// "use client"

// import { useAuthStore } from "@/lib/store"
// import { Sidebar } from "@/components/dashboard/sidebar"
// import { Header } from "@/components/dashboard/header"
// import { SessionProvider } from "@/components/session-provider"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Toaster } from "@/components/ui/toaster"
// import { useEffect } from "react"
// import { useRouter } from "next/navigation"

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const { isAuthenticated } = useAuthStore()
//   const router = useRouter()
  
//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push("/login")
//     }
//   }, [isAuthenticated, router])

//   return (
//     <SessionProvider>
//       <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//         <div className="flex h-screen overflow-hidden">
//           <Sidebar />
//           <div className="flex flex-col flex-1 w-0 overflow-hidden">
//             <Header />
//             <main className="relative flex-1 overflow-y-auto focus:outline-none p-6">
//               {children}
//             </main>
//           </div>
//         </div>
//         <Toaster />
//       </ThemeProvider>
//     </SessionProvider>
//   )
// }


// app/(dashboard)/layout.tsx
"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation"

// Set this to true to bypass authentication during development
const BYPASS_AUTH = true

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, setAuth } = useAuthStore()
  const router = useRouter()
  
  useEffect(() => {
    // Check if we should bypass authentication
    if (BYPASS_AUTH && !isAuthenticated) {
      // Create a demo user
      const demoUser = {
        id: "demo-user-id",
        email: "demo@example.com",
        role: "Admin", // Use whatever role gives full access
        permissions: ["*"] // Wildcard permission for demo purposes
      }
      
      // Set auth state with demo user
      setAuth(true, demoUser)
      
      console.log("Authentication bypassed for development")
    } else if (!isAuthenticated && !BYPASS_AUTH) {
      router.push("/login")
    }
  }, [isAuthenticated, router, setAuth])

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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