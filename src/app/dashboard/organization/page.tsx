import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CreateOrgForm from "./CreateOrgForm"
import InviteMemberForm from "./InviteMemberForm"

export default async function OrganizationPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { organization: { include: { memberships: { include: { user: true } } } } },
  })

  const currentOrg = memberships[0]?.organization ?? null
  const isAdmin = memberships[0]?.role === "ADMIN"

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        Organização
      </h1>

      {currentOrg ? (
        <div>
          <div style={{ padding: "1.25rem", border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: "2rem" }}>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Nome</p>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>{currentOrg.name}</p>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Slug</p>
            <p style={{ fontSize: 13, fontFamily: "monospace", background: "#f9fafb", padding: "4px 8px", borderRadius: 4, display: "inline-block" }}>
              {currentOrg.slug}
            </p>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: "1rem" }}>Membros</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentOrg.memberships.map(({ user, role }) => (
                <div key={user.id} style={{
                  padding: "0.75rem 1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500 }}>{user.name ?? "Sem nome"}</p>
                    <p style={{ fontSize: 12, color: "#666" }}>{user.email}</p>
                  </div>
                  <span style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background: role === "ADMIN" ? "#fef9c3" : "#f3f4f6",
                    color: role === "ADMIN" ? "#854d0e" : "#374151",
                    fontWeight: 500,
                  }}>
                    {role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem" }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: "0.75rem" }}>Convidar membro</h2>
              <InviteMemberForm organizationId={currentOrg.id} />
            </div>
          )}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 14, color: "#666", marginBottom: "1rem" }}>
            Você ainda não pertence a nenhuma organização.
          </p>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.25rem" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: "0.75rem" }}>Criar organização</h2>
            <CreateOrgForm />
          </div>
        </div>
      )}
    </div>
  )
}