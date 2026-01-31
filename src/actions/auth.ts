"use server"

import { prisma } from "@/lib/prisma"
import {
  hashPassword,
  verifyPassword,
  generateResetToken,
  createSession,
  deleteSession,
} from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"
import {
  signUpSchema,
  signInSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  newPasswordSchema,
} from "@/lib/validations/auth"
import { redirect } from "next/navigation"
import { RESET_TOKEN_EXPIRY } from "@/lib/constants"

export async function signUp(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      tenantType: (formData.get("tenantType") as "PERSONAL" | "BUSINESS") || "PERSONAL",
    }

    const validated = signUpSchema.parse(data)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { error: "Este email já está cadastrado" }
    }

    const hashedPassword = await hashPassword(validated.password)

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        emailVerified: true,
        defaultTenantType: data.tenantType,
      },
    })

    const tenantName = data.tenantType === "PERSONAL" ? "Finanças Pessoais" : "Finanças Empresariais"
    
    await prisma.tenant.create({
      data: {
        name: tenantName,
        type: data.tenantType,
        tenantUsers: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
        ...(data.tenantType === "PERSONAL"
          ? {
              categories: {
                createMany: {
                  data: [
                    { name: "Salário", type: "INCOME", color: "#10b981" },
                    { name: "Freelance", type: "INCOME", color: "#3b82f6" },
                    { name: "Investimentos", type: "INCOME", color: "#8b5cf6" },
                    { name: "Outro", type: "INCOME", color: "#64748b" },
                  ],
                },
              },
            }
          : {}),
      },
    })

    await createSession(user.id)

    return { success: true }
  } catch (error: any) {
    console.error("SignUp error:", error)
    return { error: error.message || "Erro ao criar conta" }
  }
}

export async function signIn(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validated = signInSchema.parse(data)

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (!user) {
      return { error: "Email ou senha incorretos" }
    }

    const isValidPassword = await verifyPassword(
      validated.password,
      user.password
    )

    if (!isValidPassword) {
      return { error: "Email ou senha incorretos" }
    }

    await createSession(user.id)

    return { success: true }
  } catch (error: any) {
    console.error("SignIn error:", error)
    return { error: error.message || "Erro ao fazer login" }
  }
}

export async function verifyEmail(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
      code: formData.get("code") as string,
    }

    const validated = verifyEmailSchema.parse(data)

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
      select: { id: true },
    })

    if (!user) {
      return { error: "Usuário não encontrado" }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })

    await createSession(user.id)
    return { success: true }
  } catch (error: any) {
    console.error("VerifyEmail error:", error)
    return { error: error.message || "Erro ao verificar email" }
  }
}

export async function resendVerificationCode(email: string) {
  try {
    if (!email) return { error: "Email inválido" }
    return { success: true }
  } catch (error: any) {
    console.error("ResendVerificationCode error:", error)
    return { error: error.message || "Erro ao reenviar código" }
  }
}


export async function resetPassword(formData: FormData) {
  try {
    const data = {
      email: formData.get("email") as string,
    }

    const validated = resetPasswordSchema.parse(data)

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (!user) {
      return { success: true }
    }

    const resetToken = generateResetToken()
    const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    await sendPasswordResetEmail(validated.email, resetToken)

    return { success: true }
  } catch (error: any) {
    console.error("ResetPassword error:", error)
    return { error: error.message || "Erro ao solicitar redefinição de senha" }
  }
}

export async function setNewPassword(formData: FormData) {
  try {
    const data = {
      token: formData.get("token") as string,
      password: formData.get("password") as string,
    }

    const validated = newPasswordSchema.parse(data)

    const user = await prisma.user.findFirst({
      where: {
        resetToken: validated.token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return { error: "Token inválido ou expirado" }
    }

    const hashedPassword = await hashPassword(validated.password)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error("SetNewPassword error:", error)
    return { error: error.message || "Erro ao redefinir senha" }
  }
}

export async function signOut() {
  await deleteSession()
  redirect("/auth/signin")
}

export async function deleteAccount() {
  try {
    const { requireAuth: authRequire } = await import("@/lib/auth")
    const user = await authRequire()

    if (!user) {
      return { error: "Não autenticado" }
    }

    // Delete all transactions
    await prisma.transaction.deleteMany({
      where: { userId: user.id },
    })

    // Delete all goals
    await prisma.goal.deleteMany({
      where: { userId: user.id },
    })

    // Delete all categories in tenant
    await prisma.category.deleteMany({
      where: {
        tenant: {
          tenantUsers: {
            some: { userId: user.id },
          },
        },
      },
    })

    // Delete tenant associations
    await prisma.tenantUser.deleteMany({
      where: { userId: user.id },
    })

    // Delete empty tenants
    const tenantsWithUser = await prisma.tenant.findMany({
      where: {
        tenantUsers: {
          some: { userId: user.id },
        },
      },
    })

    for (const tenant of tenantsWithUser) {
      const remainingUsers = await prisma.tenantUser.count({
        where: { tenantId: tenant.id },
      })
      if (remainingUsers === 0) {
        await prisma.tenant.delete({
          where: { id: tenant.id },
        })
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { id: user.id },
    })

    await deleteSession()

    return { success: true }
  } catch (error: any) {
    console.error("DeleteAccount error:", error)
    return { error: error.message || "Erro ao deletar conta" }
  }
}
