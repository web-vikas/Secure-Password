"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string) => Promise<void>
  verifyTOTP: (email: string, code: string) => Promise<void>
  passwordLogin: (email: string, password: string) => Promise<void>
  setPassword: (password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    async function loadUserFromSession() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to load user:", error)
      } finally {
        setLoading(false)
      }
    }
    loadUserFromSession()
  }, [])

  const login = async (email: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/email-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to send login code")
      }

      router.push(`/verify?email=${encodeURIComponent(email)}`)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const verifyTOTP = async (email: string, code: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Invalid verification code")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("TOTP verification error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const passwordLogin = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Invalid credentials")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Password login error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const setPassword = async (password: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to set password")
      }
    } catch (error) {
      console.error("Set password error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyTOTP, passwordLogin, setPassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

