"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Trash2 } from "lucide-react"
import { signOut, deleteAccount } from "@/actions/auth"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DashboardHeaderProps {
  user: {
    id: string
    email: string
    name: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDeleteAccount() {
    setDeleting(true)
    const result = await deleteAccount()

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar conta",
        description: result.error,
      })
      setDeleting(false)
      return
    }

    toast({
      title: "Conta deletada",
      description: "Sua conta foi deletada com sucesso.",
    })
  }

  return (
    <>
      <header className="h-16 border-b bg-white flex items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-14 w-14 rounded-full">
               <User className="h-10 w-10 text-gray-700" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer">
              <User className="h-6 w-6 text-gray-700" />
              <span>{user.name}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer text-red-600"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Deletar conta</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar conta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar sua conta? Esta ação não pode ser
              desfeita. Todos os seus dados serão permanentemente removidos.
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
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deletando..." : "Sim, deletar minha conta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
