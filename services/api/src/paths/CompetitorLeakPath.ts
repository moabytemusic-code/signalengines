import { PathEngine, PathContext, PathResult } from "@signalengines/engine-config";

// ------------------------------------------------------------------
// CONSTANTS & CONFIGURATION
// ------------------------------------------------------------------

type SourceType =
    | "Website / Blog"
    | "Review Site"
    | "Deal / Coupon Page"
    | "YouTube Channel"
    | "Social Profile"
    | "Newsletter / Content Hub"
    | "Marketplace Listing";

type AffiliateLikelihood = "LOW" | "MEDIUM" | "HIGH";

const AFFILIATE_SIGNALS = [
    "coupon", "discount", "promo code", "best deal", "save", "off",
    "referral", "partner", "associate", "commission", "link"
];

const SOURCE_PATTERNS: Record<string, SourceType> = {
    "youtube.com": "YouTube Channel",
    "youtu.be": "YouTube Channel",
    "reddit.com": "Social Profile",
    "twitter.com": "Social Profile",
    "x.com": "Social Profile",
    "linkedin.com": "Social Profile",
    "medium.com": "Website / Blog",
    "substack.com": "Newsletter / Content Hub",
    "amazon.com": "Marketplace Listing",
    "ebay.com": "Marketplace Listing"
};

// ------------------------------------------------------------------
// LOGIC IMPLEMENTATION
// ------------------------------------------------------------------

export class CompetitorLeakPath implements PathEngine {
    id = "competitor_leak_path";
    name = "Competitor Leak Path";
    description = "Reveal where competitors are already making money.";

    canHandle(context: PathContext): boolean {
        const inputs = context.signal;
        // Can handle if input has a domain or URL
        return !!(inputs?.url || inputs?.domain || inputs?.competitor);
    }

    async execute(context: PathContext): Promise<PathResult> {
        const inputs = context.signal;
        const target = inputs?.url || inputs?.domain || inputs?.competitor || "unknown";

        console.log(`[CompetitorLeakPath] Analyzing leaks for: ${target}`);

        // MOCK LOGIC: Simulate finding intelligence data
        // In a real implementation, this would query an API like Ahrefs, SEMrush, or a custom scraper

        const mockSources = this.generateMockSources(target);

        // Analyze each source
        const analyzedSources = mockSources.map(source => {
            const sourceType = this.classifySourceType(source.url);
            const affiliateLikelihood = this.detectAffiliateLikelihood(source.content_snippet, source.url);
            const exposureScore = this.calculateExposureScore(source.authority, affiliateLikelihood, source.mentions);

            return {
                url: source.url,
                title: source.title,
                source_type: sourceType,
                affiliate_likelihood: affiliateLikelihood,
                exposure_score: exposureScore,
                lead_candidate: ["MEDIUM", "HIGH"].includes(affiliateLikelihood) ? "Outreach Candidate" : "Monitor Only"
            };
        });

        //Sort by best opportunity (High Exposure + High Affiliate Likelihood)
        analyzedSources.sort((a, b) => b.exposure_score - a.exposure_score);

        return {
            data: {
                target: target,
                sources: analyzedSources,
                total_leaks: analyzedSources.length,
                high_value_leaks: analyzedSources.filter(s => s.affiliate_likelihood === "HIGH").length
            },
            monetization: {
                offers: [], // Leads to Affiliate Lead Path
                value: analyzedSources.reduce((acc, s) => acc + (s.exposure_score * 0.5), 0), // Est. Value calculation
                currency: "USD",
                type: "data"
            },
            meta: {
                source: "competitor_leak_engine_v1",
                confidence: 0.88
            }
        };
    }

    // --- HELPER METHODS ---

    private classifySourceType(url: string): SourceType {
        try {
            const domain = new URL(url).hostname.replace('www.', '');

            // Check direct patterns
            for (const [pattern, type] of Object.entries(SOURCE_PATTERNS)) {
                if (domain.includes(pattern)) return type;
            }

            // Heuristic fallbacks
            if (url.includes("/review") || url.includes("/best-")) return "Review Site";
            if (url.includes("/coupon") || url.includes("/deal")) return "Deal / Coupon Page";

            return "Website / Blog";
        } catch (e) {
            return "Website / Blog";
        }
    }

    private detectAffiliateLikelihood(content: string, url: string): AffiliateLikelihood {
        let score = 0;
        const lowerContent = content.toLowerCase();
        const lowerUrl = url.toLowerCase();

        // Check for strong signals
        if (lowerUrl.includes("ref=") || lowerUrl.includes("aff=") || lowerUrl.includes("partner=")) score += 5;
        if (lowerContent.includes("commission") || lowerContent.includes("affiliate disclosure")) score += 4;

        // Check for moderate signals
        if (lowerUrl.includes("/review") || lowerUrl.includes("/best")) score += 2;

        // Check keyword density
        const keywordCount = AFFILIATE_SIGNALS.filter(k => lowerContent.includes(k)).length;
        score += Math.min(3, keywordCount);

        if (score >= 5) return "HIGH";
        if (score >= 2) return "MEDIUM";
        return "LOW";
    }

    private calculateExposureScore(authority: number, likelihood: AffiliateLikelihood, mentions: number): number {
        let score = authority; // Base authority (0-100)

        // Adjust by likelihood
        if (likelihood === "HIGH") score *= 1.25;
        if (likelihood === "MEDIUM") score *= 1.1;

        // Adjust by volume
        if (mentions > 5) score += 10;

        return Math.floor(Math.min(100, score));
    }

    private generateMockSources(target: string) {
        // Mock data generator for demonstration
        return [
            {
                url: `https://niche-authority.com/best-${target.replace(/\s+/g, '-')}-alternatives`,
                title: `Top 10 Tools Better Than ${target}`,
                authority: 65,
                mentions: 12,
                content_snippet: "We tested the top apps. While popular, this tool has high pricing. We may earn a commission if you buy through our links."
            },
            {
                url: `https://youtube.com/watch?v=mockid123`,
                title: `${target} vs The Competition - Honest Review`,
                authority: 80,
                mentions: 1,
                content_snippet: "Link in description for the best deal. Don't forget to like and subscribe."
            },
            {
                url: `https://coupons-daily.com/${target.replace(/\s+/g, '-')}-promo-code`,
                title: `${target} Discount Codes 2026`,
                authority: 30,
                mentions: 3,
                content_snippet: "Verified promo codes. Save 20% off your subscription today."
            },
            {
                url: `https://marketing-forum.com/t/${target.replace(/\s+/g, '-')}-sucks`,
                title: "Why I switched away from this tool",
                authority: 45,
                mentions: 4,
                content_snippet: "Honestly support is terrible. I switched to a cheaper alternative."
            }
        ];
    }
}
