"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

type User = {
  id: string
  name: string | null
  email: string
}

export default function SettingsForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { update } = useSession()

 

  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    const res = await fetch("/api/auth/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })

    const data = await res.json()


    if (!res.ok) {
      setError(data.error || "Erro ao atualizar nome")
    } else {
      setMessage("Nome atualizado com sucesso!")
      await update({ name })
    }

    setLoading(false)
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setError("")

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Erro ao atualizar senha")
    } else {
      setMessage("Senha atualizada com sucesso!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }

    setLoading(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: 480 }}>
      
      {message && (
        <p style={{ fontSize: 14, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: 6 }}>
          {message}
        </p>
      )}
      {error && (
        <p style={{ fontSize: 14, color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 14px", borderRadius: 6 }}>
          {error}
        </p>
      )}

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.5rem" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: "1rem" }}>Informações pessoais</h2>
        <form onSubmit={handleUpdateName}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, background: "#f9fafb", color: "#9ca3af" }}
            />
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>O email não pode ser alterado.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "8px 16px", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" }}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.5rem" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: "1rem" }}>Alterar senha</h2>
        <form onSubmit={handleUpdatePassword}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>Senha atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14 }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 4 }}>Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 14,
                border: confirmPassword && newPassword !== confirmPassword ? "1px solid #ef4444" : "1px solid #e5e7eb",
              }}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>As senhas não coincidem</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || newPassword !== confirmPassword}
            style={{
              padding: "8px 16px",
              background: newPassword !== confirmPassword ? "#9ca3af" : "#111",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              cursor: newPassword !== confirmPassword ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Salvando..." : "Alterar senha"}
          </button>
        </form>
      </div>

    </div>
  )
}