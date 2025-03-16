"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Eye, EyeOff, Copy, Share, Trash, Plus, Edit, LogOut, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePasswords } from "@/hooks/use-passwords"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const {
    passwords,
    loading,
    fetchPasswords,
    getPassword,
    createPassword,
    updatePassword,
    deletePassword,
    sharePassword,
  } = usePasswords()
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [selectedPassword, setSelectedPassword] = useState<string | null>(null)
  const [passwordDetails, setPasswordDetails] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [shareLink, setShareLink] = useState("")

  // Form states
  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [notes, setNotes] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchPasswords()
    }
  }, [status, router])

  const resetForm = () => {
    setName("")
    setWebsite("")
    setUsername("")
    setPassword("")
    setNotes("")
  }

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPassword({
        name,
        website,
        username,
        password,
        notes,
      })
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Password added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add password",
        variant: "destructive",
      })
    }
  }

  const handleEditPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPassword) return

    try {
      await updatePassword(selectedPassword, {
        name,
        website,
        username,
        password,
        notes,
      })
      setIsEditDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Password updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    }
  }

  const handleDeletePassword = async (id: string) => {
    if (confirm("Are you sure you want to delete this password?")) {
      try {
        await deletePassword(id)
        toast({
          title: "Success",
          description: "Password deleted successfully",
        })
      } catch (error) {

        toast({
          title: 'Error',
          description: 'Failed to delete password',
          variant: 'destructive',
        });
      }
    }
  }

  const handleViewPassword = async (id: string) => {
    try {
      const details = await getPassword(id)
      setPasswordDetails(details)
      setSelectedPassword(id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch password details",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = async (id: string) => {
    try {
      const details = await getPassword(id)
      setName(details.name)
      setWebsite(details.website || "")
      setUsername(details.username || "")
      setPassword(details.password || "")
      setNotes(details.notes || "")
      setSelectedPassword(id)
      setIsEditDialogOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch password details",
        variant: "destructive",
      })
    }
  }

  const handleSharePassword = async () => {
    if (!selectedPassword) return

    try {
      const result = await sharePassword(selectedPassword)
      setShareLink(result.shareLink)
      setIsShareDialogOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share password",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: message,
    })
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return
    }

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to set password")
      }

      setIsProfileDialogOpen(false)
      setNewPassword("")
      setConfirmPassword("")
      toast({
        title: "Success",
        description: "Password has been set successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set password",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">SecurePass</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Passwords</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsProfileDialogOpen(true)} variant="outline">
            <User className="mr-2 h-4 w-4" /> Profile
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Password
          </Button>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : passwords.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No passwords found. Add your first password to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {passwords.map((pwd,ibdex) => (
            <Card key={ibdex} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{pwd.name}</CardTitle>
                {pwd.website && (
                  <CardDescription>
                    <a
                      href={pwd.website.startsWith("http") ? pwd.website : `https://${pwd.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {pwd.website}
                    </a>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                {pwd.username && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Username:</span>
                    <div className="flex items-center">
                      <span className="text-sm mr-2">{pwd.username}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(pwd.username!, "Username copied")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Password:</span>
                  <Button variant="ghost" size="sm" onClick={() => handleViewPassword(pwd._id)}>
                    View Password
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="icon" onClick={() => handleEditClick(pwd._id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSelectedPassword(pwd._id)
                    handleSharePassword()
                  }}
                >
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDeletePassword(pwd._id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Password Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Password</DialogTitle>
            <DialogDescription>Add a new password to your secure vault.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Gmail, Netflix"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g., gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username (optional)</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., your.email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes here"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Password Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Password</DialogTitle>
            <DialogDescription>Update your password details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Website (optional)</Label>
                <Input id="edit-website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username (optional)</Label>
                <Input id="edit-username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">Password</Label>
                <div className="flex">
                  <Input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes (optional)</Label>
                <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Details Dialog */}
      <Dialog
        open={!!passwordDetails}
        onOpenChange={(open) => {
          if (!open) setPasswordDetails(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Details</DialogTitle>
          </DialogHeader>
          {passwordDetails && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="p-2 bg-muted rounded-md">{passwordDetails.name}</div>
              </div>
              {passwordDetails.website && (
                <div className="space-y-2">
                  <Label>Website</Label>
                  <div className="p-2 bg-muted rounded-md flex justify-between items-center">
                    <span>{passwordDetails.website}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(passwordDetails.website, "Website copied")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {passwordDetails.username && (
                <div className="space-y-2">
                  <Label>Username</Label>
                  <div className="p-2 bg-muted rounded-md flex justify-between items-center">
                    <span>{passwordDetails.username}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(passwordDetails.username, "Username copied")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="p-2 bg-muted rounded-md flex justify-between items-center">
                  <span>{showPassword ? passwordDetails.password : "••••••••••••"}</span>
                  <div className="flex">
                    <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(passwordDetails.password, "Password copied")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {passwordDetails.notes && (
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <div className="p-2 bg-muted rounded-md whitespace-pre-wrap">{passwordDetails.notes}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => handleSharePassword()}>
              <Share className="mr-2 h-4 w-4" /> Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Password Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Password</DialogTitle>
            <DialogDescription>
              This link will expire after one hour or after the first access, whichever comes first.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex">
                <Input value={shareLink} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(shareLink, "Share link copied")}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsShareDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>Manage your account settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="p-2 bg-muted rounded-md">{session?.user?.email}</div>
            </div>
            <div className="space-y-2">
              <Label>Authentication Method</Label>
              <div className="p-2 bg-muted rounded-md">
                {session?.user?.hasPassword ? "Email + Password" : "Email Only (TOTP)"}
              </div>
            </div>
            {!session?.user?.hasPassword && (
              <form onSubmit={handleSetPassword} className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Set Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                  />
                </div>
                {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
                <Button type="submit">Set Password</Button>
              </form>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsProfileDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

