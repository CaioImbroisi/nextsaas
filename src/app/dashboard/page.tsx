import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Dashboard
      </h1>
      <p style={{ color: "#666" }}>
        Bem-vindo, {session.user?.name ?? session.user?.email}!
      </p>
    </div>
  )
}