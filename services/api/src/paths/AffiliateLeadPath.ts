import { PathEngine, PathContext, PathResult } from "@signalengines/engine-config";

export class AffiliateLeadPath implements PathEngine {
    id = "affiliate_lead_path";
    name = "Affiliate Lead Path";
    description = "Turn competitor publishers into direct outreach leads.";

    canHandle(context: PathContext): boolean {
        // Can run if previous path was Competitor Leak (chained) OR if input has specific leads
        const prev = context.previousResults?.["competitor_leak_path"];
        return !!prev || (context.signal?.lead_url);
    }

    async execute(context: PathContext): Promise<PathResult> {
        console.log(`[AffiliateLeadPath] Finding contacts...`);

        // MOCK LOGIC: Extract leads from previous stage or input
        let leadsToProcess = [];
        if (context.previousResults?.["competitor_leak_path"]) {
            const leakData = context.previousResults["competitor_leak_path"].data;
            if (leakData && leakData.sources) {
                leadsToProcess = leakData.sources;
            }
        }

        const enrichedLeads = leadsToProcess.map((l: any) => ({
            ...l,
            contact: {
                name: "John Doe",
                email: "contact@example.com",
                verified: Math.random() > 0.5
            }
        }));

        return {
            data: {
                leads: enrichedLeads,
                count: enrichedLeads.length
            },
            monetization: {
                offers: [],
                value: enrichedLeads.length * 2.00, // $2 per lead
                description: "Potential value of scraped leads.",
                currency: "USD",
                type: "lead"
            },
            meta: {
                credits_deducted: 0 // In real system, deduct credits
            }
        };
    }
}
