import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db/connection"
import { UserModel, TOTPSessionModel } from "@/lib/db/models"
import { generateTOTP } from "@/lib/encryption"
import { sendTOTPEmail } from "@/lib/email-service"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find or create user
    let user = await UserModel.findOne({ email })
    if (!user) {
      user = await UserModel.create({ email })
    }

    // Generate TOTP code
    const code = generateTOTP()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // Expires in 10 minutes

    // Save TOTP session
    await TOTPSessionModel.create({
      email,
      code,
      expiresAt,
    })

    // Send email with TOTP code
    await sendTOTPEmail(email, code)

    return NextResponse.json({ success: true, message: "TOTP code sent to email" })
  } catch (error) {
    console.error("Error in email login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

