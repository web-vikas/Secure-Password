import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db/connection"
import { PasswordEntryModel } from "@/lib/db/models"
import { encrypt } from "@/lib/encryption"

// Get all passwords
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get all passwords for the user
    const passwords = await PasswordEntryModel.find({ userId: session.user.id })

    // Return passwords without decrypting them
    return NextResponse.json(passwords)
  } catch (error) {
    console.error("Error getting passwords:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create a new password
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { name, password, website, username, notes } = await req.json()

    if (!name || !password) {
      return NextResponse.json({ error: "Name and password are required" }, { status: 400 })
    }

    // Encrypt password
    const encryptedPassword = encrypt(password, session.user.encryptionKey)

    // Create password entry
    const passwordEntry = await PasswordEntryModel.create({
      userId: session.user.id,
      name,
      encryptedPassword,
      website,
      username,
      notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(passwordEntry)
  } catch (error) {
    console.error("Error creating password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

