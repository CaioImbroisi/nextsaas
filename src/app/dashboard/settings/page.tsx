import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import SettingsForm from "./SettingsForm"

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  })

  if (!user) redirect("/login")

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Configurações
      </h1>
      <p style={{ fontSize: 14, color: "#666", marginBottom: "2rem" }}>
        Gerencie suas informações pessoais.
      </p>

      <SettingsForm user={user} />
    </div>
  )
}