import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import BillingClient from "./BillingClient"

export default async function BillingPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const [prices, customer] = await Promise.all([
    stripe.prices.list({
      active: true,
      expand: ["data.product"],
      limit: 10,
    }),
    stripe.customers.search({
      query: `email:"${session.user?.email}"`,
    }),
  ])

  const plans = prices.data
    .filter(price => price.type === "recurring")
    .map(price => ({
      id: price.id,
      name: (price.product as any).name as string,
      amount: price.unit_amount ?? 0,
      currency: price.currency,
      interval: price.recurring?.interval ?? "month",
    }))
    .sort((a, b) => a.amount - b.amount)

  const currentCustomer = customer.data[0] ?? null
  const subscriptions = currentCustomer
    ? await stripe.subscriptions.list({
        customer: currentCustomer.id,
        status: "active",
        limit: 1,
      })
    : null

  const activePriceId = subscriptions?.data[0]?.items.data[0]?.price.id ?? null

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Billing
      </h1>
      <p style={{ fontSize: 14, color: "#666", marginBottom: "2rem" }}>
        Gerencie seu plano e assinatura.
      </p>

      <BillingClient plans={plans} activePriceId={activePriceId} />
    </div>
  )
}