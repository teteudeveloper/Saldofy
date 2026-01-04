export interface Company {
  id: string
  name: string
  cnpj?: string
  createdAt: Date
  updatedAt: Date
}

export interface Employee {
  id: string
  name: string
  email?: string
  position?: string
  companyId: string
  createdAt: Date
  updatedAt: Date
}

export interface Revenue {
  id: string
  description: string
  amount: number
  date: Date
  companyId: string
  createdAt: Date
  updatedAt: Date
}

export interface Tax {
  id: string
  name: string
  amount: number
  dueDate: Date
  paid: boolean
  paidDate?: Date
  companyId: string
  createdAt: Date
  updatedAt: Date
}

export interface BusinessStats {
  totalRevenue: number
  totalExpenses: number
  totalTaxes: number
  taxesPaid: number
  taxesPending: number
  employeeCount: number
  expensesByEmployee: {
    employee: Employee
    total: number
  }[]
}