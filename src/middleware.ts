import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyValue } from "@/lib/session"

const publicRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/verify-email",
  "/auth/reset-password",
  "/auth/new-password",
]

const authRoutes = [
  "/auth/signin",
  "/auth/signup",
  "/auth/verify-email",
  "/auth/reset-password",
  "/auth/new-password",
]

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const raw = request.cookies.get("saldofy_session")?.value
  if (!raw) return false

  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) return false

  const verified = await verifyValue(raw, secret)
  if (!verified.valid) return false

  try {
    const sessionData = JSON.parse(verified.payloadJson) as { expiresAt?: number }
    if (!sessionData.expiresAt) return false
    return Date.now() <= sessionData.expiresAt
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoggedIn = await hasValidSession(request)

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!isLoggedIn && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
