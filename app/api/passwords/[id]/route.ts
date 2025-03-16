import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db/connection"
import { PasswordEntryModel } from "@/lib/db/models"
import { encrypt, decrypt } from "@/lib/encryption"

// Get a specific password
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get password
    const password = await PasswordEntryModel.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!password) {
      return NextResponse.json({ error: "Password not found" }, { status: 404 })
    }

    // Decrypt password
    const decryptedPassword = {
      ...password.toObject(),
      password: decrypt(password.encryptedPassword, session.user.encryptionKey),
    }

    // Remove encrypted password from response
    delete decryptedPassword.encryptedPassword

    return NextResponse.json(decryptedPassword)
  } catch (error) {
    console.error("Error getting password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update a password
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { name, password, website, username, notes } = await req.json()

    // Get existing password
    const existingPassword = await PasswordEntryModel.findOne({
      _id: params.id,
      userId: session.user.id,
    })

    if (!existingPassword) {
      return NextResponse.json({ error: "Password not found" }, { status: 404 })
    }

    // Update fields
    const updates: any = {
      updatedAt: new Date(),
    }

    if (name) updates.name = name
    if (password) updates.encryptedPassword = encrypt(password, session.user.encryptionKey)
    if (website !== undefined) updates.website = website
    if (username !== undefined) updates.username = username
    if (notes !== undefined) updates.notes = notes

    // Update password
    await PasswordEntryModel.updateOne({ _id: params.id }, { $set: updates })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a password
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Delete password
    await PasswordEntryModel.deleteOne({
      _id: params.id,
      userId: session.user.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

