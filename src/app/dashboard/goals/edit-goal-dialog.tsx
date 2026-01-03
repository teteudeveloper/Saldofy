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
import { updateGoal } from "@/actions/personal-finance"
import { Loader2 } from "lucide-react"

interface EditGoalDialogProps {
  goal: any
  onClose: () => void
  onSuccess: () => void
}

export function EditGoalDialog({
  goal,
  onClose,
  onSuccess,
}: EditGoalDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateGoal(goal.id, formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar meta",
        description: result.error,
      })
      setLoading(false)
      return
    }

    toast({
      title: "Meta atualizada",
      description: "As alterações foram salvas com sucesso.",
    })

    onSuccess()
    setLoading(false)
  }

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ""
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Meta</DialogTitle>
            <DialogDescription>
              Altere os dados da meta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da meta</Label>
              <Input
                id="name"
                name="name"
                defaultValue={goal.name}
                placeholder="Ex: Viagem para Europa"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Valor alvo</Label>
              <Input
                id="targetAmount"
                name="targetAmount"
                type="number"
                step="0.01"
                defaultValue={goal.targetAmount}
                placeholder="0,00"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">Valor atual</Label>
              <Input
                id="currentAmount"
                name="currentAmount"
                type="number"
                step="0.01"
                defaultValue={goal.currentAmount}
                placeholder="0,00"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo (opcional)</Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={formatDateForInput(goal.deadline)}
                disabled={loading}
              />
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