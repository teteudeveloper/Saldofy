"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { transactionSchema, categorySchema, goalSchema } from "@/lib/validations/finance"
import { revalidatePath } from "next/cache"

async function getPersonalTenant(userId: string) {
  const tenantUser = await prisma.tenantUser.findFirst({
    where: {
      userId,
      tenant: {
        type: "PERSONAL",
      },
    },
    include: {
      tenant: true,
    },
  })

  if (!tenantUser) {
    throw new Error("Personal tenant not found")
  }

  return tenantUser.tenant
}

export async function createTransaction(formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const data = {
      description: formData.get("description") as string,
      amount: formData.get("amount") as string,
      type: formData.get("type") as string,
      date: formData.get("date") as string,
      categoryId: formData.get("categoryId") as string,
    }

    const validated = transactionSchema.parse(data)

    await prisma.transaction.create({
      data: {
        description: validated.description,
        amount: validated.amount,
        type: validated.type as "INCOME" | "EXPENSE",
        date: new Date(validated.date),
        categoryId: validated.categoryId,
        tenantId: tenant.id,
        userId: user.id,
      },
    })

    revalidatePath("/dashboard/personal")
    return { success: true }
  } catch (error: any) {
    console.error("CreateTransaction error:", error)
    return { error: error.message || "Erro ao criar transação" }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const data = {
      description: formData.get("description") as string,
      amount: formData.get("amount") as string,
      type: formData.get("type") as string,
      date: formData.get("date") as string,
      categoryId: formData.get("categoryId") as string,
    }

    const validated = transactionSchema.parse(data)

    await prisma.transaction.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        description: validated.description,
        amount: validated.amount,
        type: validated.type as "INCOME" | "EXPENSE",
        date: new Date(validated.date),
        categoryId: validated.categoryId,
      },
    })

    revalidatePath("/dashboard/personal")
    return { success: true }
  } catch (error: any) {
    console.error("UpdateTransaction error:", error)
    return { error: error.message || "Erro ao atualizar transação" }
  }
}

export async function deleteTransaction(id: string) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    await prisma.transaction.delete({
      where: {
        id,
        tenantId: tenant.id,
      },
    })

    revalidatePath("/dashboard/personal")
    return { success: true }
  } catch (error: any) {
    console.error("DeleteTransaction error:", error)
    return { error: error.message || "Erro ao deletar transação" }
  }
}

export async function getTransactions(month: number, year: number) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId: tenant.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return { success: true, data: transactions }
  } catch (error: any) {
    console.error("GetTransactions error:", error)
    return { error: error.message || "Erro ao buscar transações" }
  }
}

export async function createCategory(formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      type: formData.get("type") as string,
      icon: formData.get("icon") as string | undefined,
    }

    const validated = categorySchema.parse(data)

    await prisma.category.create({
      data: {
        name: validated.name,
        color: validated.color,
        type: validated.type as "INCOME" | "EXPENSE",
        icon: validated.icon,
        tenantId: tenant.id,
      },
    })

    revalidatePath("/dashboard/personal")
    return { success: true }
  } catch (error: any) {
    console.error("CreateCategory error:", error)
    return { error: error.message || "Erro ao criar categoria" }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      color: formData.get("color") as string,
      type: formData.get("type") as string,
      icon: formData.get("icon") as string | undefined,
    }

    const validated = categorySchema.parse(data)

    await prisma.category.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        name: validated.name,
        color: validated.color,
        type: validated.type as "INCOME" | "EXPENSE",
        icon: validated.icon,
      },
    })

    revalidatePath("/dashboard/personal")
    return { success: true }
  } catch (error: any) {
    console.error("UpdateCategory error:", error)
    return { error: error.message || "Erro ao atualizar categoria" }
  }
}

export async function deleteCategory(id: string) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    await prisma.category.delete({
      where: {
        id,
        tenantId: tenant.id,
      },
    })

    revalidatePath("/dashboard/personal")
    return { success: true }
  } catch (error: any) {
    console.error("DeleteCategory error:", error)
    return { error: error.message || "Erro ao deletar categoria" }
  }
}

export async function getCategories(type?: "INCOME" | "EXPENSE") {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const categories = await prisma.category.findMany({
      where: {
        tenantId: tenant.id,
        ...(type && { type }),
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, data: categories }
  } catch (error: any) {
    console.error("GetCategories error:", error)
    return { error: error.message || "Erro ao buscar categorias" }
  }
}

export async function createGoal(formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      targetAmount: formData.get("targetAmount") as string,
      currentAmount: formData.get("currentAmount") as string | undefined,
      deadline: formData.get("deadline") as string | undefined,
    }

    const validated = goalSchema.parse(data)

    await prisma.goal.create({
      data: {
        name: validated.name,
        targetAmount: validated.targetAmount,
        currentAmount: validated.currentAmount || 0,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
        tenantId: tenant.id,
        userId: user.id,
      },
    })

    revalidatePath("/dashboard/goals")
    return { success: true }
  } catch (error: any) {
    console.error("CreateGoal error:", error)
    return { error: error.message || "Erro ao criar meta" }
  }
}

export async function updateGoal(id: string, formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      targetAmount: formData.get("targetAmount") as string,
      currentAmount: formData.get("currentAmount") as string,
      deadline: formData.get("deadline") as string | undefined,
    }

    const validated = goalSchema.parse(data)

    await prisma.goal.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        name: validated.name,
        targetAmount: validated.targetAmount,
        currentAmount: validated.currentAmount || 0,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
      },
    })

    revalidatePath("/dashboard/goals")
    return { success: true }
  } catch (error: any) {
    console.error("UpdateGoal error:", error)
    return { error: error.message || "Erro ao atualizar meta" }
  }
}

export async function deleteGoal(id: string) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    await prisma.goal.delete({
      where: {
        id,
        tenantId: tenant.id,
      },
    })

    revalidatePath("/dashboard/goals")
    return { success: true }
  } catch (error: any) {
    console.error("DeleteGoal error:", error)
    return { error: error.message || "Erro ao deletar meta" }
  }
}

export async function getGoals() {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const goals = await prisma.goal.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, data: goals }
  } catch (error: any) {
    console.error("GetGoals error:", error)
    return { error: error.message || "Erro ao buscar metas" }
  }
}


export async function getMonthlyStats(month: number, year: number) {
  try {
    const user = await requireAuth()
    const tenant = await getPersonalTenant(user.id)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId: tenant.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    })

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    const categoryTotals = new Map<string, { category: any; total: number }>()

    transactions.forEach((t) => {
      const key = t.categoryId
      const existing = categoryTotals.get(key)
      if (existing) {
        existing.total += t.amount
      } else {
        categoryTotals.set(key, {
          category: t.category,
          total: t.amount,
        })
      }
    })

    const categoryBreakdown = Array.from(categoryTotals.values())
      .map((item) => ({
        category: item.category,
        total: item.total,
        percentage:
          item.category.type === "INCOME"
            ? (item.total / totalIncome) * 100
            : (item.total / totalExpense) * 100,
      }))
      .sort((a, b) => b.total - a.total)

    return {
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        categoryBreakdown,
      },
    }
  } catch (error: any) {
    console.error("GetMonthlyStats error:", error)
    return { error: error.message || "Erro ao buscar estatísticas" }
  }
}

export async function getUserCreationDate() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (await requireAuth()).id },
      select: { createdAt: true },
    })
    if (!user) {
      return { error: "Usuário não encontrado" }
    }
    return { data: user.createdAt }
  } catch (error: any) {
    console.error("GetUserCreationDate error:", error)
    return { error: error.message || "Erro ao buscar data de criação" }
  }
}
