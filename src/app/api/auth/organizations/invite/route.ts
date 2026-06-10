import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
  organizationId: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const body = await req.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

    const { email, role, organizationId } = parsed.data

    const adminMembership = await prisma.membership.findFirst({
      where: { userId: session.user.id, organizationId, role: "ADMIN" },
    })

    if (!adminMembership) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const invitedUser = await prisma.user.findUnique({ where: { email } })
    if (!invitedUser) {
      return NextResponse.json({ error: "Usuário não encontrado — ele precisa ter uma conta" }, { status: 404 })
    }

    const existing = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: invitedUser.id, organizationId } },
    })

    if (existing) {
      return NextResponse.json({ error: "Usuário já é membro" }, { status: 409 })
    }

    await prisma.membership.create({
      data: { userId: invitedUser.id, organizationId, role },
    })

    return NextResponse.json({ message: "Membro adicionado" }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
