
import { BillingProvider, VerifiedEvent, UserEntitlement } from './provider';

import crypto from 'crypto';

export const gumroadProvider: BillingProvider = {
    async verifyWebhook(payload: any, headers: any, rawBody?: string): Promise<VerifiedEvent> {
        // Verify signature
        const secret = process.env.GUMROAD_WEBHOOK_SECRET;
        if (!secret) {
            console.error("GUMROAD_WEBHOOK_SECRET not configured");
            return { isVerified: false, eventType: 'test', provider: 'gumroad', payload };
        }

        if (!rawBody) {
            console.error("Missing rawBody for signature verification");
            return { isVerified: false, eventType: 'test', provider: 'gumroad', payload };
        }

        // Gumroad sends signature in X-Gumroad-Signature header
        // Headers are usually lowercase in Node/Next
        const signature = headers.get ? headers.get('x-gumroad-signature') : (headers['x-gumroad-signature'] || headers['X-Gumroad-Signature']);

        if (!signature) {
            console.error("Missing X-Gumroad-Signature header");
            return { isVerified: false, eventType: 'test', provider: 'gumroad', payload };
        }

        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(rawBody);
        const expectedSignature = hmac.digest('hex');

        if (signature !== expectedSignature) {
            console.error(`Invalid signature. Expected: ${expectedSignature}, Got: ${signature}`);
            return { isVerified: false, eventType: 'test', provider: 'gumroad', payload };
        }

        if (!payload || !payload.email) {
            console.error("Gumroad payload missing email");
            return { isVerified: false, eventType: 'test', provider: 'gumroad', payload };
        }

        let eventType: VerifiedEvent['eventType'] = 'subscription_updated';

        if (payload.cancelled === 'true' || payload.cancelled === true) {
            eventType = 'subscription_cancelled';
        }
        if (payload.ended === 'true' || payload.ended === true) {
            eventType = 'subscription_ended';
        }

        // Gumroad 'sale' or 'subscription' events
        // If it's a new sale that is a subscription product
        if (payload.resource_name === 'sale' && !payload.is_recurring_charge) {
            eventType = 'subscription_created';
        }

        return {
            isVerified: true,
            eventType,
            provider: 'gumroad',
            payload
        };
    },

    async getUserEntitlement(event: VerifiedEvent): Promise<UserEntitlement> {
        const p = event.payload;

        const isCancelled = p.cancelled === 'true' || p.cancelled === true;
        const isEnded = p.ended === 'true' || p.ended === true;

        // If cancelled but not ended, they might still be active until period end.
        // However, for simplicity per requirements: "tier='free' on cancellation/expired"
        // We will mark them as cancels immediately or let the webhook logic decide.

        let status: UserEntitlement['status'] = 'active';
        if (isEnded) status = 'expired';
        else if (isCancelled) status = 'cancelled';

        return {
            userEmail: p.email,
            tier: (status === 'active') ? 'pro' : 'free',
            status,
            externalSubId: p.subscription_id || p.order_number
        };
    }
};
