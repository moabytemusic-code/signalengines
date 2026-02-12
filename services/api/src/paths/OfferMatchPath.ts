import { PathEngine, PathContext, PathResult } from "@signalengines/engine-config";

export class OfferMatchPath implements PathEngine {
    id = "offer_match_path";
    name = "Offer Match Path";
    description = "Match traffic and intent to the best monetization option.";

    canHandle(context: PathContext): boolean {
        // Can run if previous paths have run OR just inputs
        return true;
    }

    async execute(context: PathContext): Promise<PathResult> {
        console.log(`[OfferMatchPath] Matching offers...`);

        // MOCK LOGIC: Recommend offers based on context
        // Priority: Internal > External

        const internalOffers = [
            {
                id: "profithub_system",
                name: "ProfitHub System",
                type: "Internal",
                payout: "$47/mo",
                match_score: 95,
                link: "https://profithub.com"
            },
            {
                id: "smarthustler_academy",
                name: "Smart Hustler Academy",
                type: "Internal",
                payout: "$97",
                match_score: 90,
                link: "https://smarthustler.com"
            }
        ];

        const externalOffers = [
            {
                id: "bluehost_aff",
                name: "Bluehost Standard",
                type: "External",
                payout: "$65",
                match_score: 70
            }
        ];

        const recommended = [...internalOffers, ...externalOffers];

        return {
            data: {
                recommended_offers: recommended,
                strategy: "Direct to Offer"
            },
            monetization: {
                offers: recommended,
                value: 200.00,
                currency: "USD",
                type: "sale"
            },
            meta: {
                prioritized: true
            }
        };
    }
}
