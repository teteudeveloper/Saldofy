/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Building2,
  Users,
  DollarSign,
  AlertCircle,
} from "lucide-react"

import {
  getCompanies,
  getBusinessStats,
  getUserCreationDateBusiness,
} from "@/actions/business-finance"

import { AddCompanyDialog } from "./add-company-dialog"
import { CompanyTabs } from "./company-tabs"

interface Company {
  id: string
  name: string
}

interface BusinessStats {
  totalRevenue: number
  totalExpenses: number
  employeeCount: number
  taxesPending: number
}

export function BusinessDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [stats, setStats] = useState<BusinessStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)

  const [month, setMonth] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [creationDate, setCreationDate] = useState<Date | null>(null)

  useEffect(() => {
    initializeDate()
    loadCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompanyId && month !== null && year !== null) {
      loadStats(selectedCompanyId, month, year)
    }
  }, [selectedCompanyId, month, year])

  async function initializeDate() {
    const result = await getUserCreationDateBusiness()

    if (result.data) {
      const date = new Date(result.data)
      setCreationDate(date)
      setMonth(date.getMonth() + 1)
      setYear(date.getFullYear())
      return
    }

    const now = new Date()
    setMonth(now.getMonth() + 1)
    setYear(now.getFullYear())
  }

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

  async function loadStats(
    companyId: string,
    month: number,
    year: number
  ) {
    const result = await getBusinessStats(companyId, month, year)

    if (result.data) {
      setStats(result.data)
    }
  }

  function changeMonth(delta: number) {
    if (month === null || year === null) return

    let newMonth = month + delta
    let newYear = year

    if (newMonth > 12) {
      newMonth = 1
      newYear++
    } else if (newMonth < 1) {
      newMonth = 12
      newYear--
    }

    if (creationDate) {
      const createdDate = new Date(
        creationDate.getFullYear(),
        creationDate.getMonth()
      )
      const selectedDate = new Date(newYear, newMonth - 1)

      if (selectedDate < createdDate) return
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

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const selectedCompany = companies.find(
    (company) => company.id === selectedCompanyId
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Finanças Empresariais</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Finanças Empresariais</h2>
          <p className="text-muted-foreground">
            Gerencie suas empresas e finanças corporativas
          </p>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold">Finanças Empresariais</h2>
          <p className="text-muted-foreground">
            Gerencie suas empresas e finanças corporativas
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <Select
        value={selectedCompanyId}
        onValueChange={setSelectedCompanyId}
      >
        <SelectTrigger className="w-full sm:w-[300px]">
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

      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => changeMonth(-1)}
          disabled={
            !!creationDate &&
            month === creationDate.getMonth() + 1 &&
            year === creationDate.getFullYear()
          }
        >
          ←
        </Button>

        <span className="text-base sm:text-lg font-semibold min-w-[140px] sm:min-w-[200px] text-center">
          {month !== null && year !== null
            ? `${monthNames[month - 1]} de ${year}`
            : "Carregando..."}
        </span>

        <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
          →
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Receitas"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign className="h-4 w-4 text-green-600" />}
            color="text-green-600"
          />
          <StatCard
            title="Despesas"
            value={formatCurrency(stats.totalExpenses)}
            icon={<DollarSign className="h-4 w-4 text-red-600" />}
            color="text-red-600"
          />
          <StatCard
            title="Funcionários"
            value={stats.employeeCount}
            icon={<Users className="h-4 w-4 text-blue-600" />}
            color="text-blue-600"
          />
          <StatCard
            title="Impostos Pendentes"
            value={formatCurrency(stats.taxesPending)}
            icon={<AlertCircle className="h-4 w-4 text-orange-600" />}
            color="text-orange-600"
          />
        </div>
      )}

      {selectedCompany && month !== null && year !== null && (
  <CompanyTabs
    company={selectedCompany}
    stats={stats}
    month={month}
    year={year}
    onUpdate={() => {
      loadCompanies()
      loadStats(selectedCompany.id, month, year)
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

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
