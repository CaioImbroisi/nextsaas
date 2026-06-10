import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createOrgSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createOrgSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { name, slug } = parsed.data

    const existing = await prisma.organization.findUnique({ where: { slug } })

    if (existing) {
      return NextResponse.json({ error: "Slug já em uso" }, { status: 409 })
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        memberships: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
    })

    return NextResponse.json(organization, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}