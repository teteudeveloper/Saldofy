/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Building2, Users, DollarSign, AlertCircle } from "lucide-react"
import { getCompanies, getBusinessStats } from "@/actions/business-finance"
import { AddCompanyDialog } from "./add-company-dialog"
import { CompanyTabs } from "./company-tabs"

export function BusinessDashboard() {
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompanyId) {
      loadStats()
    }
  }, [selectedCompanyId, month, year])

  async function loadCompanies() {
    setLoading(true)
    const result = await getCompanies()

    if (result.data) {
      setCompanies(result.data)
      if (result.data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(result.data[0].id)
      }
    }

    setLoading(false)
  }

  async function loadStats() {
    if (!selectedCompanyId) return

    const result = await getBusinessStats(selectedCompanyId, month, year)

    if (result.data) {
      setStats(result.data)
    }
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

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Finanças Empresariais</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-64"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Finanças Empresariais</h2>
            <p className="text-muted-foreground">
              Gerencie suas empresas e finanças corporativas
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma empresa cadastrada
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando sua primeira empresa para gerenciar as finanças
              corporativas.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Empresa
            </Button>
          </CardContent>
        </Card>

        <AddCompanyDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={loadCompanies}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Finanças Empresariais</h2>
          <p className="text-muted-foreground">
            Gerencie suas empresas e finanças corporativas
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Selecione uma empresa" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.employeeCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Impostos Pendentes
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.taxesPending)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedCompany && (
        <CompanyTabs
          company={selectedCompany}
          stats={stats}
          month={month}
          year={year}
          onUpdate={() => {
            loadCompanies()
            loadStats()
          }}
        />
      )}

      <AddCompanyDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={loadCompanies}
      />
    </div>
  )
}