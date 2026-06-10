"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#111" }}>Algo deu errado</h1>
      <p style={{ fontSize: 14, color: "#666" }}>{error.message}</p>
      <button
        onClick={reset}
        style={{ fontSize: 14, padding: "8px 16px", background: "#111", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
      >
        Tentar novamente
      </button>
    </div>
  )
}