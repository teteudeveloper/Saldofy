"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ManageCategoriesDialog } from "./manage-categories-dialog"

interface CategoryBudgetsCardProps {
  categories: any[]
  categoryBreakdown?: any[]
  month: number | null
  year: number | null
  onRefresh: () => void
}

export function CategoryBudgetsCard({
  categories,
  categoryBreakdown,
  month,
  year,
  onRefresh,
}: CategoryBudgetsCardProps) {
  const [manageOpen, setManageOpen] = useState(false)

  const expenseCategories = useMemo(() => {
    return categories
      .filter((c) => c.type === "EXPENSE")
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories])

  const spentByCategoryId = useMemo(() => {
    const map = new Map<string, number>()
    ;(categoryBreakdown ?? [])
      .filter((item: any) => item?.category?.type === "EXPENSE")
      .forEach((item: any) => {
        const id = item?.category?.id
        if (!id) return
        map.set(id, item.total ?? 0)
      })
    return map
  }, [categoryBreakdown])

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div className="min-w-0">
            <CardTitle className="text-lg">Orçamento por Categoria</CardTitle>
            <div className="text-sm text-muted-foreground">
              {month && year ? `${monthNames[month - 1]} de ${year}` : "Mês atual"}
            </div>
          </div>
          <Button variant="outline" onClick={() => setManageOpen(true)}>
            Gerenciar
          </Button>
        </CardHeader>
        <CardContent>
          {expenseCategories.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Crie categorias de despesa para definir limites mensais.
            </div>
          ) : (
            <div className="space-y-4">
              {expenseCategories.map((category) => {
                const spent = spentByCategoryId.get(category.id) ?? 0
                const limit = category.monthlyLimit ?? 0
                const hasLimit = typeof limit === "number" && limit > 0
                const percentage = hasLimit ? spent / limit : 0
                const clampedPercent = Math.max(0, Math.min(percentage, 1)) * 100
                const remaining = hasLimit ? Math.max(limit - spent, 0) : null

                const status =
                  !hasLimit
                    ? "nolimit"
                    : percentage >= 1
                      ? "over"
                      : percentage >= 0.8
                        ? "near"
                        : "ok"

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div className="font-medium truncate">{category.name}</div>
                          {status === "near" && (
                            <span className="px-2 py-0.5 text-xs rounded border border-amber-200 text-amber-700 bg-amber-50">
                              80%
                            </span>
                          )}
                          {status === "over" && (
                            <span className="px-2 py-0.5 text-xs rounded border border-red-200 text-red-700 bg-red-50">
                              Estourado
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {hasLimit ? (
                            <>
                              Pode gastar:{" "}
                              <span
                                className={
                                  status === "over" ? "text-red-600 font-medium" : "text-foreground"
                                }
                              >
                                {formatCurrency(remaining ?? 0)}
                              </span>
                            </>
                          ) : (
                            "Defina um limite mensal para receber alertas."
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold">
                          {formatCurrency(spent)}
                          {hasLimit ? ` / ${formatCurrency(limit)}` : ""}
                        </div>
                        {hasLimit && (
                          <div
                            className={`text-xs ${
                              status === "over"
                                ? "text-red-600"
                                : status === "near"
                                  ? "text-amber-700"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {(percentage * 100).toFixed(0)}% do limite
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${clampedPercent}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ManageCategoriesDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        categories={categories}
        onSuccess={() => {
          onRefresh()
        }}
      />
    </>
  )
}
