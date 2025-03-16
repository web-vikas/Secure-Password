import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db/connection"
import { UserModel } from "@/lib/db/models"
import { hashPassword, generateEncryptionKey } from "@/lib/encryption"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = await UserModel.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user has a password set (using email-only auth)
    if (!user.passwordHash) {
      return NextResponse.json({ error: "This account uses email authentication only" }, { status: 400 })
    }

    // Verify password
    const hashedPassword = hashPassword(password)
    if (hashedPassword !== user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate encryption key for the user's passwords
    const encryptionKey = generateEncryptionKey()

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        encryptionKey, // This will be used to encrypt/decrypt passwords
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    )

    // Set cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in password login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

