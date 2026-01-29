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
import { createBusinessExpense } from "@/actions/business-finance"
import { Loader2 } from "lucide-react"

interface AddExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  employees: any[]
  categories: any[]
  onSuccess: () => void
  defaultDate?: Date
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  companyId,
  employees,
  categories,
  onSuccess,
  defaultDate,
}: AddExpenseDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categoryId, setCategoryId] = useState<string>("")
  const [employeeId, setEmployeeId] = useState<string>("")
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "EXPENSE"),
    [categories]
  )

  useEffect(() => {
    if (!open) return
    const stillValid = expenseCategories.some((c) => c.id === categoryId)
    if (!stillValid) setCategoryId(expenseCategories[0]?.id ?? "")
  }, [open, expenseCategories, categoryId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("companyId", companyId)
    formData.set("categoryId", categoryId)
    formData.set("employeeId", employeeId)

    if (!categoryId) {
      toast({
        variant: "destructive",
        title: "Categoria obrigatória",
        description: "Selecione uma categoria para continuar.",
      })
      setLoading(false)
      return
    }

    const result = await createBusinessExpense(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar despesa",
        description: result.error,
      })
      setLoading(false)
      return
    }

    toast({
      title: "Despesa criada",
      description: "A despesa foi adicionada com sucesso.",
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
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Despesa</DialogTitle>
            <DialogDescription>
              Registre uma despesa da empresa (ex: água, luz, aluguel, salários)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ex: Conta de luz"
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
                  {expenseCategories.map((category) => (
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
              <Label htmlFor="employeeId">Funcionário (opcional)</Label>
              <Select
                value={employeeId}
                onValueChange={(value: string) => setEmployeeId(value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funcionário (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
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
                defaultValue={
                  defaultDate
                    ? formatDateForInput(defaultDate)
                    : formatDateForInput(new Date())
                }
                required
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
