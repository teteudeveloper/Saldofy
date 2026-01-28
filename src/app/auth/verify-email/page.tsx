"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { verifyEmail, resendVerificationCode } from "@/actions/auth"
import { Loader2, Mail } from "lucide-react"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState("")
  const [tenantType, setTenantType] = useState<"PERSONAL" | "BUSINESS">("PERSONAL")

  useEffect(() => {
    const emailParam = searchParams.get("email")
    const typeParam = (searchParams.get("type") as "PERSONAL" | "BUSINESS") || "PERSONAL"
    if (emailParam) {
      setEmail(emailParam)
      setTenantType(typeParam)
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("email", email)
    formData.set("tenantType", tenantType)
    
    const result = await verifyEmail(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao verificar email",
        description: result.error,
      })
      setLoading(false)
      return
    }

    toast({
      title: "Email verificado com sucesso!",
      description: "Você será redirecionado em breve.",
    })

    const redirectPath = tenantType === "PERSONAL" ? "/dashboard/personal" : "/dashboard/business"
    router.push(redirectPath)
  }

  async function handleResend() {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email não encontrado",
        description: "Por favor, forneça um email válido.",
      })
      return
    }

    setResending(true)
    const result = await resendVerificationCode(email)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao reenviar código",
        description: result.error,
      })
    } else {
      toast({
        title: "Código reenviado!",
        description: "Verifique seu email.",
      })
    }

    setResending(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Verifique seu email
          </CardTitle>
          <CardDescription className="text-center">
            Digite o código de 6 dígitos enviado para<br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de verificação</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="000000"
                required
                disabled={loading}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground text-center">
                O código expira em 15 minutos
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar Email"
              )}
            </Button>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Não recebeu o código?
              </p>
              <Button
                type="button"
                variant="link"
                onClick={handleResend}
                disabled={resending}
                className="text-primary"
              >
                {resending ? "Reenviando..." : "Reenviar código"}
              </Button>
            </div>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}