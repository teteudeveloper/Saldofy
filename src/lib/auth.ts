import { cookies } from "next/headers"
import { prisma } from "../lib/prisma"
import bcrypt from "bcryptjs"
import { signValue, verifyValue } from "./session"

const SESSION_COOKIE = "saldofy_session"
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000

interface SessionData {
  userId: string
  email: string
  name: string
  expiresAt: number
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing SESSION_SECRET (or NEXTAUTH_SECRET) in production")
    }
    return "dev-session-secret"
  }

  return secret
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateResetToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function createSession(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const sessionData: SessionData = {
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt: Date.now() + SESSION_DURATION,
  }

  const cookieValue = await signValue(
    JSON.stringify(sessionData),
    getSessionSecret()
  )

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

  return sessionData
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)

  if (!sessionCookie) {
    return null
  }

  try {
    const verified = await verifyValue(sessionCookie.value, getSessionSecret())
    if (!verified.valid) {
      await deleteSession()
      return null
    }

    const sessionData: SessionData = JSON.parse(verified.payloadJson)

    if (Date.now() > sessionData.expiresAt) {
      await deleteSession()
      return null
    }

    return sessionData
  } catch {
    await deleteSession()
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function hasValidSessionCookie(rawCookieValue: string): Promise<boolean> {
  try {
    const verified = await verifyValue(rawCookieValue, getSessionSecret())
    if (!verified.valid) return false
    const sessionData: SessionData = JSON.parse(verified.payloadJson)
    return Date.now() <= sessionData.expiresAt
  } catch {
    return false
  }
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      defaultTenantType: true,
      createdAt: true,
    },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}
