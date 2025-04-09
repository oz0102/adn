"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function DemoLoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  // Demo user data
  const demoUser = {
    id: "demo-user-id",
    email: "demo@example.com",
    role: "Admin", // Use whatever role gives full access
    permissions: ["*"] // Wildcard permission for demo purposes
  }

  const handleDemoLogin = () => {
    // Set auth state with demo user
    setAuth(true, demoUser)
    
    // Store in localStorage to persist through page refreshes
    localStorage.setItem('demoUser', JSON.stringify(demoUser))
    localStorage.setItem('isAuthenticated', 'true')
    
    // Redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Demo Access</CardTitle>
          <CardDescription className="text-center">
            Access the dashboard with demo credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button size="lg" onClick={handleDemoLogin}>
            Enter Dashboard as Demo User
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This is for development purposes only
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}