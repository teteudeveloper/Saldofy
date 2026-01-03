import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { GoalsDashboard } from "./goals-dashboard"

export default async function GoalsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return <GoalsDashboard />
}