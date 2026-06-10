import { prisma } from "@/lib/prisma"

export type Plan = "FREE" | "PRO" | "ENTERPRISE"

const planHierarchy: Record<Plan, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { organization: true },
  })

  return (membership?.organization.plan as Plan) ?? "FREE"
}

export function hasAccess(userPlan: Plan, requiredPlan: Plan): boolean {
  return planHierarchy[userPlan] >= planHierarchy[requiredPlan]
}