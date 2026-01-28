import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, Building2, TrendingUp, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-semibold tracking-tight">
              Saldofy
            </span>
          </Link>

          <nav className="flex items-center gap-2 b">
            <Link href="/auth/signin">
              <Button variant="ghost" className="h-9 px-4">
                Entrar
              </Button>
            </Link>

            <Link href="/auth/signup">
              <Button variant="ghost" className="h-9 px-4">
                Cadastre-se
              </Button>
            </Link>
          </nav>

        </div>
      </header>

      <section className="container mx-auto px-4 py-24 text-center">
        <h1
          className="
            text-5xl md:text-6xl font-bold mb-6
            bg-gradient-to-r from-indigo-600 to-purple-600
            bg-clip-text text-transparent
            leading-[1.15] pb-1
          "
        >
          Gestão Financeira Inteligente
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Controle suas finanças pessoais e empresariais em um só lugar.
          Simples, eficiente e poderoso.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Começar Agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/auth/signin">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Fazer Login
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="p-6 rounded-xl bg-white shadow-sm border">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <Home className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Finanças Pessoais
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Controle receitas, despesas e metas financeiras pessoais.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white shadow-sm border">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Gestão Empresarial
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gerencie empresas, funcionários, receitas e impostos.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white shadow-sm border">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Relatórios Mensais
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Receba relatórios PDF detalhados por email mensalmente.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white shadow-sm border">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Seguro e Confiável
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seus dados protegidos com criptografia de ponta a ponta.
            </p>
          </div>

        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto p-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg mb-8 text-indigo-100">
            Crie sua conta gratuita e transforme a gestão das suas finanças.
          </p>

          <Link href="/auth/signup">
            <Button size="lg" variant="secondary">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Saldofy. Todos os direitos reservados.
          </p>
        </div>
      </footer>

    </div>
  )
}
