import Link from "next/link"

export default function NotFound() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 700, color: "#111" }}>404</h1>
      <p style={{ fontSize: "1rem", color: "#666" }}>Página não encontrada.</p>
      <Link href="/dashboard" style={{ fontSize: 14, color: "#111", fontWeight: 500 }}>
        Voltar ao dashboard →
      </Link>
    </div>
  )
}