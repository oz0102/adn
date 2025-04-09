"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"

export default function DemoLoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("Click the button below to access the dashboard")

  const handleDemoAccess = async () => {
    setIsLoading(true)
    setMessage("Setting up demo access...")

    try {
      // 1. Create a demo user
      const demoUser = {
        id: "demo-user-id",
        email: "demo@example.com",
        role: "Admin",
        permissions: ["*"]
      }
      
      // 2. Store the demo user in localStorage
      localStorage.setItem('demoUser', JSON.stringify(demoUser))
      localStorage.setItem('isAuthenticated', 'true')
      
      // 3. Update the auth store
      setAuth(true, demoUser)
      
      // 4. Set a fake token cookie to bypass middleware
      document.cookie = `next-auth.session-token=demo-token; path=/; max-age=86400`
      
      // 5. Tell the user what's happening
      setMessage("Demo access granted! Redirecting to dashboard...")
      
      // 6. Wait a moment and redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      console.error("Error setting up demo access:", error)
      setMessage("Error setting up demo access. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Dashboard Demo Access</CardTitle>
          <CardDescription className="text-center">
            Bypass authentication for development purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p>{message}</p>
          </div>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleDemoAccess} 
              disabled={isLoading}
            >
              {isLoading ? "Setting Up..." : "Access Dashboard"}
            </Button>
          </div>
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