import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import SignOutButton from "@/components/SignOutButton"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width: 240,
        borderRight: "1px solid #e5e7eb",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}>
        <div style={{ marginBottom: "1.5rem", paddingLeft: "0.5rem" }}>
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>NexSaaS</span>
        </div>

        <Link href="/dashboard" style={{ display: "block", padding: "0.5rem", borderRadius: 6, fontSize: 14, color: "#111", textDecoration: "none" }}>
          Dashboard
        </Link>
        <Link href="/dashboard/organization" style={{ display: "block", padding: "0.5rem", borderRadius: 6, fontSize: 14, color: "#111", textDecoration: "none" }}>
          Organização
        </Link>
        <Link href="/dashboard/billing" style={{ display: "block", padding: "0.5rem", borderRadius: 6, fontSize: 14, color: "#111", textDecoration: "none" }}>
          Billing
        </Link>
        <Link href="/dashboard/features" style={{ display: "block", padding: "0.5rem", borderRadius: 6, fontSize: 14, color: "#111", textDecoration: "none" }}>
          Funcionalidades
        </Link>
        <Link href="/dashboard/settings" style={{ display: "block", padding: "0.5rem", borderRadius: 6, fontSize: 14, color: "#111", textDecoration: "none" }}>
          Configurações
        </Link>

        <div style={{ marginTop: "auto", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
          <p style={{ fontSize: 13, color: "#666", paddingLeft: "0.5rem" }}>
            {session.user?.name ?? session.user?.email}
          </p>
          <SignOutButton />
        </div>
      </aside>

      <main style={{ flex: 1, padding: "2rem" }}>
        {children}
      </main>
    </div>
  )
}