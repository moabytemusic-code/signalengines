import { prisma } from "./lib/db";
import { stripe, STRIPE_PRICES } from "./lib/stripe";

export async function createCheckoutSession(userId: string, engineId: string, product: string, successUrl: string, cancelUrl: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
    if (!user) throw new Error("User not found");

    let priceId = "";
    let mode: "payment" | "subscription" = "payment";

    if (product === "emergency") priceId = STRIPE_PRICES.EMERGENCY;
    else if (product === "full") priceId = STRIPE_PRICES.FULL;
    else if (product === "monthly") {
        priceId = STRIPE_PRICES.MONTHLY;
        mode = "subscription";
    } else {
        throw new Error("Invalid product");
    }

    const customerId = user.subscription?.stripeCustomerId;

    const session = await stripe.checkout.sessions.create({
        customer: customerId ?? undefined,
        customer_email: customerId ? undefined : user.email,
        mode,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            userId,
            engineId,
            product
        }
    });

    return session.url;
}

export async function createPortalSession(userId: string, returnUrl: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { subscription: true } });
    if (!user || !user.subscription?.stripeCustomerId) {
        throw new Error("No subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: user.subscription.stripeCustomerId,
        return_url: returnUrl
    });

    return session.url;
}

export async function recomputeEntitlements(userId: string) {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    let isPremium = false;
    let maxRuns = 3;
    let templatesAccess = false;

    // Global
    if (sub && sub.status === "active") {
        isPremium = true;
        maxRuns = 50;
        templatesAccess = true;
    }

    // Purchases
    const purchases = await prisma.purchase.findMany({ where: { userId, status: "succeeded" } });

    for (const p of purchases) {
        if (p.stripePriceId === STRIPE_PRICES.FULL) {
            if (p.engineId) {
                await prisma.engineEntitlement.upsert({
                    where: { userId_engineId: { userId, engineId: p.engineId } },
                    create: { userId, engineId: p.engineId, hasAccess: true },
                    update: { hasAccess: true }
                });
            }
            templatesAccess = true;
        }
    }

    await prisma.entitlement.upsert({
        where: { userId },
        update: { isPremium, maxRunsPerDay: maxRuns, templatesAccess },
        create: { userId, isPremium, maxRunsPerDay: maxRuns, templatesAccess }
    });
}
