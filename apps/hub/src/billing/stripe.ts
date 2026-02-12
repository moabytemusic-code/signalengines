
import { BillingProvider, UserEntitlement, VerifiedEvent } from './provider';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2024-12-18.acacia'
});

export const stripeProvider: BillingProvider = {
    async verifyWebhook(payload: any, headers: any): Promise<VerifiedEvent> {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.warn("Stripe provider active but no STRIPE_WEBHOOK_SECRET found");
            return { isVerified: false, eventType: 'test', provider: 'stripe', payload };
        }

        // In Next.js App Router, payload is a Buffer or String from raw-body
        // Assuming integration calls us with proper raw body
        // const event = stripe.webhooks.constructEvent(payload, headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);

        // For now, stub verification
        return {
            isVerified: true,
            eventType: 'subscription_created',
            provider: 'stripe',
            payload: payload
        };
    },

    async getUserEntitlement(event: VerifiedEvent): Promise<UserEntitlement> {
        const p = event.payload;
        // Map Stripe subscription status to entitlement
        // status: active, trialing, past_due, canceled, unpaid

        let tier: 'free' | 'pro' = 'free';
        if (['active', 'trialing'].includes(p.status)) {
            tier = 'pro';
        }

        return {
            userEmail: p.customer_email || p.email, // Stripe event structure varies by object
            tier,
            status: p.status || 'active',
            externalSubId: p.id
        };
    }
};
