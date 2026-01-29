/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Check, Trash2, Calendar, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AddTaxDialog } from "./add-tax-dialog"
import {
  markTaxAsPaid,
  deleteTax,
  getTaxesByCompany,
} from "@/actions/business-finance"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TaxesTabProps {
  company: any
  month: number
  year: number
  onUpdate: () => void
}

export function TaxesTab({ company, month, year, onUpdate }: TaxesTabProps) {
  const { toast } = useToast()
  const [taxes, setTaxes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadTaxes()
  }, [company.id, month, year])

  async function loadTaxes() {
    setLoading(true)

    const result = await getTaxesByCompany(company.id, month, year)
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar impostos",
        description: result.error,
      })
      setTaxes([])
      setLoading(false)
      return
    }

    if (result.data) setTaxes(result.data)
    
    setLoading(false)
  }

  async function handleMarkAsPaid(id: string) {
    const result = await markTaxAsPaid(id)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao marcar imposto como pago",
        description: result.error,
      })
    } else {
      toast({
        title: "Imposto marcado como pago",
        description: "O imposto foi atualizado com sucesso.",
      })
      loadTaxes()
      onUpdate()
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    const result = await deleteTax(id)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar imposto",
        description: result.error,
      })
    } else {
      toast({
        title: "Imposto deletado",
        description: "O imposto foi removido com sucesso.",
      })
      loadTaxes()
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

  const pendingTaxes = taxes.filter((t) => !t.paid)
  const paidTaxes = taxes.filter((t) => t.paid)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impostos</CardTitle>
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
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Impostos Pendentes</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Total:{" "}
                <span className="font-semibold text-orange-600">
                  {formatCurrency(
                    pendingTaxes.reduce((sum, t) => sum + t.amount, 0)
                  )}
                </span>
              </p>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Imposto
            </Button>
          </CardHeader>
          <CardContent>
            {pendingTaxes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum imposto pendente neste período.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTaxes.map((tax) => (
                  <div
                    key={tax.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-orange-200 bg-orange-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tax.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Vencimento: {formatDate(tax.dueDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-orange-600">
                        {formatCurrency(tax.amount)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsPaid(tax.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Marcar como Pago
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(tax.id)}
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

        {paidTaxes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Impostos Pagos</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Total:{" "}
                <span className="font-semibold text-green-600">
                  {formatCurrency(
                    paidTaxes.reduce((sum, t) => sum + t.amount, 0)
                  )}
                </span>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paidTaxes.map((tax) => (
                  <div
                    key={tax.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-green-200 bg-green-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tax.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Pago em: {tax.paidDate && formatDate(tax.paidDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(tax.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(tax.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTaxDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        companyId={company.id}
        onSuccess={() => {
          loadTaxes()
          onUpdate()
        }}
      />

      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar imposto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este imposto? Esta ação não pode
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
