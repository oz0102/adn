// // // // app/(dashboard)/layout.tsx
// // // "use client"

// // // import { useAuthStore } from "@/lib/store"
// // // import { Sidebar } from "@/components/dashboard/sidebar"
// // // import { Header } from "@/components/dashboard/header"
// // // import { SessionProvider } from "@/components/session-provider"
// // // import { ThemeProvider } from "@/components/theme-provider"
// // // import { Toaster } from "@/components/ui/toaster"
// // // import { useEffect } from "react"
// // // import { useRouter } from "next/navigation"

// // // export default function DashboardLayout({
// // //   children,
// // // }: {
// // //   children: React.ReactNode
// // // }) {
// // //   const { isAuthenticated } = useAuthStore()
// // //   const router = useRouter()
  
// // //   useEffect(() => {
// // //     if (!isAuthenticated) {
// // //       router.push("/login")
// // //     }
// // //   }, [isAuthenticated, router])

// // //   return (
// // //     <SessionProvider>
// // //       <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
// // //         <div className="flex h-screen overflow-hidden">
// // //           <Sidebar />
// // //           <div className="flex flex-col flex-1 w-0 overflow-hidden">
// // //             <Header />
// // //             <main className="relative flex-1 overflow-y-auto focus:outline-none p-6">
// // //               {children}
// // //             </main>
// // //           </div>
// // //         </div>
// // //         <Toaster />
// // //       </ThemeProvider>
// // //     </SessionProvider>
// // //   )
// // // }


// // // app/(dashboard)/layout.tsx
// // "use client"

// // import { useEffect } from "react"
// // import { useAuthStore } from "@/lib/store"
// // import { Sidebar } from "@/components/dashboard/sidebar"
// // import { Header } from "@/components/dashboard/header"
// // import { SessionProvider } from "@/components/session-provider"
// // import { ThemeProvider } from "@/components/theme-provider"
// // import { Toaster } from "@/components/ui/toaster"
// // import { useRouter } from "next/navigation"

// // // Set this to true to bypass authentication during development
// // const BYPASS_AUTH = true

// // export default function DashboardLayout({
// //   children,
// // }: {
// //   children: React.ReactNode
// // }) {
// //   const { isAuthenticated, setAuth } = useAuthStore()
// //   const router = useRouter()
  
// //   useEffect(() => {
// //     // Check if we should bypass authentication
// //     if (BYPASS_AUTH && !isAuthenticated) {
// //       // Create a demo user
// //       const demoUser = {
// //         id: "demo-user-id",
// //         email: "demo@example.com",
// //         role: "Admin", // Use whatever role gives full access
// //         permissions: ["*"] // Wildcard permission for demo purposes
// //       }
      
// //       // Set auth state with demo user
// //       setAuth(true, demoUser)
      
// //       console.log("Authentication bypassed for development")
// //     } else if (!isAuthenticated && !BYPASS_AUTH) {
// //       router.push("/login")
// //     }
// //   }, [isAuthenticated, router, setAuth])

// //   return (
// //     <SessionProvider>
// //       <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
// //         <div className="flex h-screen overflow-hidden">
// //           <Sidebar />
// //           <div className="flex flex-col flex-1 w-0 overflow-hidden">
// //             <Header />
// //             <main className="relative flex-1 overflow-y-auto focus:outline-none p-6">
// //               {children}
// //             </main>
// //           </div>
// //         </div>
// //         <Toaster />
// //       </ThemeProvider>
// //     </SessionProvider>
// //   )
// // }

// // app/(dashboard)/layout.tsx
// "use client"

// import { useEffect } from "react"
// import { useSession } from "next-auth/react"
// import { useAuthStore } from "@/lib/store"
// import { Sidebar } from "@/components/dashboard/sidebar"
// import { Header } from "@/components/dashboard/header"
// import { SessionProvider } from "@/components/session-provider"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Toaster } from "@/components/ui/toaster"
// import { useRouter } from "next/navigation"

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <SessionProvider>
//       <DashboardLayoutContent>
//         {children}
//       </DashboardLayoutContent>
//     </SessionProvider>
//   )
// }

// // Separate content component to use hooks inside SessionProvider
// function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
//   const { data: session, status } = useSession()
//   const { isAuthenticated, setAuth } = useAuthStore()
//   const router = useRouter()
  
//   useEffect(() => {
//     // If session is loading, do nothing yet
//     if (status === "loading") return;
    
//     // If session exists, update auth store
//     if (session) {
//       setAuth(true, {
//         id: session.user.id,
//         email: session.user.email,
//         role: session.user.role,
//         permissions: session.user.permissions || []
//       })
//     } 
//     // If no session and finished loading, redirect to login
//     else {
//       console.log("No session found, redirecting to login")
//       router.push("/login")
//       return;
//     }
//   }, [session, status, setAuth, router, isAuthenticated])

//   // Don't render dashboard until authentication is confirmed
//   if (status === "loading" || !isAuthenticated) {
//     return <div className="flex h-screen items-center justify-center">
//       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
//     </div>
//   }

//   return (
//     <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//       <div className="flex h-screen overflow-hidden">
//         <Sidebar />
//         <div className="flex flex-col flex-1 w-0 overflow-hidden">
//           <Header />
//           <main className="relative flex-1 overflow-y-auto focus:outline-none p-6">
//             {children}
//           </main>
//         </div>
//       </div>
//       <Toaster />
//     </ThemeProvider>
//   )
// }

// app/(dashboard)/layout.tsx
"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { useAuthBypass } from "@/lib/auth-bypass"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, setAuth } = useAuthStore()
  const { bypassEnabled, mockUser } = useAuthBypass()
  const router = useRouter()
  
  useEffect(() => {
    // Ensure authentication is set if bypass is enabled
    if (bypassEnabled && !isAuthenticated) {
      setAuth(true, mockUser)
    } 
    // If not authenticated and bypass not enabled, redirect to login
    else if (!isAuthenticated && !bypassEnabled) {
      router.push("/login")
    }
  }, [isAuthenticated, bypassEnabled, mockUser, setAuth, router])

  // Show loading state until authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <Header />
          <main className="relative flex-1 overflow-y-auto focus:outline-none p-6">
            {/* Development mode indicator */}
            {bypassEnabled && (
              <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 p-2 mb-4 rounded-md text-sm">
                <strong>Development Mode:</strong> Using bypassed authentication. NextAuth is disabled.
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  )
}