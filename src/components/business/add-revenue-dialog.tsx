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
import { createRevenue } from "@/actions/business-finance"
import { Loader2 } from "lucide-react"
import { InlineDatePicker } from "@/components/ui/inline-date-picker"

interface AddRevenueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  defaultDate?: Date
  onSuccess: () => void
}

export function AddRevenueDialog({
  open,
  onOpenChange,
  companyId,
  defaultDate,
  onSuccess,
}: AddRevenueDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<string>("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("companyId", companyId)
    formData.set("date", date || formatDateForInput(defaultDate ?? new Date()))

    const result = await createRevenue(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar receita",
        description: result.error,
      })
      setLoading(false)
      return
    }

    toast({
      title: "Receita criada",
      description: "A receita foi adicionada com sucesso.",
    })

    onSuccess()
    onOpenChange(false)
    setLoading(false)
  }

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Receita</DialogTitle>
            <DialogDescription>
              Registre uma nova receita da empresa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ex: Venda de serviços"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <InlineDatePicker
                id="date"
                value={date || formatDateForInput(defaultDate ?? new Date())}
                onChange={setDate}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
