/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, TrendingUp } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { useToast } from "@/components/ui/use-toast"
import { AddRevenueDialog } from "./add-revenue-dialog"
import { deleteRevenue } from "@/actions/business-finance"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RevenuesTabProps {
  company: any
  month: number
  year: number
  onUpdate: () => void
}

export function RevenuesTab({
  company,
  month,
  year,
  onUpdate,
}: RevenuesTabProps) {
  const { toast } = useToast()
  const [revenues, setRevenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadRevenues()
  }, [company.id, month, year])

  async function loadRevenues() {
    setLoading(true)
    
    const response = await fetch(
      `/api/revenues?companyId=${company.id}&month=${month}&year=${year}`
    )
    const data = await response.json()
    
    if (data.revenues) {
      setRevenues(data.revenues)
    }
    
    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    const result = await deleteRevenue(id)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar receita",
        description: result.error,
      })
    } else {
      toast({
        title: "Receita deletada",
        description: "A receita foi removida com sucesso.",
      })
      loadRevenues()
      onUpdate()
    }

    setDeleting(false)
    setDeletingId(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const total = revenues.reduce((sum, r) => sum + r.amount, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receitas</CardTitle>
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
            <CardTitle>Receitas</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total: <span className="font-semibold text-green-600">{formatCurrency(total)}</span>
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Receita
          </Button>
        </CardHeader>
        <CardContent>
          {revenues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma receita registrada neste período.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {revenues.map((revenue) => (
                <div
                  key={revenue.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{revenue.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(revenue.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(revenue.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(revenue.id)}
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

      <AddRevenueDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        companyId={company.id}
        defaultDate={new Date(year, month - 1, new Date().getDate())}
        onSuccess={() => {
          loadRevenues()
          onUpdate()
        }}
      />

      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar receita</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar esta receita? Esta ação não pode
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