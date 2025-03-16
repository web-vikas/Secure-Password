"use client"

import { CustomAuthProvider } from "@/hooks/use-auth"
import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  return <CustomAuthProvider>
    <SessionProvider>{children}</SessionProvider>
  </CustomAuthProvider>
}

