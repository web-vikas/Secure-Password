import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/", "/login", "/api/auth"]

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith("/shared/") ||
      request.nextUrl.pathname.startsWith("/api/shared/") ||
      request.nextUrl.pathname.startsWith("/api/auth/"),
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Get auth token
  const token = await getToken({ req: request, secret: process.env.JWT_SECRET })

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

