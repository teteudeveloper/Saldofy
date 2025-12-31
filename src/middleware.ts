import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get("saldofy_session")

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (!sessionCookie && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
