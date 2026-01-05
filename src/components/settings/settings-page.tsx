"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { deleteAccount } from "@/actions/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SettingsPageProps {
  user: {
    id: string
    email: string
    name: string
  }
}

export function SettingsPage({ user }: SettingsPageProps) {
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    setDeleting(true)
    const result = await deleteAccount()

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar conta",
        description: result.error,
      })
      setDeleting(false)
      return
    }

    toast({
      title: "Conta deletada",
      description: "Sua conta foi deletada com sucesso.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Suas informações pessoais e dados de login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={user.name} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Mensais</CardTitle>
          <CardDescription>
            Configure o envio automático de relatórios por email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Relatório de Finanças Pessoais</p>
              <p className="text-sm text-muted-foreground">
                Receba um PDF mensal com suas receitas e despesas
              </p>
            </div>
            <Button variant="outline" disabled>
              Em breve
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Relatório de Finanças Empresariais</p>
              <p className="text-sm text-muted-foreground">
                Receba um PDF mensal com os dados de suas empresas
              </p>
            </div>
            <Button variant="outline" disabled>
              Em breve
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Deletar Conta</p>
              <p className="text-sm text-muted-foreground">
                Remova permanentemente sua conta e todos os dados associados
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Deletar Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar conta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar sua conta? Esta ação não pode ser
              desfeita. Todos os seus dados serão permanentemente removidos,
              incluindo:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todas as transações</li>
                <li>Todas as metas financeiras</li>
                <li>Todas as empresas e funcionários</li>
                <li>Todas as receitas e impostos</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deletando..." : "Sim, deletar minha conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}