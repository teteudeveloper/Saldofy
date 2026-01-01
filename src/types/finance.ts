export interface Transaction {
  id: string
  description: string
  amount: number
  type: "INCOME" | "EXPENSE"
  date: Date
  categoryId: string
  category: Category
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
  type: "INCOME" | "EXPENSE"
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: Date
  createdAt: Date
  updatedAt: Date
}

export interface MonthlyStats {
  totalIncome: number
  totalExpense: number
  balance: number
  categoryBreakdown: {
    category: Category
    total: number
    percentage: number
  }[]
}