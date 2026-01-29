"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import {
  companySchema,
  employeeSchema,
  revenueSchema,
  taxSchema,
  expenseSchema,
} from "@/lib/validations/business"
import { revalidatePath } from "next/cache"

const DEFAULT_BUSINESS_CATEGORIES: Array<{
  name: string
  type: "INCOME" | "EXPENSE"
  color: string
}> = [
  { name: "Vendas", type: "INCOME", color: "#10b981" },
  { name: "Serviços", type: "INCOME", color: "#3b82f6" },
  { name: "Salários", type: "EXPENSE", color: "#ef4444" },
  { name: "Água", type: "EXPENSE", color: "#06b6d4" },
  { name: "Luz", type: "EXPENSE", color: "#f59e0b" },
  { name: "Internet", type: "EXPENSE", color: "#6366f1" },
  { name: "Aluguel", type: "EXPENSE", color: "#8b5cf6" },
  { name: "Fornecedores", type: "EXPENSE", color: "#f97316" },
  { name: "Marketing", type: "EXPENSE", color: "#ec4899" },
  { name: "Infraestrutura", type: "EXPENSE", color: "#0ea5e9" },
  { name: "Outros", type: "EXPENSE", color: "#64748b" },
]

async function ensureBusinessDefaultCategories(tenantId: string) {
  const existing = await prisma.category.findMany({
    where: { tenantId },
    select: { name: true, type: true },
  })

  const existingKey = new Set(existing.map((c) => `${c.type}:${c.name}`))
  const missing = DEFAULT_BUSINESS_CATEGORIES.filter(
    (c) => !existingKey.has(`${c.type}:${c.name}`)
  )

  if (missing.length === 0) return

  await prisma.category.createMany({
    data: missing.map((c) => ({ ...c, tenantId })),
  })
}

async function getBusinessTenant(userId: string) {
  const tenantUser = await prisma.tenantUser.findFirst({
    where: {
      userId,
      tenant: {
        type: "BUSINESS",
      },
    },
    include: {
      tenant: true,
    },
  })

  if (!tenantUser) {
    const tenant = await prisma.tenant.create({
      data: {
        name: "Finanças Empresariais",
        type: "BUSINESS",
        tenantUsers: {
          create: {
            userId,
            role: "OWNER",
          },
        },
        categories: {
          createMany: {
            data: [
              ...DEFAULT_BUSINESS_CATEGORIES,
            ],
          },
        },
      },
    })

    return tenant
  }

  await ensureBusinessDefaultCategories(tenantUser.tenant.id)
  return tenantUser.tenant
}

export async function createCompany(formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      cnpj: formData.get("cnpj") as string | undefined,
    }

    const validated = companySchema.parse(data)

    await prisma.company.create({
      data: {
        name: validated.name,
        cnpj: validated.cnpj,
        tenantId: tenant.id,
      },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("CreateCompany error:", error)
    return { error: error.message || "Erro ao criar empresa" }
  }
}

export async function updateCompany(id: string, formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      cnpj: formData.get("cnpj") as string | undefined,
    }

    const validated = companySchema.parse(data)

    await prisma.company.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        name: validated.name,
        cnpj: validated.cnpj,
      },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("UpdateCompany error:", error)
    return { error: error.message || "Erro ao atualizar empresa" }
  }
}

export async function deleteCompany(id: string) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    await prisma.company.delete({
      where: {
        id,
        tenantId: tenant.id,
      },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("DeleteCompany error:", error)
    return { error: error.message || "Erro ao deletar empresa" }
  }
}

export async function getCompanies() {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const companies = await prisma.company.findMany({
      where: {
        tenantId: tenant.id,
      },
      include: {
        _count: {
          select: {
            employees: true,
            revenues: true,
            taxes: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, data: companies }
  } catch (error: any) {
    console.error("GetCompanies error:", error)
    return { error: error.message || "Erro ao buscar empresas" }
  }
}

export async function createEmployee(formData: FormData) {
  try {
    const user = await requireAuth()
    await getBusinessTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string | undefined,
      position: formData.get("position") as string | undefined,
      monthlyCost: (formData.get("monthlyCost") as string | null) ?? undefined,
      companyId: formData.get("companyId") as string,
    }

    const validated = employeeSchema.parse(data)

    await prisma.employee.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        position: validated.position,
        monthlyCost: validated.monthlyCost ?? 0,
        companyId: validated.companyId,
      },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("CreateEmployee error:", error)
    return { error: error.message || "Erro ao criar funcionário" }
  }
}

export async function updateEmployee(id: string, formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string | undefined,
      position: formData.get("position") as string | undefined,
      monthlyCost: (formData.get("monthlyCost") as string | null) ?? undefined,
      companyId: formData.get("companyId") as string,
    }

    const validated = employeeSchema.parse(data)

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        company: {
          tenantId: tenant.id,
        },
      },
      select: { id: true },
    })
    if (!employee) return { error: "Funcionário não encontrado" }

    await prisma.employee.update({
      where: { id },
      data: {
        name: validated.name,
        email: validated.email || null,
        position: validated.position,
        monthlyCost: validated.monthlyCost ?? 0,
        companyId: validated.companyId,
      },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("UpdateEmployee error:", error)
    return { error: error.message || "Erro ao atualizar funcionário" }
  }
}

export async function deleteEmployee(id: string) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const employee = await prisma.employee.findFirst({
      where: {
        id,
        company: {
          tenantId: tenant.id,
        },
      },
      select: { id: true },
    })
    if (!employee) return { error: "Funcionário não encontrado" }

    await prisma.employee.delete({ where: { id } })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("DeleteEmployee error:", error)
    return { error: error.message || "Erro ao deletar funcionário" }
  }
}

export async function getEmployeesByCompany(companyId: string) {
  try {
    const user = await requireAuth()
    await getBusinessTenant(user.id)

    const employees = await prisma.employee.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    })

    return { success: true, data: employees }
  } catch (error: any) {
    console.error("GetEmployees error:", error)
    return { error: error.message || "Erro ao buscar funcionários" }
  }
}

export async function getBusinessCategories(type?: "INCOME" | "EXPENSE") {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const categories = await prisma.category.findMany({
      where: {
        tenantId: tenant.id,
        ...(type && { type }),
      },
      orderBy: { name: "asc" },
    })

    return { success: true, data: categories }
  } catch (error: any) {
    console.error("GetBusinessCategories error:", error)
    return { error: error.message || "Erro ao buscar categorias" }
  }
}

export async function createRevenue(formData: FormData) {
  try {
    const user = await requireAuth()
    await getBusinessTenant(user.id)

    const data = {
      description: formData.get("description") as string,
      amount: formData.get("amount") as string,
      date: formData.get("date") as string,
      companyId: formData.get("companyId") as string,
    }

    const validated = revenueSchema.parse(data)

    await prisma.revenue.create({
      data: {
        description: validated.description,
        amount: validated.amount,
        date: new Date(validated.date),
        companyId: validated.companyId,
      },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("CreateRevenue error:", error)
    return { error: error.message || "Erro ao criar receita" }
  }
}

export async function getRevenuesByCompany(
  companyId: string,
  month: number,
  year: number
) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const company = await prisma.company.findFirst({
      where: { id: companyId, tenantId: tenant.id },
      select: { id: true },
    })

    if (!company) {
      return { error: "Empresa não encontrada" }
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const revenues = await prisma.revenue.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "desc" },
    })

    return { success: true, data: revenues }
  } catch (error: any) {
    console.error("GetRevenuesByCompany error:", error)
    return { error: error.message || "Erro ao buscar receitas" }
  }
}

export async function deleteRevenue(id: string) {
  try {
    const user = await requireAuth()
    await getBusinessTenant(user.id)

    await prisma.revenue.delete({
      where: { id },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("DeleteRevenue error:", error)
    return { error: error.message || "Erro ao deletar receita" }
  }
}

export async function createTax(formData: FormData) {
  try {
    const user = await requireAuth()
    await getBusinessTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      amount: formData.get("amount") as string,
      dueDate: formData.get("dueDate") as string,
      companyId: formData.get("companyId") as string,
    }

    const validated = taxSchema.parse(data)

    await prisma.tax.create({
      data: {
        name: validated.name,
        amount: validated.amount,
        dueDate: new Date(validated.dueDate),
        companyId: validated.companyId,
        paid: false,
      },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("CreateTax error:", error)
    return { error: error.message || "Erro ao criar imposto" }
  }
}

export async function getTaxesByCompany(
  companyId: string,
  month: number,
  year: number
) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const company = await prisma.company.findFirst({
      where: { id: companyId, tenantId: tenant.id },
      select: { id: true },
    })

    if (!company) {
      return { error: "Empresa não encontrada" }
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const taxes = await prisma.tax.findMany({
      where: {
        companyId,
        dueDate: { gte: startDate, lte: endDate },
      },
      orderBy: { dueDate: "asc" },
    })

    return { success: true, data: taxes }
  } catch (error: any) {
    console.error("GetTaxesByCompany error:", error)
    return { error: error.message || "Erro ao buscar impostos" }
  }
}

export async function markTaxAsPaid(id: string) {
  try {
    const user = await requireAuth()
    await getBusinessTenant(user.id)

    await prisma.tax.update({
      where: { id },
      data: {
        paid: true,
        paidDate: new Date(),
      },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("MarkTaxAsPaid error:", error)
    return { error: error.message || "Erro ao marcar imposto como pago" }
  }
}

export async function deleteTax(id: string) {
  try {
    const user = await requireAuth()
    await getBusinessTenant(user.id)

    await prisma.tax.delete({
      where: { id },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("DeleteTax error:", error)
    return { error: error.message || "Erro ao deletar imposto" }
  }
}

export async function createBusinessExpense(formData: FormData) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const data = {
      description: formData.get("description") as string,
      amount: formData.get("amount") as string,
      date: formData.get("date") as string,
      categoryId: formData.get("categoryId") as string,
      companyId: formData.get("companyId") as string,
      employeeId: (formData.get("employeeId") as string | null) ?? undefined,
    }

    const validated = expenseSchema.parse(data)

    const company = await prisma.company.findFirst({
      where: { id: validated.companyId, tenantId: tenant.id },
      select: { id: true },
    })
    if (!company) throw new Error("Empresa não encontrada")

    const category = await prisma.category.findFirst({
      where: {
        id: validated.categoryId,
        tenantId: tenant.id,
        type: "EXPENSE",
      },
      select: { id: true },
    })
    if (!category) throw new Error("Categoria inválida")

    const employeeId =
      validated.employeeId && validated.employeeId.length > 0
        ? validated.employeeId
        : null

    if (employeeId) {
      const employee = await prisma.employee.findFirst({
        where: { id: employeeId, companyId: validated.companyId },
        select: { id: true },
      })
      if (!employee) throw new Error("Funcionário inválido")
    }

    await prisma.transaction.create({
      data: {
        description: validated.description,
        amount: validated.amount,
        type: "EXPENSE",
        date: new Date(validated.date),
        categoryId: validated.categoryId,
        tenantId: tenant.id,
        userId: user.id,
        companyId: validated.companyId,
        employeeId,
      },
    })

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("CreateBusinessExpense error:", error)
    return { error: error.message || "Erro ao criar despesa" }
  }
}

export async function getBusinessExpenses(
  companyId: string,
  month: number,
  year: number
) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const company = await prisma.company.findFirst({
      where: { id: companyId, tenantId: tenant.id },
      select: { id: true },
    })

    if (!company) return { error: "Empresa não encontrada" }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const expenses = await prisma.transaction.findMany({
      where: {
        tenantId: tenant.id,
        companyId,
        type: "EXPENSE",
        date: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
        employee: true,
      },
      orderBy: { date: "desc" },
    })

    return { success: true, data: expenses }
  } catch (error: any) {
    console.error("GetBusinessExpenses error:", error)
    return { error: error.message || "Erro ao buscar despesas" }
  }
}

export async function deleteBusinessExpense(id: string) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const result = await prisma.transaction.deleteMany({
      where: {
        id,
        tenantId: tenant.id,
        type: "EXPENSE",
      },
    })

    if (result.count === 0) {
      return { error: "Despesa não encontrada" }
    }

    revalidatePath("/dashboard/business")
    return { success: true }
  } catch (error: any) {
    console.error("DeleteBusinessExpense error:", error)
    return { error: error.message || "Erro ao deletar despesa" }
  }
}

export async function getBusinessStats(companyId: string, month: number, year: number) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const employees = await prisma.employee.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        companyId: true,
        monthlyCost: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    })

    const revenues = await prisma.revenue.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)

    const expenses = await prisma.transaction.findMany({
      where: {
        companyId,
        type: "EXPENSE",
        tenantId: tenant.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        employee: true,
      },
    })

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalEmployeeCosts = employees.reduce(
      (sum, e) => sum + (e.monthlyCost ?? 0),
      0
    )

    const taxes = await prisma.tax.findMany({
      where: {
        companyId,
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const totalTaxes = taxes.reduce((sum, t) => sum + t.amount, 0)
    const taxesPaid = taxes.filter((t) => t.paid).reduce((sum, t) => sum + t.amount, 0)
    const taxesPending = totalTaxes - taxesPaid

    const employeeCount = employees.length

    const employeeExpenseMap = new Map<string, { employee: any; total: number }>()

    employees.forEach((employee) => {
      if (employee.monthlyCost && employee.monthlyCost > 0) {
        employeeExpenseMap.set(employee.id, {
          employee,
          total: employee.monthlyCost,
        })
      }
    })

    expenses.forEach((expense) => {
      if (expense.employeeId && expense.employee) {
        const existing = employeeExpenseMap.get(expense.employeeId)
        if (existing) {
          existing.total += expense.amount
        } else {
          employeeExpenseMap.set(expense.employeeId, {
            employee: expense.employee,
            total: expense.amount,
          })
        }
      }
    })

    const expensesByEmployee = Array.from(employeeExpenseMap.values()).sort(
      (a, b) => b.total - a.total
    )

    return {
      success: true,
      data: {
        totalRevenue,
        totalExpenses: totalExpenses + totalEmployeeCosts,
        totalTaxes,
        taxesPaid,
        taxesPending,
        employeeCount,
        expensesByEmployee,
        totalEmployeeCosts,
      },
    }
  } catch (error: any) {
    console.error("GetBusinessStats error:", error)
    return { error: error.message || "Erro ao buscar estatísticas" }
  }
}

export async function getUserCreationDateBusiness() {
  try {
    const user = await requireAuth()
    return { data: user.createdAt }
  } catch (error: any) {
    console.error("GetUserCreationDate error:", error)
    return { error: error.message || "Erro ao buscar data de criação" }
  }
}
