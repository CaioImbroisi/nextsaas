"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Erro ao criar conta")
      setLoading(false)
      return
    }

    router.push("/login")
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "2rem" }}>
        <h1 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}>Criar conta</h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Confirmar senha</label>
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
                border: confirmPassword && password !== confirmPassword
                  ? "1px solid #ef4444"
                  : "1px solid #ccc",
              }}
            />
            {confirmPassword && password !== confirmPassword && (
              <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
                As senhas não coincidem
              </p>
            )}
          </div>

          {error && (
            <p style={{ color: "#ef4444", fontSize: 14, marginBottom: "1rem" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || password !== confirmPassword}
            style={{
              width: "100%",
              padding: "10px",
              background: password !== confirmPassword ? "#9ca3af" : "#000",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: password !== confirmPassword ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: 14, textAlign: "center" }}>
          Já tem conta? <a href="/login" style={{ color: "#000", fontWeight: 500 }}>Entrar</a>
        </p>
      </div>
    </div>
  )
}