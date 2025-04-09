// // app/(auth)/login/page.tsx
// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { signIn } from "next-auth/react"
// import { useAuthStore } from "@/lib/store"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { useToast } from "@/hooks/use-toast"

// export default function LoginPage() {
//   const router = useRouter()
//   const { setAuth } = useAuthStore()
//   const { toast } = useToast()
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!email || !password) {
//       setError("Please enter both email and password")
//       return
//     }
    
//     try {
//       setIsLoading(true)
//       setError("")
      
//       const result = await signIn("credentials", {
//         email,
//         password,
//         redirect: false,
//       })
      
//       if (result?.error) {
//         setError("Invalid email or password")
//         return
//       }
      
//       // Fetch user data
//       const userResponse = await fetch("/api/auth/me")
//       const userData = await userResponse.json()
      
//       if (userData.success) {
//         setAuth(true, userData.user)
//         toast({
//           title: "Welcome back!",
//           description: "You have successfully logged in.",
//         })
//         router.push("/dashboard")
//       } else {
//         setError("Failed to get user information")
//       }
//     } catch (error) {
//       console.error("Login error:", error)
//       setError("An error occurred during login. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">ADN Management System</CardTitle>
//           <CardDescription className="text-center">
//             Enter your credentials to sign in to your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {error && (
//               <Alert variant="destructive">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="name@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 disabled={isLoading}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Link
//                   href="/forgot-password"
//                   className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={isLoading}
//                 required
//               />
//             </div>
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? "Signing in..." : "Sign in"}
//             </Button>
//           </form>
//         </CardContent>
//         <CardFooter className="flex justify-center">
//           <p className="text-sm text-gray-600 dark:text-gray-400">
//             Don't have an account?{" "}
//             <Link
//               href="/register"
//               className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
//             >
//               Contact admin
//             </Link>
//           </p>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }


// app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { InfoCircledIcon } from "@radix-ui/react-icons"

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isInitializing, setIsInitializing] = useState(false)
  const [showAdminInit, setShowAdminInit] = useState(false)
  const [adminInitSecret, setAdminInitSecret] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }
    
    try {
      setIsLoading(true)
      setError("")
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        setError("Invalid email or password")
        return
      }
      
      // Fetch user data
      const userResponse = await fetch("/api/auth/me")
      const userData = await userResponse.json()
      
      if (userData.success) {
        setAuth(true, userData.user)
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        })
        router.push("/dashboard")
      } else {
        setError("Failed to get user information")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const initializeAdmin = async () => {
    if (!adminInitSecret) {
      toast({
        title: "Secret Required",
        description: "Please enter the admin initialization secret.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsInitializing(true)
      
      const response = await fetch('/api/auth/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secretKey: adminInitSecret,
          email: 'admin@adnglobal.org',
          password: 'admin123'
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: data.adminCreated ? "Admin Created" : "Admin Exists",
          description: data.message,
        })
        
        // If admin was created or exists, pre-fill the login form
        if (data.email) {
          setEmail(data.email)
          if (data.adminCreated) {
            setPassword('admin123')
          }
        }
        
        setShowAdminInit(false)
      } else {
        toast({
          title: "Initialization Failed",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Admin initialization error:', error)
      toast({
        title: "Error",
        description: "Failed to initialize admin user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">ADN Management System</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {!showAdminInit ? (
            <div className="mt-4">
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs text-gray-500" 
                onClick={() => setShowAdminInit(true)}
              >
                <InfoCircledIcon className="mr-1 h-3 w-3" />
                Initialize Admin User
              </Button>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Admin Initialization</h3>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Admin initialization secret"
                  value={adminInitSecret}
                  onChange={(e) => setAdminInitSecret(e.target.value)}
                  disabled={isInitializing}
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    disabled={isInitializing}
                    onClick={() => setShowAdminInit(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    disabled={isInitializing}
                    onClick={initializeAdmin}
                    className="flex-1"
                  >
                    {isInitializing ? "Initializing..." : "Initialize"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Contact admin
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}