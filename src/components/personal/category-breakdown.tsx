"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryBreakdownProps {
  data: {
    category: {
      name: string
      color: string
      type: string
    }
    total: number
    percentage: number
  }[]
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const incomeData = data.filter((item) => item.category.type === "INCOME")
  const expenseData = data.filter((item) => item.category.type === "EXPENSE")

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {incomeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomeData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <span className="font-medium">{item.category.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.category.color,
                      }}
                    />
                  </div>
                  <span className="ml-4 text-sm font-semibold">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {expenseData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <span className="font-medium">{item.category.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.category.color,
                      }}
                    />
                  </div>
                  <span className="ml-4 text-sm font-semibold">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}