import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { SettingsPage } from "@/components/settings/settings-page"

export default async function Settings() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return <SettingsPage user={user} />
}