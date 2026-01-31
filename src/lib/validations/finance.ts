import { z } from "zod"

export const transactionSchema = z.object({
  description: z
    .preprocess((value) => (typeof value === "string" ? value.trim() : ""), z.string())
    .optional()
    .default(""),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string().min(1, "Data obrigatória"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  color: z.string().min(1, "Cor obrigatória"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string().optional()
  ),
  monthlyLimit: z
    .preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().min(0, "O limite mensal não pode ser negativo")
    )
    .optional(),
}).superRefine((value, ctx) => {
  if (value.type === "EXPENSE" && value.monthlyLimit === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["monthlyLimit"],
      message: "Limite mensal obrigatório para despesas",
    })
  }
})

export const goalSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  targetAmount: z.coerce.number().positive("O valor deve ser positivo"),
  currentAmount: z.coerce.number().min(0, "O valor não pode ser negativo").optional(),
  deadline: z.string().optional(),
})
