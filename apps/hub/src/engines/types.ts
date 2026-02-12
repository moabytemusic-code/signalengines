
export interface EngineTierLimits {
    generationsPerPeriod: number; // -1 for unlimited
    features: string[];
}

export interface EngineTiers {
    free: EngineTierLimits;
    pro: EngineTierLimits;
}

export interface EngineModule {
    id: string;
    name: string;
    tagline: string;
    route: string;
    tiers: EngineTiers;
    description?: string;
    // UI rendering component is usually dynamically imported or handled by the page component
}

export type UserTier = 'free' | 'pro';

export interface Usage state {
    engineId: string;
    userId: string;
    tier: UserTier;
    count: number;
    periodStart: Date;
    periodEnd: Date;
    limit: number;
    remaining: number;
}
