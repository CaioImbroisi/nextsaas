"use client"

import { useState } from "react"

type Plan = {
  id: string
  name: string
  amount: number
  currency: string
  interval: string
}

export default function BillingClient({
  plans,
  activePriceId,
}: {
  plans: Plan[]
  activePriceId: string | null
  orgPlan: string
}) {
  const [loading, setLoading] = useState<string | null>(null)

  function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  async function handleSubscribe(priceId: string) {
    setLoading(priceId)

      const res = await fetch("/api/auth/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      alert("Erro ao iniciar checkout")
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading("portal")

const res = await fetch("/api/auth/billing/portal", { method: "POST" })
    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      alert("Erro ao abrir portal")
      setLoading(null)
    }
  }

  return (
    <div>
      {activePriceId && (
        <div style={{
          padding: "1rem",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 8,
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <p style={{ fontSize: 14, color: "#166534" }}>
            Você tem uma assinatura ativa.
          </p>
          <button
            onClick={handlePortal}
            disabled={loading === "portal"}
            style={{ fontSize: 13, padding: "6px 14px", background: "#166534", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
          >
            {loading === "portal" ? "Abrindo..." : "Gerenciar assinatura"}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "1.5rem",
        }}>
          <h2 style={{ fontWeight: 600, marginBottom: 8 }}>Free</h2>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>R$ 0</p>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Plano gratuito com recursos básicos.</p>
          <button disabled style={{ width: "100%", padding: "8px", background: "#f3f4f6", color: "#9ca3af", border: "none", borderRadius: 6, cursor: "not-allowed", fontSize: 14 }}>
            Plano atual
          </button>
        </div>

        {plans.map(plan => {
          const isActive = plan.name.toUpperCase() === orgPlan || plan.id === activePriceId
          return (
            <div key={plan.id} style={{
              border: isActive ? "2px solid #111" : "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "1.5rem",
              position: "relative",
            }}>
              {isActive && (
                <span style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#111",
                  color: "#fff",
                  fontSize: 11,
                  padding: "2px 10px",
                  borderRadius: 99,
                }}>
                  Plano atual
                </span>
              )}
              <h2 style={{ fontWeight: 600, marginBottom: 8 }}>{plan.name}</h2>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>
                {formatPrice(plan.amount, plan.currency)}
              </p>
              <p style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>por {plan.interval === "month" ? "mês" : "ano"}</p>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isActive || loading === plan.id}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: isActive ? "#f3f4f6" : "#111",
                  color: isActive ? "#9ca3af" : "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: isActive ? "not-allowed" : "pointer",
                  fontSize: 14,
                }}
              >
                {loading === plan.id ? "Redirecionando..." : isActive ? "Ativo" : "Assinar"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}