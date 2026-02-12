
export interface VerifiedEvent {
    isVerified: boolean;
    eventType: 'subscription_created' | 'subscription_updated' | 'subscription_cancelled' | 'subscription_restarted' | 'test';
    provider: 'gumroad' | 'stripe';
    payload: any;
}

export interface UserEntitlement {
    userEmail: string;
    tier: 'free' | 'pro';
    status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired';
    externalSubId: string;
}

export interface BillingProvider {
    verifyWebhook(payload: any, headers: any): Promise<VerifiedEvent>;
    getUserEntitlement(event: VerifiedEvent): Promise<UserEntitlement>;
}
