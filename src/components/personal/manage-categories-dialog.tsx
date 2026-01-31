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
import { createCategory, deleteCategory, updateCategory } from "@/actions/personal-finance"
import { Loader2, Pencil, Trash2 } from "lucide-react"

type View = "list" | "form" | "confirmDelete"

interface ManageCategoriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: any[]
  onSuccess: () => void
}

export function ManageCategoriesDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: ManageCategoriesDialogProps) {
  const { toast } = useToast()

  const [view, setView] = useState<View>("list")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<any | null>(null)

  const [name, setName] = useState("")
  const [color, setColor] = useState("#6366f1")
  const [monthlyLimit, setMonthlyLimit] = useState<string>("")

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name))
  }, [categories])

  const incomeOrder = useMemo(() => {
    const base = ["Salário", "Freelance", "Investimentos", "Outro"]
    return new Map(base.map((name, index) => [name.toLowerCase(), index]))
  }, [])

  const incomeCategories = useMemo(() => {
    return sortedCategories
      .filter((c) => c.type === "INCOME")
      .sort((a, b) => {
        const aKey = String(a.name ?? "").toLowerCase()
        const bKey = String(b.name ?? "").toLowerCase()
        const aRank = incomeOrder.has(aKey) ? (incomeOrder.get(aKey) as number) : 999
        const bRank = incomeOrder.has(bKey) ? (incomeOrder.get(bKey) as number) : 999
        if (aRank !== bRank) return aRank - bRank
        return String(a.name ?? "").localeCompare(String(b.name ?? ""))
      })
  }, [sortedCategories, incomeOrder])

  const expenseCategories = useMemo(() => {
    return sortedCategories.filter((c) => c.type === "EXPENSE")
  }, [sortedCategories])

  useEffect(() => {
    if (!open) {
      setView("list")
      setSaving(false)
      setDeleting(false)
      setEditingCategory(null)
      setDeleteCandidate(null)
    }
  }, [open])

  function startCreate() {
    setEditingCategory(null)
    setName("")
    setColor("#6366f1")
    setMonthlyLimit("")
    setView("form")
  }

  function startEdit(category: any) {
    if (category.type !== "EXPENSE") {
      toast({
        title: "Categorias de receita são fixas",
        description: "Você só pode criar/editar categorias de despesa.",
      })
      return
    }
    setEditingCategory(category)
    setName(category.name ?? "")
    setColor(category.color ?? "#6366f1")
    setMonthlyLimit(
      category.type === "EXPENSE" && category.monthlyLimit != null
        ? String(category.monthlyLimit)
        : ""
    )
    setView("form")
  }

  function startDelete(category: any) {
    if (category.type !== "EXPENSE") {
      toast({
        title: "Categorias de receita são fixas",
        description: "Você só pode deletar categorias de despesa.",
      })
      return
    }
    setDeleteCandidate(category)
    setView("confirmDelete")
  }

  async function handleSave() {
    setSaving(true)

    const formData = new FormData()
    formData.set("name", name.trim())
    formData.set("color", color)
    formData.set("type", "EXPENSE")
    formData.set("monthlyLimit", monthlyLimit)

    const result = editingCategory
      ? await updateCategory(editingCategory.id, formData)
      : await createCategory(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: editingCategory ? "Erro ao atualizar categoria" : "Erro ao criar categoria",
        description: result.error,
      })
      setSaving(false)
      return
    }

    toast({
      title: editingCategory ? "Categoria atualizada" : "Categoria criada",
      description: "As alterações foram salvas com sucesso.",
    })

    onSuccess()
    setSaving(false)
    setView("list")
  }

  async function handleDelete() {
    if (!deleteCandidate) return

    setDeleting(true)
    const result = await deleteCategory(deleteCandidate.id)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar categoria",
        description: result.error,
      })
      setDeleting(false)
      return
    }

    toast({
      title: "Categoria deletada",
      description: "A categoria foi removida com sucesso.",
    })

    onSuccess()
    setDeleting(false)
    setDeleteCandidate(null)
    setView("list")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const canSave = name.trim().length > 0 && monthlyLimit.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Categorias</DialogTitle>
          <DialogDescription>
            Crie categorias e defina um limite mensal para despesas.
          </DialogDescription>
        </DialogHeader>

        {view === "list" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {sortedCategories.length} categoria(s)
              </div>
              <Button onClick={startCreate}>Nova Categoria</Button>
            </div>

            {sortedCategories.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Nenhuma categoria cadastrada.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Receitas</div>
                  {incomeCategories.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Nenhuma categoria de receita.
                    </div>
                  ) : (
                    incomeCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <div className="font-medium truncate">{category.name}</div>
                            <span className="px-2 py-0.5 text-xs rounded border border-green-200 text-green-700 bg-green-50">
                              Receita
                            </span>
                            <span className="px-2 py-0.5 text-xs rounded border border-gray-200 text-gray-600 bg-gray-50">
                              Fixa
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold">Despesas</div>
                  {expenseCategories.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Nenhuma categoria de despesa. Crie uma para definir limites.
                    </div>
                  ) : (
                    expenseCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <div className="font-medium truncate">{category.name}</div>
                            <span className="px-2 py-0.5 text-xs rounded border border-red-200 text-red-700 bg-red-50">
                              Despesa
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            Limite mensal:{" "}
                            {category.monthlyLimit != null
                              ? formatCurrency(category.monthlyLimit as number)
                              : "—"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startDelete(category)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {view === "form" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" onClick={() => setView("list")} disabled={saving}>
                ← Voltar
              </Button>
              <div className="text-sm text-muted-foreground">
                {editingCategory ? "Editar categoria" : "Nova categoria"}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="categoryName">Nome</Label>
                <Input
                  id="categoryName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Alimentação"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Input value="Despesa" disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryColor">Cor</Label>
                <Input
                  id="categoryColor"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={saving}
                  className="h-10 p-1"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="monthlyLimit">
                  Limite mensal (apenas para despesas)
                </Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setView("list")}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving || !canSave}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {view === "confirmDelete" && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Tem certeza que deseja deletar a categoria{" "}
              <span className="font-medium text-foreground">
                {deleteCandidate?.name}
              </span>
              ?
              <div className="mt-2">
                Se ela estiver vinculada a transações, a exclusão pode falhar.
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteCandidate(null)
                  setView("list")
                }}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deletando...
                  </>
                ) : (
                  "Deletar"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
