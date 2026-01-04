"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmployeesTab } from "./employees-tab"
import { RevenuesTab } from "./revenues-tab"
import { TaxesTab } from "./taxes-tab"
import { ExpensesTab } from "./expenses-tab"

interface CompanyTabsProps {
  company: any
  stats: any
  month: number
  year: number
  onUpdate: () => void
}

export function CompanyTabs({
  company,
  stats,
  month,
  year,
  onUpdate,
}: CompanyTabsProps) {
  return (
    <Tabs defaultValue="employees" className="space-y-4">
      <TabsList>
        <TabsTrigger value="employees">Funcionários</TabsTrigger>
        <TabsTrigger value="revenues">Receitas</TabsTrigger>
        <TabsTrigger value="expenses">Despesas</TabsTrigger>
        <TabsTrigger value="taxes">Impostos</TabsTrigger>
      </TabsList>

      <TabsContent value="employees">
        <EmployeesTab company={company} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="revenues">
        <RevenuesTab
          company={company}
          month={month}
          year={year}
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="expenses">
        <ExpensesTab
          company={company}
          stats={stats}
          month={month}
          year={year}
          onUpdate={onUpdate}
        />
      </TabsContent>

      <TabsContent value="taxes">
        <TaxesTab
          company={company}
          month={month}
          year={year}
          onUpdate={onUpdate}
        />
      </TabsContent>
    </Tabs>
  )
}