/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { getMonthlyStats, getTransactions, getCategories } from "@/actions/personal-finance"
import { TransactionList } from "./transaction-list"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { CategoryBreakdown } from "./category-breakdown"

export function PersonalDashboard() {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [stats, setStats] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    loadData()
  }, [month, year])

  async function loadData() {
    setLoading(true)

    const [statsResult, transactionsResult, categoriesResult] = await Promise.all([
      getMonthlyStats(month, year),
      getTransactions(month, year),
      getCategories(),
    ])

    if (statsResult.data) {
      setStats(statsResult.data)
    }

    if (transactionsResult.data) {
      setTransactions(transactionsResult.data)
    }

    if (categoriesResult.data) {
      setCategories(categoriesResult.data)
    }

    setLoading(false)
  }

  function changeMonth(delta: number) {
    let newMonth = month + delta
    let newYear = year

    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }

    setMonth(newMonth)
    setYear(newYear)
  }

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Finanças Pessoais</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Finanças Pessoais</h2>
          <p className="text-muted-foreground">
            Controle suas receitas e despesas
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <Button variant="outline" onClick={() => changeMonth(-1)}>
          ←
        </Button>
        <span className="text-lg font-semibold min-w-[200px] text-center">
          {monthNames[month - 1]} de {year}
        </span>
        <Button variant="outline" onClick={() => changeMonth(1)}>
          →
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalIncome || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalExpense || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (stats?.balance || 0) >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatCurrency(stats?.balance || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <CategoryBreakdown data={stats.categoryBreakdown} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList
            transactions={transactions}
            categories={categories}
            onUpdate={loadData}
          />
        </CardContent>
      </Card>

      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        categories={categories}
        onSuccess={loadData}
        defaultDate={new Date(year, month - 1, new Date().getDate())}
      />
    </div>
  )
}