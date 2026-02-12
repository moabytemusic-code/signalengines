
import { NextRequest, NextResponse } from 'next/server';
import { stripeProvider } from '../../../../billing/stripe';
import { prisma } from '../../../../lib/db';

export async function POST(req: NextRequest) {
    if (process.env.BILLING_PROVIDER !== 'stripe' && !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ message: 'Stripe Disabled' }, { status: 404 });
    }

    try {
        const payload = await req.text();
        const sig = req.headers.get('stripe-signature');

        const event = await stripeProvider.verifyWebhook(payload, req.headers);
        if (!event.isVerified) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

        const entitlement = await stripeProvider.getUserEntitlement(event);

        if (entitlement.userEmail) {
            const user = await prisma.user.findUnique({
                where: { email: entitlement.userEmail }
            });

            if (user) {
                await prisma.user.update({
                    where: { email: entitlement.userEmail },
                    data: {
                        tier: entitlement.tier,
                        billingProvider: 'stripe',
                        billingSubscriptionId: entitlement.externalSubId
                    }
                });
            }
        }

        return NextResponse.json({ received: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
    }
}
