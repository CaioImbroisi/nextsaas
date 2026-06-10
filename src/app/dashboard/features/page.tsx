import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getUserPlan, hasAccess } from "@/lib/plan"

export default async function FeaturesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const plan = await getUserPlan(session.user.id)

  const features = [
    { name: "Dashboard básico", requiredPlan: "FREE" as const, description: "Visão geral da sua conta" },
    { name: "Múltiplos membros", requiredPlan: "FREE" as const, description: "Convide membros para sua org" },
    { name: "Relatórios avançados", requiredPlan: "PRO" as const, description: "Análises detalhadas de uso" },
    { name: "Integrações", requiredPlan: "PRO" as const, description: "Conecte com outras ferramentas" },
    { name: "SLA garantido", requiredPlan: "ENTERPRISE" as const, description: "99.9% de uptime garantido" },
    { name: "Suporte dedicado", requiredPlan: "ENTERPRISE" as const, description: "Suporte 24/7 com gerente exclusivo" },
  ]

  const planColors: Record<string, string> = {
    FREE: "#6b7280",
    PRO: "#7c3aed",
    ENTERPRISE: "#b45309",
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Funcionalidades</h1>
        <span style={{
          fontSize: 11,
          padding: "2px 10px",
          borderRadius: 99,
          fontWeight: 600,
          background: plan === "FREE" ? "#f3f4f6" : plan === "PRO" ? "#ede9fe" : "#fef9c3",
          color: planColors[plan],
        }}>
          {plan}
        </span>
      </div>
      <p style={{ fontSize: 14, color: "#666", marginBottom: "2rem" }}>
        Veja o que está disponível no seu plano atual.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {features.map(feature => {
          const accessible = hasAccess(plan, feature.requiredPlan)
          return (
            <div key={feature.name} style={{
              padding: "1rem 1.25rem",
              border: `1px solid ${accessible ? "#e5e7eb" : "#f3f4f6"}`,
              borderRadius: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: accessible ? 1 : 0.5,
            }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{feature.name}</p>
                <p style={{ fontSize: 12, color: "#666" }}>{feature.description}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: feature.requiredPlan === "FREE" ? "#f3f4f6" : feature.requiredPlan === "PRO" ? "#ede9fe" : "#fef9c3",
                  color: planColors[feature.requiredPlan],
                  fontWeight: 500,
                }}>
                  {feature.requiredPlan}
                </span>
                {accessible
                  ? <span style={{ color: "#16a34a", fontSize: 18 }}>✓</span>
                  : <span style={{ color: "#d1d5db", fontSize: 18 }}>✗</span>
                }
              </div>
            </div>
          )
        })}
      </div>

      {plan === "FREE" && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1rem 1.25rem",
          background: "#fafafa",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <p style={{ fontSize: 14, color: "#374151" }}>Quer desbloquear mais funcionalidades?</p>
          <a href="/dashboard/billing" style={{
            fontSize: 13,
            padding: "6px 14px",
            background: "#111",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 500,
          }}>
            Ver planos
          </a>
        </div>
      )}
    </div>
  )
}