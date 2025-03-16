import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/db/connection"
import { UserModel } from "@/lib/db/models"
import { hashPassword } from "@/lib/encryption"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Hash password
    const passwordHash = hashPassword(password)

    // Update user
    await UserModel.updateOne({ _id: session.user.id }, { passwordHash, updatedAt: new Date() })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in set password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

