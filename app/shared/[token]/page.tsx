"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Copy } from "lucide-react"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function SharedPasswordPage() {
  const params = useParams()
  const token = params.token as string
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [passwordData, setPasswordData] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [accessed, setAccessed] = useState(false)

  useEffect(() => {
    async function fetchSharedPassword() {
      try {
        const res = await fetch(`/api/shared/${token}`)
        if (!res.ok) {
          throw new Error("This shared password has expired or been accessed already")
        }
        const data = await res.json()
        setPasswordData(data)
        setAccessed(true)
      } catch (err: any) {
        setError(err.message || "Failed to fetch shared password")
      } finally {
        setLoading(false)
      }
    }

    if (token && !accessed) {
      fetchSharedPassword()
    }
  }, [token, accessed])

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: message,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Loading Shared Password</CardTitle>
            <CardDescription>Please wait...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Shared Password</CardTitle>
          <CardDescription>
            This password has been securely shared with you. It will not be accessible again after you leave this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <div className="p-2 bg-muted rounded-md">{passwordData.name}</div>
          </div>
          {passwordData.website && (
            <div className="space-y-2">
              <Label>Website</Label>
              <div className="p-2 bg-muted rounded-md flex justify-between items-center">
                <span>{passwordData.website}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(passwordData.website, "Website copied")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          {passwordData.username && (
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="p-2 bg-muted rounded-md flex justify-between items-center">
                <span>{passwordData.username}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(passwordData.username, "Username copied")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="p-2 bg-muted rounded-md flex justify-between items-center">
              <span>{showPassword ? passwordData.encryptedPassword : "••••••••••••"}</span>
              <div className="flex">
                <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(passwordData.encryptedPassword, "Password copied")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {passwordData.notes && (
            <div className="space-y-2">
              <Label>Notes</Label>
              <div className="p-2 bg-muted rounded-md whitespace-pre-wrap">{passwordData.notes}</div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center w-full">
            This shared password will not be accessible again after you leave this page.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

