import { Request, Response } from "express";
import { stripe, STRIPE_PRICES } from "./lib/stripe";
import { prisma } from "./lib/db";
import { recomputeEntitlements } from "./billing";

export async function handleStripeWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        res.status(400).send("Missing signature/secret");
        return;
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as any;
            const { userId, engineId, product } = session.metadata || {};

            if (userId) {
                // Determine if Purchase or Subscription
                if (session.mode === "payment") {
                    await prisma.purchase.create({
                        data: {
                            userId,
                            engineId,
                            stripePriceId: STRIPE_PRICES.FULL, // approximation - verify line_items if needed
                            stripePaymentIntentId: session.payment_intent as string,
                            amount: session.amount_total || 0,
                            status: "succeeded"
                        }
                    });
                }

                // If subscription, it is handled in customer.subscription.created/updated?
                // But we can link customerId here.
                if (session.customer && session.mode === 'subscription') {
                    // Initial subscription record might be created
                }

                await recomputeEntitlements(userId);
            }
            break;
        }

        case "customer.subscription.updated":
        case "customer.subscription.created": {
            const sub = event.data.object as any;
            // Find user by customerId? Or Metadata?
            // Usually we store stripeCustomerId on User.
            // If new, we might need to find User via email or metadata if passed.
            // Assuming User is linked.

            const user = await prisma.user.findFirst({ where: { subscription: { stripeCustomerId: sub.customer as string } } });
            // If not found, maybe session metadata had userId and we linked it?
            // Simplified: Assume User linked in Checkout Session Completed first.
            if (user) {
                await prisma.subscription.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        stripeCustomerId: sub.customer as string,
                        stripeSubscriptionId: sub.id,
                        status: sub.status,
                        currentPeriodEnd: new Date(sub.current_period_end * 1000)
                    },
                    update: {
                        status: sub.status,
                        currentPeriodEnd: new Date(sub.current_period_end * 1000)
                    }
                });
                await recomputeEntitlements(user.id);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const sub = event.data.object as any;
            // mark inactive
            const user = await prisma.user.findFirst({ where: { subscription: { stripeCustomerId: sub.customer as string } } });
            if (user) {
                await prisma.subscription.update({
                    where: { userId: user.id },
                    data: { status: "canceled" }
                });
                await recomputeEntitlements(user.id);
            }
            break;
        }
    }

    res.json({ received: true });
}
