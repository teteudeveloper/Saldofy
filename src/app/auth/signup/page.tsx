"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { signUp } from "@/actions/auth"
import { Loader2 } from "lucide-react"

type TenantType = "PERSONAL" | "BUSINESS"

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"type" | "form">("type")
  const [selectedType, setSelectedType] = useState<TenantType | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("tenantType", selectedType!)
    const result = await signUp(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: result.error,
      })
      setLoading(false)
      return
    }

    toast({
      title: "Conta criada com sucesso!",
      description: "Você será redirecionado agora.",
    })

    const redirectPath = selectedType === "PERSONAL" ? "/dashboard/personal" : "/dashboard/business"
    router.push(redirectPath)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Criar conta
          </CardTitle>
          <CardDescription className="text-center">
            Comece a gerenciar suas finanças agora
          </CardDescription>
        </CardHeader>
        
        {step === "type" ? (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">Que tipo de conta você deseja criar?</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedType("PERSONAL")
                  setStep("form")
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
              >
                <div className="font-semibold text-gray-900">Finanças Pessoais</div>
                <div className="text-sm text-gray-600">Gerencie suas despesas e receitas pessoais</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedType("BUSINESS")
                  setStep("form")
                }}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
              >
                <div className="font-semibold text-gray-900">Finanças Empresariais</div>
                <div className="text-sm text-gray-600">Gerencie sua empresa e finanças corporativas</div>
              </button>
            </div>
          </CardContent>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 pb-2">
                  <button
                    type="button"
                    onClick={() => setStep("type")}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    ← Voltar
                  </button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Sua senha"
                    required
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-gray-600">
            Já tem conta?{" "}
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}