import { NextResponse } from "next/server"
import dbConnect from "@/lib/db/connection"
import { UserModel } from "@/lib/db/models"
import { getServerSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ user: null })
    }

    await dbConnect()

    // Get user
    const user = await UserModel.findById(session.userId)
    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        hasPassword: !!user.passwordHash,
      },
    })
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

