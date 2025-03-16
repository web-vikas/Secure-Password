"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface Password {
  _id: string
  name: string
  website?: string
  username?: string
  password?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export function usePasswords() {
  const { data: session } = useSession()
  const [passwords, setPasswords] = useState<Password[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchPasswords = async () => {
    if (!session) return

    setLoading(true)
    try {
      const res = await fetch("/api/passwords")
      if (!res.ok) {
        throw new Error("Failed to fetch passwords")
      }
      const data = await res.json()
      setPasswords(data)
    } catch (error) {
      console.error("Error fetching passwords:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPassword = async (id: string) => {
    if (!session) return null

    setLoading(true)
    try {
      const res = await fetch(`/api/passwords/${id}`)
      if (!res.ok) {
        throw new Error("Failed to fetch password")
      }
      return await res.json()
    } catch (error) {
      console.error("Error fetching password:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPassword = async (passwordData: Omit<Password, "_id" | "createdAt" | "updatedAt">) => {
    if (!session) return null

    setLoading(true)
    try {
      const res = await fetch("/api/passwords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create password")
      }

      router.refresh()
      await fetchPasswords()
      return await res.json()
    } catch (error) {
      console.error("Error creating password:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (
    id: string,
    passwordData: Partial<Omit<Password, "_id" | "createdAt" | "updatedAt">>,
  ) => {
    if (!session) return

    setLoading(true)
    try {
      const res = await fetch(`/api/passwords/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update password")
      }

      router.refresh()
      await fetchPasswords()
    } catch (error) {
      console.error("Error updating password:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deletePassword = async (id: string) => {
    if (!session) return

    setLoading(true)
    try {
      const res = await fetch(`/api/passwords/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete password")
      }

      router.refresh()
      await fetchPasswords()
    } catch (error) {
      console.error("Error deleting password:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const sharePassword = async (id: string) => {
    if (!session) return null

    setLoading(true)
    try {
      const res = await fetch("/api/passwords/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordId: id }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to share password")
      }

      return await res.json()
    } catch (error) {
      console.error("Error sharing password:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    passwords,
    loading,
    fetchPasswords,
    getPassword,
    createPassword,
    updatePassword,
    deletePassword,
    sharePassword,
  }
}

