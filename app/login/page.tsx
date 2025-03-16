"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("email")
  const [showCodeInput, setShowCodeInput] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!showCodeInput) {
      // First step: Send email with code
      try {
        await signIn("email", { email, redirect: false })
        setShowCodeInput(true)
      } catch (err: any) {
        setError(err.message || "Failed to send login code")
      } finally {
        setLoading(false)
      }
    } else {
      // Second step: Verify code
      try {
        const result = await signIn("credentials", {
          email,
          code,
          redirect: false,
        })

        if (result?.error) {
          setError("Invalid verification code")
        } else {
          router.push("/dashboard")
          router.refresh()
        }
      } catch (err: any) {
        setError(err.message || "Invalid verification code")
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("password", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">SecurePass</CardTitle>
          <CardDescription>Your secure password manager</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="email"
            onValueChange={(value) => {
              setActiveTab(value)
              setShowCodeInput(false)
              setError("")
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email Login</TabsTrigger>
              <TabsTrigger value="password">Password Login</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={showCodeInput}
                  />
                </div>
                {showCodeInput && (
                  <div className="space-y-2">
                    <Input
                      id="code"
                      type="text"
                      placeholder="Verification Code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : showCodeInput ? "Verify Code" : "Send Login Code"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Input
                    id="email-password"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            Don&apos;t have an account? Use email login to create one automatically.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

