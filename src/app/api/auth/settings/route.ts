import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"
import { z } from "zod"

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const body = await req.json()

    if (body.name !== undefined) {
      const parsed = z.object({ name: z.string().min(2) }).safeParse(body)
      if (!parsed.success) return NextResponse.json({ error: "Nome inválido" }, { status: 400 })

      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: parsed.data.name },
      })

      return NextResponse.json({ message: "Nome atualizado" })
    }

    if (body.newPassword !== undefined) {
      const parsed = z.object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
      }).safeParse(body)

      if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user?.password) return NextResponse.json({ error: "Usuário sem senha definida" }, { status: 400 })

      const match = await compare(parsed.data.currentPassword, user.password)
      if (!match) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })

      const hashed = await hash(parsed.data.newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
      })

      return NextResponse.json({ message: "Senha atualizada" })
    }

    return NextResponse.json({ error: "Nenhuma ação válida" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}