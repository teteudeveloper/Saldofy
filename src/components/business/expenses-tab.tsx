"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ExpensesTabProps {
  company: any
  stats: any
  month: number
  year: number
  onUpdate: () => void
}

export function ExpensesTab({ stats }: ExpensesTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (!stats || !stats.expensesByEmployee || stats.expensesByEmployee.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Funcionário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma despesa registrada por funcionário neste período.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxExpense = Math.max(...stats.expensesByEmployee.map((e: any) => e.total))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Funcionário</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Total: <span className="font-semibold text-red-600">{formatCurrency(stats.totalExpenses)}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.expensesByEmployee.map((item: any, index: number) => {
          const percentage = (item.total / maxExpense) * 100

          return (
            <div key={index} className="space-y-2">
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
        })}
      </CardContent>
    </Card>
  )
}