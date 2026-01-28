import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { SettingsPage as PersonalSettingsPage } from "@/components/settings/personal-page"
import { SettingsPage as FinanceSettingsPage } from "@/components/settings/finance-page"


export default async function Settings() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  } 

  const isBusinessAccount = user.defaultTenantType === "BUSINESS"

  return isBusinessAccount ? (
    <FinanceSettingsPage user={user} />
  ) : (
    <PersonalSettingsPage user={user} />
  )
}