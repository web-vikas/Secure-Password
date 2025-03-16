import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db/connection"
import { PasswordEntryModel, SharedPasswordModel, UserModel } from "@/lib/db/models"
import { sendPasswordAccessedEmail } from "@/lib/email-service"

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    await dbConnect()

    // Find shared password
    const sharedPassword = await SharedPasswordModel.findOne({
      token: params.token,
      expiresAt: { $gt: new Date() },
      accessed: false,
    })

    if (!sharedPassword) {
      return NextResponse.json({ error: "Shared password not found or expired" }, { status: 404 })
    }

    // Get password
    const password = await PasswordEntryModel.findById(sharedPassword.passwordId)
    if (!password) {
      return NextResponse.json({ error: "Password not found" }, { status: 404 })
    }

    // Get creator
    const creator = await UserModel.findById(sharedPassword.creatorId)
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    // Mark as accessed
    await SharedPasswordModel.updateOne({ _id: sharedPassword._id }, { accessed: true })

    // Send email notification
    await sendPasswordAccessedEmail(creator.email, password.name)

    // Return password details (without decryption)
    return NextResponse.json({
      name: password.name,
      website: password.website,
      username: password.username,
      encryptedPassword: password.encryptedPassword,
      notes: password.notes,
    })
  } catch (error) {
    console.error("Error accessing shared password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

