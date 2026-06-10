"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateOrgForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: generateSlug(name) }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Erro ao criar organização")
      setLoading(false)
      return
    }

    router.refresh()
    setName("")
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome da organização"
          required
          style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14 }}
        />
        {name && (
          <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            slug: {generateSlug(name)}
          </p>
        )}
        {error && (
          <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{error}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{ padding: "8px 16px", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" }}
      >
        {loading ? "Criando..." : "Criar"}
      </button>
    </form>
  )
}