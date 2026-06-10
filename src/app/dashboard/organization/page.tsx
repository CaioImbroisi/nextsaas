import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CreateOrgForm from "./CreateOrgForm"

export default async function OrganizationPage() {
  const session = await auth()

  if (!session) redirect("/login")

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { organization: true },
  })

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        Organizações
      </h1>

      {memberships.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: 14, color: "#666", marginBottom: "0.75rem" }}>
            Suas organizações
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {memberships.map(({ organization, role }) => (
              <div key={organization.id} style={{
                padding: "0.75rem 1rem",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <p style={{ fontWeight: 500 }}>{organization.name}</p>
                  <p style={{ fontSize: 12, color: "#666" }}>{organization.slug}</p>
                </div>
                <span style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "#f3f4f6",
                  color: "#374151",
                }}>
                  {role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: 14, color: "#666", marginBottom: "0.75rem" }}>
          Criar nova organização
        </h2>
        <CreateOrgForm />
      </div>
    </div>
  )
}