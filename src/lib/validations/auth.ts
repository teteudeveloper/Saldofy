import { z } from "zod"

export const signUpSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
})

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
})

export const verifyEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().length(6, "O código deve ter 6 dígitos"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

export const newPasswordSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
})