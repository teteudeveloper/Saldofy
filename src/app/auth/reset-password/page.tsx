/* eslint-disable react/jsx-no-undef */
"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { resetPassword } from "@/actions/auth"
import { Loader2, KeyRound, Mail } from "lucide-react"

export default function ResetPasswordPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await resetPassword(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao solicitar redefinição",
        description: result.error,
      })
      setLoading(false)
      return
    }

    setSubmitted(true)
    toast({
      title: "Email enviado!",
      description: "Verifique sua caixa de entrada.",
    })
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Email enviado!
            </CardTitle>
            <CardDescription className="text-center">
              Enviamos um link de redefinição de senha para seu email.
              Verifique sua caixa de entrada.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/auth/signin" className="w-full">
              <Button className="w-full">Voltar para login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Redefinir senha
          </CardTitle>
          <CardDescription className="text-center">
            Digite seu email para receber um link de redefinição
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="joao@exemplo.com"
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar link de redefinição"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Lembrou sua senha?{" "}
              <Link
                href="/auth/signin"
                className="text-primary hover:underline font-medium"
              >
                Fazer login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}