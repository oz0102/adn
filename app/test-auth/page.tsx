// app/test-auth/page.tsx
"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function TestAuth() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("admin@test.com")
  const [password, setPassword] = useState("Test123!")
  const [error, setError] = useState("")
  
  const handleLogin = async () => {
    setError("")
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    })
    
    if (result?.error) {
      setError(result.error)
    }
    
    console.log("Login result:", result)
  }
  
  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Auth Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p>Session Status: {status}</p>
              {session && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <p>Logged in as: {session.user?.email}</p>
                  <p>Role: {session.user?.role}</p>
                  <pre className="text-xs mt-2">{JSON.stringify(session, null, 2)}</pre>
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-red-100 p-2 rounded text-red-700">{error}</div>
            )}
            
            <div className="space-y-2">
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button onClick={handleLogin}>Log In</Button>
                {session && (
                  <Button variant="outline" onClick={() => signOut()}>
                    Log Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}