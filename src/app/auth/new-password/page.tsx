"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { setNewPassword } from "@/actions/auth"
import { Loader2, Lock } from "lucide-react"

function NewPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      toast({
        variant: "destructive",
        title: "Token inválido",
        description: "O link de redefinição é inválido ou expirou.",
      })
      router.push("/auth/reset-password")
      return
    }
    setToken(tokenParam)
  }, [searchParams, router, toast])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "As senhas não coincidem",
        description: "Por favor, verifique as senhas digitadas.",
      })
      setLoading(false)
      return
    }

    formData.set("token", token)
    const result = await setNewPassword(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: result.error,
      })
      setLoading(false)
      return
    }

    toast({
      title: "Senha redefinida com sucesso!",
      description: "Você já pode fazer login com sua nova senha.",
    })

    router.push("/auth/signin")
  }

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <Lock className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Nova senha
          </CardTitle>
          <CardDescription className="text-center">
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir senha"
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              <Link
                href="/auth/signin"
                className="text-primary hover:underline font-medium"
              >
                Voltar para login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <NewPasswordContent />
    </Suspense>
  )
}