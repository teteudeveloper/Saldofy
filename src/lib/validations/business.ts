import { z } from "zod"

export const companySchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  cnpj: z.string().optional(),
})

export const employeeSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  position: z.string().optional(),
  monthlyCost: z.coerce.number().min(0, "O custo não pode ser negativo").optional(),
  companyId: z.string().min(1, "Empresa obrigatória"),
})

export const revenueSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  date: z.string().min(1, "Data obrigatória"),
  companyId: z.string().min(1, "Empresa obrigatória"),
})

export const taxSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  dueDate: z.string().min(1, "Data de vencimento obrigatória"),
  companyId: z.string().min(1, "Empresa obrigatória"),
  paid: z.boolean().optional(),
  paidDate: z.string().optional(),
})

export const expenseSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  date: z.string().min(1, "Data obrigatória"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  companyId: z.string().min(1, "Empresa obrigatória"),
  employeeId: z.string().optional().or(z.literal("")),
})
