"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import {
  companySchema,
  employeeSchema,
  revenueSchema,
  taxSchema,
} from "@/lib/validations/business"
import { revalidatePath } from "next/cache"

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
              { name: "Vendas", type: "INCOME", color: "#10b981" },
              { name: "Serviços", type: "INCOME", color: "#3b82f6" },
              { name: "Salários", type: "EXPENSE", color: "#ef4444" },
              { name: "Fornecedores", type: "EXPENSE", color: "#f59e0b" },
              { name: "Marketing", type: "EXPENSE", color: "#8b5cf6" },
              { name: "Infraestrutura", type: "EXPENSE", color: "#06b6d4" },
            ],
          },
        },
      },
    })

    return tenant
  }

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
      companyId: formData.get("companyId") as string,
    }

    const validated = employeeSchema.parse(data)

    await prisma.employee.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        position: validated.position,
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
    await getBusinessTenant(user.id)

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string | undefined,
      position: formData.get("position") as string | undefined,
      companyId: formData.get("companyId") as string,
    }

    const validated = employeeSchema.parse(data)

    await prisma.employee.update({
      where: { id },
      data: {
        name: validated.name,
        email: validated.email || null,
        position: validated.position,
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
    await getBusinessTenant(user.id)

    await prisma.employee.delete({
      where: { id },
    })

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

export async function getBusinessStats(companyId: string, month: number, year: number) {
  try {
    const user = await requireAuth()
    const tenant = await getBusinessTenant(user.id)

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

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

    const employeeCount = await prisma.employee.count({
      where: { companyId },
    })

    const employeeExpenseMap = new Map<string, { employee: any; total: number }>()

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
        totalExpenses,
        totalTaxes,
        taxesPaid,
        taxesPending,
        employeeCount,
        expensesByEmployee,
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