"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { transactionSchema, categorySchema, goalSchema } from "@/lib/validations/finance"
import { revalidatePath } from "next/cache"
import {
  deleteCategoryBudget,
  ensureCategoryBudgetsTable,
  getBudgetsByCategoryId,
  upsertCategoryBudget,
} from "@/lib/finance/category-budgets"

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
      description: (formData.get("description") as string | null) ?? "",
      amount: formData.get("amount") as string,
      type: formData.get("type") as string,
      date: formData.get("date") as string,
      categoryId: formData.get("categoryId") as string,
    }

    const validated = transactionSchema.parse(data)

    const transactionDate = new Date(validated.date)
    let budgetAlert:
      | {
          categoryId: string
          categoryName: string
          monthlyLimit: number
          spent: number
          percentage: number
          crossed80: boolean
          crossed100: boolean
        }
      | undefined

    if (validated.type === "EXPENSE") {
      await ensureCategoryBudgetsTable()
    }

    await prisma.$transaction(async (tx) => {
      const anyTx = tx as any
      let previousSpent = 0
      let categoryName = ""
      let monthlyLimit: number | null = null

      if (validated.type === "EXPENSE") {
        const category = await anyTx.category.findFirst({
          where: {
            id: validated.categoryId,
            tenantId: tenant.id,
          },
        })

        categoryName = category?.name ?? ""
        const rows = (await anyTx.$queryRawUnsafe(
          `SELECT monthly_limit FROM category_budgets WHERE tenant_id = $1 AND category_id = $2 LIMIT 1;`,
          tenant.id,
          validated.categoryId
        )) as { monthly_limit: number }[]
        monthlyLimit = rows?.[0]?.monthly_limit != null ? Number(rows[0].monthly_limit) : null

        if (monthlyLimit && monthlyLimit > 0) {
          const startDate = new Date(
            transactionDate.getFullYear(),
            transactionDate.getMonth(),
            1
          )
          const endDate = new Date(
            transactionDate.getFullYear(),
            transactionDate.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          )

          const aggregate = await anyTx.transaction.aggregate({
            where: {
              tenantId: tenant.id,
              type: "EXPENSE",
              categoryId: validated.categoryId,
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: {
              amount: true,
            },
          })

          previousSpent = aggregate._sum.amount ?? 0
        }
      }

      await anyTx.transaction.create({
        data: {
          description: validated.description,
          amount: validated.amount,
          type: validated.type as "INCOME" | "EXPENSE",
          date: transactionDate,
          categoryId: validated.categoryId,
          tenantId: tenant.id,
          userId: user.id,
        },
      })

      if (validated.type !== "EXPENSE") return
      if (!monthlyLimit || monthlyLimit <= 0) return

      const newSpent = previousSpent + validated.amount
      const previousPercentage = previousSpent / monthlyLimit
      const newPercentage = newSpent / monthlyLimit

      budgetAlert = {
        categoryId: validated.categoryId,
        categoryName,
        monthlyLimit,
        spent: newSpent,
        percentage: newPercentage,
        crossed80: previousPercentage < 0.8 && newPercentage >= 0.8,
        crossed100: previousPercentage < 1 && newPercentage >= 1,
      }
    })

    revalidatePath("/dashboard/personal")
    return { success: true, budgetAlert }
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
      description: (formData.get("description") as string | null) ?? "",
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
      monthlyLimit: formData.get("monthlyLimit") as string | undefined,
    }

    const validated = categorySchema.parse(data)

    const created = await prisma.category.create({
      data: {
        name: validated.name,
        color: validated.color,
        type: validated.type as "INCOME" | "EXPENSE",
        icon: validated.icon ?? null,
        tenantId: tenant.id,
      },
    })

    if (validated.type === "EXPENSE") {
      await upsertCategoryBudget({
        tenantId: tenant.id,
        categoryId: created.id,
        monthlyLimit: validated.monthlyLimit ?? 0,
      })
    }

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
      monthlyLimit: formData.get("monthlyLimit") as string | undefined,
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
        icon: validated.icon ?? null,
      },
    })

    if (validated.type === "EXPENSE") {
      await upsertCategoryBudget({
        tenantId: tenant.id,
        categoryId: id,
        monthlyLimit: validated.monthlyLimit ?? 0,
      })
    } else {
      await deleteCategoryBudget({ tenantId: tenant.id, categoryId: id })
    }

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

    await deleteCategoryBudget({ tenantId: tenant.id, categoryId: id })
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
    })

    const budgets = await getBudgetsByCategoryId(tenant.id)
    const withBudgets = categories.map((c: any) => ({
      ...c,
      monthlyLimit: budgets.get(c.id) ?? null,
    }))

    const incomeOrder = new Map(
      ["Salário", "Freelance", "Investimentos", "Outro"].map((name, index) => [
        name.toLowerCase(),
        index,
      ])
    )

    const sorted = [...withBudgets].sort((a, b) => {
      const aType = String((a as any).type)
      const bType = String((b as any).type)

      // When filtering by type, keep only one branch of ordering.
      if (type === "INCOME" || (!type && aType === "INCOME" && bType === "INCOME")) {
        const aKey = String((a as any).name ?? "").toLowerCase()
        const bKey = String((b as any).name ?? "").toLowerCase()
        const aRank = incomeOrder.has(aKey) ? (incomeOrder.get(aKey) as number) : 999
        const bRank = incomeOrder.has(bKey) ? (incomeOrder.get(bKey) as number) : 999
        if (aRank !== bRank) return aRank - bRank
        return String((a as any).name ?? "").localeCompare(String((b as any).name ?? ""))
      }

      if (!type) {
        if (aType !== bType) {
          // INCOME first, then EXPENSE
          return aType === "INCOME" ? -1 : 1
        }
      }

      return String((a as any).name ?? "").localeCompare(String((b as any).name ?? ""))
    })

    return { success: true, data: sorted }
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
