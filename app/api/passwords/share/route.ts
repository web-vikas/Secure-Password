import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db/connection"
import { PasswordEntryModel, SharedPasswordModel } from "@/lib/db/models"
import { generateUUID } from "@/lib/encryption"
import { sendPasswordSharedEmail } from "@/lib/email-service"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { passwordId } = await req.json()

    if (!passwordId) {
      return NextResponse.json({ error: "Password ID is required" }, { status: 400 })
    }

    // Get password
    const password = await PasswordEntryModel.findOne({
      _id: passwordId,
      userId: session.user.id,
    })

    if (!password) {
      return NextResponse.json({ error: "Password not found" }, { status: 404 })
    }

    // Generate token
    const token = generateUUID()

    // Set expiration (1 hour from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Create shared password
    const sharedPassword = await SharedPasswordModel.create({
      passwordId,
      token,
      creatorId: session.user.id,
      expiresAt,
      accessed: false,
    })

    // Generate share link
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/shared/${token}`

    // Send email notification
    await sendPasswordSharedEmail(session.user.email, password.name, shareLink)

    return NextResponse.json({ token, shareLink })
  } catch (error) {
    console.error("Error sharing password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

