import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

interface Session {
  userId: string
  email: string
  encryptionKey: string
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as Session
    return decoded
  } catch (error) {
    console.error("Error verifying JWT:", error)
    return null
  }
}

