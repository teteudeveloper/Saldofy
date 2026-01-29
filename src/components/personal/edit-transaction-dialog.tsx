"use client"

import { useEffect, useMemo, useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { updateTransaction } from "@/actions/personal-finance"
import { Loader2 } from "lucide-react"

interface EditTransactionDialogProps {
  transaction: any
  categories: any[]
  onClose: () => void
  onSuccess: () => void
}

export function EditTransactionDialog({
  transaction,
  categories,
  onClose,
  onSuccess,
}: EditTransactionDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<"INCOME" | "EXPENSE">(transaction.type)
  const [categoryId, setCategoryId] = useState<string>(transaction.categoryId)

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.type === type),
    [categories, type]
  )

  useEffect(() => {
    const stillValid = filteredCategories.some((c) => c.id === categoryId)
    if (!stillValid) setCategoryId(filteredCategories[0]?.id ?? "")
  }, [type, filteredCategories, categoryId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("type", type)
    formData.set("categoryId", categoryId)

    if (!categoryId) {
      toast({
        variant: "destructive",
        title: "Categoria obrigatória",
        description: "Selecione uma categoria para continuar.",
      })
      setLoading(false)
      return
    }

    const result = await updateTransaction(transaction.id, formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar transação",
        description: result.error,
      })
      setLoading(false)
      return
    }

    toast({
      title: "Transação atualizada",
      description: "As alterações foram salvas com sucesso.",
    })

    onSuccess()
    setLoading(false)
  }

  const formatDateForInput = (date: Date) => {
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
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>
              Altere os dados da transação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(value: string) => setType(value as "INCOME" | "EXPENSE")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Receita</SelectItem>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                defaultValue={transaction.description}
                placeholder="Ex: Supermercado"
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
                defaultValue={transaction.amount}
                placeholder="0,00"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Categoria</Label>
              <Select
                value={categoryId}
                onValueChange={(value: string) => setCategoryId(value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={formatDateForInput(transaction.date)}
                required
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
