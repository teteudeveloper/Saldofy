/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Pencil, Trash2, Calendar } from "lucide-react"
import { deleteGoal } from "@/actions/personal-finance"
import { useToast } from "@/components/ui/use-toast"
import { EditGoalDialog } from "./edit-goal-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface GoalCardProps {
  goal: any
  onUpdate: () => void
}

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const { toast } = useToast()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const progress = (goal.currentAmount / goal.targetAmount) * 100
  const isCompleted = progress >= 100

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteGoal(goal.id)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar meta",
        description: result.error,
      })
    } else {
      toast({
        title: "Meta deletada",
        description: "A meta foi removida com sucesso.",
      })
      onUpdate()
    }

    setDeleting(false)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card className={isCompleted ? "border-green-500" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <span className="text-sm font-medium">
                {progress.toFixed(1)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Atual</span>
              <span className="font-semibold">
                {formatCurrency(goal.currentAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meta</span>
              <span className="font-semibold">
                {formatCurrency(goal.targetAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Faltam</span>
              <span className="font-semibold text-indigo-600">
                {formatCurrency(
                  Math.max(0, goal.targetAmount - goal.currentAmount)
                )}
              </span>
            </div>
          </div>

          {goal.deadline && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-2 border-t">
              <Calendar className="h-4 w-4" />
              <span>Prazo: {formatDate(goal.deadline)}</span>
            </div>
          )}

          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-green-800">
                🎉 Meta alcançada!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showEditDialog && (
        <EditGoalDialog
          goal={goal}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            setShowEditDialog(false)
            onUpdate()
          }}
        />
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar meta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a meta "{goal.name}"? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
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