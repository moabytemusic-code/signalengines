
import { BillingProvider } from './provider';
import { gumroadProvider } from './gumroad';
import { stripeProvider } from './stripe';

console.log("Using Billing Provider:", process.env.BILLING_PROVIDER || 'gumroad');

export function getBillingProvider(): BillingProvider {
    const provider = process.env.BILLING_PROVIDER || 'gumroad';
    if (provider === 'stripe') {
        return stripeProvider;
    }
    return gumroadProvider;
}
