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
import { createTransaction } from "@/actions/personal-finance"
import { Loader2 } from "lucide-react"
import { InlineDatePicker } from "@/components/ui/inline-date-picker"

const formatDateForInput = (date: Date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isTransactionType(value: string): value is "INCOME" | "EXPENSE" {
  return value === "INCOME" || value === "EXPENSE"
}

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: any[]
  onSuccess: () => void
  defaultDate?: Date
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
  defaultDate,
}: AddTransactionDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [categoryId, setCategoryId] = useState<string>("")
  const [date, setDate] = useState<string>("")

  const filteredCategories = useMemo(
    () => categories.filter((cat) => cat.type === type),
    [categories, type]
  )

  useEffect(() => {
    if (!open) return
    setDate(formatDateForInput(defaultDate ?? new Date()))

    // Only pick a default type when opening the dialog; don't override the user's choice.
    setType((currentType) => {
      const hasCurrentType = categories.some((c) => c.type === currentType)
      if (hasCurrentType) return currentType
      const hasExpense = categories.some((c) => c.type === "EXPENSE")
      const hasIncome = categories.some((c) => c.type === "INCOME")
      if (hasExpense) return "EXPENSE"
      if (hasIncome) return "INCOME"
      return currentType
    })
  }, [open, categories, defaultDate])

  useEffect(() => {
    if (!open) return
    const stillValid = filteredCategories.some((c) => c.id === categoryId)
    if (!stillValid) setCategoryId(filteredCategories[0]?.id ?? "")
  }, [open, filteredCategories, categoryId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("type", type)
    formData.set("categoryId", categoryId)
    formData.set("date", date || formatDateForInput(defaultDate ?? new Date()))

    if (!categoryId) {
      toast({
        variant: "destructive",
        title: "Categoria obrigatória",
        description: "Selecione uma categoria para continuar.",
      })
      setLoading(false)
      return
    }

    const result = await createTransaction(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar transação",
        description: result.error,
      })
      setLoading(false)
      return
    }

    toast({
      title: "Transação criada",
      description: "A transação foi adicionada com sucesso.",
    })

    if (result.budgetAlert?.crossed100) {
      toast({
        variant: "destructive",
        title: "Limite mensal estourado",
        description: `Você ultrapassou o limite mensal de ${result.budgetAlert.categoryName}.`,
      })
    } else if (result.budgetAlert?.crossed80) {
      toast({
        title: "Atenção: 80% do limite",
        description: `Você atingiu 80% do limite mensal de ${result.budgetAlert.categoryName}.`,
      })
    }

    onSuccess()
    onOpenChange(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
            <DialogDescription>
              Adicione uma nova receita ou despesa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(value: string) => {
                  if (isTransactionType(value)) setType(value)
                }}
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
                placeholder="Ex: Supermercado"
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
              {filteredCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Crie uma categoria para este tipo antes de adicionar uma transação.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <InlineDatePicker
                id="date"
                value={date}
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
            <Button type="submit" disabled={loading || filteredCategories.length === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Transação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
