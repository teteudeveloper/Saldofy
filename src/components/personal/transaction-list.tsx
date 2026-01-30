"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { deleteTransaction } from "@/actions/personal-finance"
import { useToast } from "@/components/ui/use-toast"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TransactionListProps {
  transactions: any[]
  categories: any[]
  onUpdate: () => void
}

export function TransactionList({
  transactions,
  categories,
  onUpdate,
}: TransactionListProps) {
  const { toast } = useToast()
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    const result = await deleteTransaction(id)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar transação",
        description: result.error,
      })
    } else {
      toast({
        title: "Transação deletada",
        description: "A transação foi removida com sucesso.",
      })
      onUpdate()
    }

    setDeleting(false)
    setDeletingId(null)
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhuma transação encontrada neste mês.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: transaction.category.color + "20" }}
              >
                {transaction.type === "INCOME" ? (
                  <TrendingUp
                    className="h-5 w-5"
                    style={{ color: transaction.category.color }}
                  />
                ) : (
                  <TrendingDown
                    className="h-5 w-5"
                    style={{ color: transaction.category.color }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate sm:whitespace-normal sm:break-words">
                  {transaction.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                  <span>{transaction.category.name}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
              <span
                className={`text-lg font-semibold ${
                  transaction.type === "INCOME"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingTransaction(transaction)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingId(transaction.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          categories={categories}
          onClose={() => setEditingTransaction(null)}
          onSuccess={() => {
            setEditingTransaction(null)
            onUpdate()
          }}
        />
      )}

      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar transação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar esta transação? Esta ação não pode
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
