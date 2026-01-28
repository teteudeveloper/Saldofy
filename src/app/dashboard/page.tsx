import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/signin")
  }

  const redirectPath = user.defaultTenantType === "BUSINESS" 
    ? "/dashboard/business" 
    : "/dashboard/personal"
  
  redirect(redirectPath)
}
