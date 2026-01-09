import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { PersonalDashboard } from "./personal-dashboard"

export default async function PersonalFinancePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return <PersonalDashboard />
}