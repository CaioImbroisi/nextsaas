import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  })

  const planColors: Record<string, string> = {
    FREE: "#6b7280",
    PRO: "#7c3aed",
    ENTERPRISE: "#b45309",
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>
        Bem-vindo, {session.user?.name ?? session.user?.email}!
      </h1>
      <p style={{ fontSize: 14, color: "#666", marginBottom: "2rem" }}>
        Aqui está um resumo da sua conta.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{ padding: "1.25rem", border: "1px solid #e5e7eb", borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Organização</p>
          <p style={{ fontWeight: 600 }}>{membership?.organization.name ?? "Nenhuma"}</p>
        </div>

        <div style={{ padding: "1.25rem", border: "1px solid #e5e7eb", borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Plano atual</p>
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: planColors[membership?.organization.plan ?? "FREE"],
          }}>
            {membership?.organization.plan ?? "FREE"}
          </span>
        </div>

        <div style={{ padding: "1.25rem", border: "1px solid #e5e7eb", borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Seu papel</p>
          <p style={{ fontWeight: 600 }}>{membership?.role ?? "—"}</p>
        </div>
      </div>
    </div>
  )
}