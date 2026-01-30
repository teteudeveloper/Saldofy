import { Home, Building2, Settings, TrendingUp, type LucideIcon } from "lucide-react"

type TenantType = "PERSONAL" | "BUSINESS"

export interface DashboardNavUser {
  defaultTenantType?: TenantType | null
}

export interface DashboardNavItem {
  title: string
  href: string
  icon: LucideIcon
  type: "PERSONAL" | "BUSINESS" | "BOTH"
}

const allNavItems: DashboardNavItem[] = [
  {
    title: "Finanças Pessoais",
    href: "/dashboard/personal",
    icon: Home,
    type: "PERSONAL",
  },
  {
    title: "Finanças Empresariais",
    href: "/dashboard/business",
    icon: Building2,
    type: "BUSINESS",
  },
  {
    title: "Metas",
    href: "/dashboard/goals",
    icon: TrendingUp,
    type: "BOTH",
  },
  {
    title: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    type: "BOTH",
  },
]

export function getDashboardNavItems(user: DashboardNavUser) {
  return allNavItems.filter((item) => {
    if (item.type === "BOTH") return true
    return item.type === user.defaultTenantType
  })
}

