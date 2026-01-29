"use client"

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, TrendingDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AddExpenseDialog } from "./add-expense-dialog"
import {
  deleteBusinessExpense,
  getBusinessCategories,
  getBusinessExpenses,
  getEmployeesByCompany,
} from "@/actions/business-finance"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ExpensesTabProps {
  company: any
  stats: any
  month: number
  year: number
  onUpdate: () => void
}

export function ExpensesTab({
  company,
  stats,
  month,
  year,
  onUpdate,
}: ExpensesTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadAll()
  }, [company.id, month, year])

  async function loadAll() {
    setLoading(true)

    const [expensesResult, categoriesResult, employeesResult] =
      await Promise.all([
        getBusinessExpenses(company.id, month, year),
        getBusinessCategories("EXPENSE"),
        getEmployeesByCompany(company.id),
      ])

    if (expensesResult.error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar despesas",
        description: expensesResult.error,
      })
      setExpenses([])
    } else if (expensesResult.data) {
      setExpenses(expensesResult.data)
    }

    if (categoriesResult.error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar categorias",
        description: categoriesResult.error,
      })
      setCategories([])
    } else if (categoriesResult.data) {
      setCategories(categoriesResult.data)
    }

    if (employeesResult.error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar funcionários",
        description: employeesResult.error,
      })
      setEmployees([])
    } else if (employeesResult.data) {
      setEmployees(employeesResult.data)
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    const result = await deleteBusinessExpense(id)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar despesa",
        description: result.error,
      })
    } else {
      toast({
        title: "Despesa deletada",
        description: "A despesa foi removida com sucesso.",
      })
      await loadAll()
      onUpdate()
    }

    setDeleting(false)
    setDeletingId(null)
  }

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0),
    [expenses]
  )

  const expensesByCategory = useMemo(() => {
    const map = new Map<
      string,
      { category: any; total: number; count: number }
    >()

    for (const exp of expenses) {
      const category = exp.category
      const key = category?.id ?? "unknown"
      const existing = map.get(key)
      if (existing) {
        existing.total += exp.amount
        existing.count += 1
      } else {
        map.set(key, { category, total: exp.amount, count: 1 })
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [expenses])

  const maxCategoryTotal = useMemo(() => {
    if (expensesByCategory.length === 0) return 0
    return Math.max(...expensesByCategory.map((c) => c.total))
  }, [expensesByCategory])

  const expensesByEmployee = stats?.expensesByEmployee ?? []
  const maxEmployeeExpense =
    expensesByEmployee.length > 0
      ? Math.max(...expensesByEmployee.map((e: any) => e.total))
      : 0
  const employeeFixedCosts = stats?.totalEmployeeCosts ?? 0

  const formatDate = (date: Date) => new Date(date).toLocaleDateString("pt-BR")

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Despesas</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total:{" "}
              <span className="font-semibold text-red-600">
                {formatCurrency(stats?.totalExpenses ?? totalExpenses)}
              </span>
            </p>
            {employeeFixedCosts > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Custos fixos de funcionários (mensal):{" "}
                <span className="font-medium">
                  {formatCurrency(employeeFixedCosts)}
                </span>
              </p>
            )}
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Despesa
          </Button>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma despesa registrada neste período.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>{formatDate(expense.date)}</span>
                        {expense.category && (
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: expense.category.color,
                              }}
                            />
                            <span>{expense.category.name}</span>
                          </span>
                        )}
                        {expense.employee && (
                          <span>Funcionário: {expense.employee.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-red-600">
                      {formatCurrency(expense.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {expensesByCategory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma despesa por categoria neste período.
                </p>
              </div>
            ) : (
              expensesByCategory.map((item) => {
                const percentage =
                  maxCategoryTotal > 0 ? (item.total / maxCategoryTotal) * 100 : 0
                return (
                  <div key={item.category?.id ?? "unknown"} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.category?.color ?? "#64748b" }}
                        />
                        <span className="font-medium">
                          {item.category?.name ?? "Sem categoria"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({item.count})
                        </span>
                      </div>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Funcionário</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total:{" "}
              <span className="font-semibold text-red-600">
                {formatCurrency(stats?.totalExpenses ?? totalExpenses)}
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {!stats || !expensesByEmployee || expensesByEmployee.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma despesa vinculada a funcionário neste período.
                </p>
              </div>
            ) : (
              expensesByEmployee.map((item: any) => {
                const percentage =
                  maxEmployeeExpense > 0 ? (item.total / maxEmployeeExpense) * 100 : 0
                return (
                  <div key={item.employee.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {item.employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{item.employee.name}</p>
                          {item.employee.position && (
                            <p className="text-xs text-muted-foreground">
                              {item.employee.position}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-red-600">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <AddExpenseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        companyId={company.id}
        employees={employees}
        categories={categories}
        defaultDate={
          new Date(
            year,
            month - 1,
            Math.min(new Date().getDate(), new Date(year, month, 0).getDate())
          )
        }
        onSuccess={async () => {
          await loadAll()
          onUpdate()
        }}
      />

      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar despesa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar esta despesa? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingId(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={deleting}
            >
              {deleting ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
