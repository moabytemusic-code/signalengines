import { EngineModule } from '../types';

export const sequenceEngineModule: EngineModule = {
    id: 'sequence-engine',
    name: 'SequenceEngine™',
    tagline: 'Generate complete email sequences instantly',
    route: '/tools/sequence-engine',
    tiers: {
        free: { generationsPerPeriod: 3, features: ['Subject Lines', 'Cold Email', '2 Follow-ups'] },
        pro: { generationsPerPeriod: -1, features: ['Unlimited', 'Full Sequence (5 follow-ups)', 'Export', 'Personalization Breakdown'] }
    },
    description: 'Create high-converting email sequences for any niche using proven psychological triggers.'
};
