import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature inválida:", error)
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.CheckoutSession
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const customerEmail = session.customer_email!

        const user = await prisma.user.findUnique({
          where: { email: customerEmail },
          include: { memberships: { include: { organization: true } } },
        })

        if (!user) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const price = await stripe.prices.retrieve(priceId, {
          expand: ["product"],
        })
        const productName = (price.product as Stripe.Product).name.toUpperCase()
        const plan = productName === "PRO" ? "PRO" : productName === "ENTERPRISE" ? "ENTERPRISE" : "FREE"

        const org = user.memberships[0]?.organization
        if (!org) break

        await prisma.organization.update({
          where: { id: org.id },
          data: {
            plan: plan as any,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        })

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const subscriptionId = subscription.id

        await prisma.organization.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
          },
        })

        break
      }
    }
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}