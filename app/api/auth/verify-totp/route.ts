import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import dbConnect from "@/lib/db/connection"
import { UserModel, TOTPSessionModel } from "@/lib/db/models"
import { generateEncryptionKey } from "@/lib/encryption"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    // Find TOTP session
    const session = await TOTPSessionModel.findOne({
      email,
      code,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })
    }

    // Find user
    const user = await UserModel.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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

    // Delete used TOTP session
    await TOTPSessionModel.deleteOne({ _id: session._id })

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
    console.error("Error in verify TOTP:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

