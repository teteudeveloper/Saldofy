"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updateEmployee } from "@/actions/business-finance"
import { Loader2 } from "lucide-react"

interface EditEmployeeDialogProps {
  employee: any
  onClose: () => void
  onSuccess: () => void
}

export function EditEmployeeDialog({
  employee,
  onClose,
  onSuccess,
}: EditEmployeeDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("companyId", employee.companyId)

    const result = await updateEmployee(employee.id, formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar funcionário",
        description: result.error,
      })
      setLoading(false)
      return
    }

    toast({
      title: "Funcionário atualizado",
      description: "As alterações foram salvas com sucesso.",
    })

    onSuccess()
    setLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
            <DialogDescription>
              Altere os dados do funcionário
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                defaultValue={employee.name}
                placeholder="Ex: João Silva"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={employee.email || ""}
                placeholder="joao@exemplo.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo (opcional)</Label>
              <Input
                id="position"
                name="position"
                defaultValue={employee.position || ""}
                placeholder="Ex: Desenvolvedor"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyCost">Custo mensal (opcional)</Label>
              <Input
                id="monthlyCost"
                name="monthlyCost"
                type="number"
                step="0.01"
                defaultValue={employee.monthlyCost ?? 0}
                placeholder="0,00"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Ex: salário + encargos (valor mensal).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
