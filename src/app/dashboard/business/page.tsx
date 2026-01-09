import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { BusinessDashboard } from "@/components/business/business-dashboard"

export default async function BusinessFinancePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return <BusinessDashboard />
}