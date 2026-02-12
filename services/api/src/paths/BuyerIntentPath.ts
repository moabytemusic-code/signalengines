import { PathEngine, PathContext, PathResult } from "@signalengines/engine-config";

// ------------------------------------------------------------------
// CONSTANTS & CONFIGURATION
// ------------------------------------------------------------------

type IntentType =
    | "REVIEW INTENT"
    | "COMPARISON INTENT"
    | "ALTERNATIVES INTENT"
    | "PRICE / DEAL INTENT"
    | "PURCHASE VALIDATION INTENT"
    | "INFORMATIONAL (LOW INTENT)";

type BuyingStage = "Early Decision" | "Late Decision" | "Research";

const INTENT_KEYWORDS: Record<IntentType, string[]> = {
    "REVIEW INTENT": ["review", "reviews", "test", "tested", "hands-on", "worth it"],
    "COMPARISON INTENT": ["vs", "versus", "compare", "comparison", "difference between"],
    "ALTERNATIVES INTENT": ["alternative", "alternatives", "competitor", "similar to", "like"],
    "PRICE / DEAL INTENT": ["price", "cost", "pricing", "coupon", "discount", "deal", "promo", "code", "sale"],
    "PURCHASE VALIDATION INTENT": ["legit", "scam", "safe", "real", "fake", "trustworthy"],
    "INFORMATIONAL (LOW INTENT)": [] // Default fallback
};

const CONTEXT_INDICATORS = [
    "for beginners", "for small business", "under $", "near me",
    String(new Date().getFullYear()), String(new Date().getFullYear() + 1) // Dynamic year support
];

// ------------------------------------------------------------------
// LOGIC IMPLEMENTATION
// ------------------------------------------------------------------

export class BuyerIntentPath implements PathEngine {
    id = "buyer_intent_path";
    name = "Buyer Intent Path";
    description = "Detect and classify buyer-intent demand signals.";

    canHandle(context: PathContext): boolean {
        const inputs = context.signal;
        // Handles raw keywords or topic inputs
        return !!(inputs?.keyword || inputs?.topic || inputs?.query);
    }

    async execute(context: PathContext): Promise<PathResult> {
        const inputs = context.signal;
        const rawQuery = (inputs?.keyword || inputs?.topic || inputs?.query || "").toString().toLowerCase().trim();

        console.log(`[BuyerIntentPath] Processing query: "${rawQuery}"`);

        // 1. Classify Intent
        const classification = this.classifyIntent(rawQuery);

        // 2. Determine Buying Stage & Score
        const stage = this.determineStage(classification);
        const monScore = this.calculateMonetizationScore(rawQuery, classification);

        // 3. Generate Blueprint
        const blueprint = this.generateTrafficBlueprint(rawQuery, classification, stage, monScore);

        // 4. Determine Routing
        const routing = this.determineOfferRouting(classification, monScore);

        return {
            data: {
                signal: {
                    query: rawQuery,
                    intent_type: classification,
                    buying_stage: stage,
                    monetization_score: monScore,
                    context_indicators: this.extractContextIndicators(rawQuery)
                },
                blueprint: blueprint
            },
            monetization: {
                offers: [], // Offers are technically handled by OfferMatchPath, but we provide routing here
                value: monScore * 2.5, // Arbitrary estimated value calc
                currency: "USD",
                type: "traffic"
            },
            meta: {
                source: "buyer_intent_engine_v1",
                confidence: monScore > 50 ? "high" : "medium",
                routing_recommendation: routing
            }
        };
    }

    // --- HELPER METHODS ---

    private classifyIntent(query: string): IntentType {
        for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
            if (intent === "INFORMATIONAL (LOW INTENT)") continue;
            if (keywords.some(k => query.includes(k))) {
                return intent as IntentType;
            }
        }
        return "INFORMATIONAL (LOW INTENT)";
    }

    private determineStage(intent: IntentType): BuyingStage {
        switch (intent) {
            case "ALTERNATIVES INTENT":
            case "COMPARISON INTENT":
                return "Early Decision";
            case "REVIEW INTENT":
            case "PRICE / DEAL INTENT":
            case "PURCHASE VALIDATION INTENT":
                return "Late Decision";
            default:
                return "Research";
        }
    }

    private calculateMonetizationScore(query: string, intent: IntentType): number {
        let score = 50; // Base score

        // Add based on intent strength
        if (intent === "PRICE / DEAL INTENT") score += 30;
        if (intent === "PURCHASE VALIDATION INTENT") score += 25;
        if (intent === "REVIEW INTENT") score += 20;
        if (intent === "COMPARISON INTENT") score += 15;
        if (intent === "ALTERNATIVES INTENT") score += 10;

        // Add based on context indicators
        if (CONTEXT_INDICATORS.some(i => query.includes(i))) score += 15;

        // Cap at 100
        return Math.min(100, Math.max(1, score));
    }

    private extractContextIndicators(query: string): string[] {
        return CONTEXT_INDICATORS.filter(i => query.includes(i));
    }

    private generateTrafficBlueprint(query: string, intent: IntentType, stage: BuyingStage, score: number) {
        let pageType = "Standard Article";
        let h1 = `Guide to ${query}`;
        let outline: any[] = [];
        let cta = "Learn More";

        const year = new Date().getFullYear();

        switch (intent) {
            case "REVIEW INTENT":
                pageType = "In-Depth Review";
                h1 = `${this.capitalize(query)} Review (${year}): Is It Worth It?`;
                outline = [
                    { h2: "Verdict at a Glance (Pros & Cons)", type: "summary_box" },
                    { h2: "Key Features & Performance", type: "content" },
                    { h2: "Pricing & Value Analysis", type: "content" },
                    { h2: "Final Recommendation", type: "conclusion" }
                ];
                cta = "Check Current Price";
                break;

            case "COMPARISON INTENT":
                pageType = "Head-to-Head Comparison";
                h1 = `${this.capitalize(query)}: Which is Better in ${year}?`;
                outline = [
                    { h2: "Comparison Summary", type: "comparison_table" },
                    { h2: "Feature Differences", type: "content" },
                    { h2: "Pricing Showdown", type: "content" },
                    { h2: "Winner Declaration", type: "conclusion" }
                ];
                cta = "See the Winner";
                break;

            case "ALTERNATIVES INTENT":
                pageType = "Listicle / Round-up";
                h1 = `Top 5 ${this.capitalize(query)} for ${year}`;
                outline = [
                    { h2: "Why look for an alternative?", type: "intro" },
                    { h2: "Top Pick: [Competitor A]", type: "product_highlight" },
                    { h2: "Best Value: [Competitor B]", type: "product_highlight" },
                    { h2: "Summary Table", type: "comparison_table" }
                ];
                cta = "Try Top Alternative";
                break;

            case "PRICE / DEAL INTENT":
                pageType = "Deal Page / Coupon Hub";
                h1 = `Active ${this.capitalize(query)} for ${year}`;
                outline = [
                    { h2: "Verified Active Codes", type: "coupon_list" },
                    { h2: "How to Apply This Discount", type: "tutorial" },
                    { h2: "Expiry Warning", type: "alert" }
                ];
                cta = "Activate Deal Now";
                break;

            case "PURCHASE VALIDATION INTENT":
                pageType = "Trust Report";
                h1 = `Is ${this.capitalize(query.replace('legit', '').replace('scam', '').trim())} Legit? Safety Check`;
                outline = [
                    { h2: "Trust Score Analysis", type: "score_widget" },
                    { h2: "Red Flags to Watch For", type: "warning_list" },
                    { h2: "User Reviews Summary", type: "testimonials" },
                ];
                cta = "Visit Official Site";
                break;

            default:
                pageType = "Informational Guide";
                h1 = `Everything You Need to Know About ${this.capitalize(query)}`;
                outline = [
                    { h2: "Overview", type: "intro" },
                    { h2: "Key Details", type: "content" },
                    { h2: "Next Steps", type: "conclusion" }
                ];
                cta = "Get Started";
        }

        return {
            recommended_page_type: pageType,
            structure: {
                h1: h1,
                sections: outline
            },
            primary_cta: cta,
            monetization_method: score > 70 ? "Direct Affiliate Link" : "Lead Capture / Nurture"
        };
    }

    private determineOfferRouting(intent: IntentType, score: number) {
        if (score > 80) return "PRIORITY: High Ticket Internal Offer";
        if (intent === "PRICE / DEAL INTENT") return "Direct to Checkout / Coupon";
        if (intent === "ALTERNATIVES INTENT") return "Comparison Table -> Affiliate Link";
        return "Lead Magnet -> Email Sequence";
    }

    private capitalize(s: string) {
        return s.replace(/\b\w/g, c => c.toUpperCase());
    }
}
