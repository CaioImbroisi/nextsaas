"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const ROLES = ["MEMBER", "VIEWER", "ADMIN"]

export default function InviteMemberForm({ organizationId }: { organizationId: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("MEMBER")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    const res = await fetch("/api/auth/organizations/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, organizationId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Erro ao convidar membro")
    } else {
      setMessage(`${email} adicionado como ${role}`)
      setEmail("")
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
          required
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14 }}
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14 }}
        >
          {ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "8px 16px", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" }}
        >
          {loading ? "Convidando..." : "Convidar"}
        </button>
      </form>
      {message && <p style={{ fontSize: 13, color: "#166534", marginTop: 8 }}>{message}</p>}
      {error && <p style={{ fontSize: 13, color: "#ef4444", marginTop: 8 }}>{error}</p>}
    </div>
  )
}