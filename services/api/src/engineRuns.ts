import { prisma } from "./lib/db";
import { EngineConfig } from "@signalengines/engine-config";

// Helper to check daily limit
export async function checkRateLimit(engineId: string, userId?: string, anonymousId?: string) {
    if (userId) {
        // Logged in user: 3 runs/day
        const count = await getDailyCount(engineId, { userId });
        if (count >= 3) return false;
    } else if (anonymousId) {
        // Anonymous: 1 run/day
        const count = await getDailyCount(engineId, { anonymousId });
        if (count >= 1) return false; // Anonymous Limit = 1
    } else {
        // No ID? Block.
        return false;
    }
    return true;
}

async function getDailyCount(engineId: string, whereUser: { userId?: string, anonymousId?: string }) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Explicitly build filter
    const where: any = {
        engineId,
        createdAt: { gte: startOfDay }
    };
    if (whereUser.userId) where.userId = whereUser.userId;
    if (whereUser.anonymousId) where.anonymousId = whereUser.anonymousId;

    return await prisma.engineRun.count({ where });
}

// ------------------------------------------------------------------
// ENGINE LOGIC SIMULATION LAYER
// ------------------------------------------------------------------
const DEFAULT_SIMULATION = {
    risk: 60,
    causes: ["Unverified Account Status", "Incomplete Configuration"],
    steps: ["Verify your email address", "Complete your profile details", "Run the scan again with more data"]
};

// High-fidelity simulation responses for each engine
const ENGINES_SIMULATION: Record<string, any> = {
    "emailwarmup": {
        risk: 65,
        causes: ["Low Sending Volume", "Domain Age < 30 Days", "No SPF Record Found"],
        steps: [
            "Start an automated warmup campaign immediately.",
            "Verify your SPF, DKIM, and DMARC records.",
            "Send 10-20 manual emails to friends who will reply.",
            "Avoid sending images or attachments for 7 days.",
            "Check your domain against 50+ blacklists."
        ]
    },
    "tiktok-idea-batch": {
        risk: 10,
        causes: ["Consistent Posting Schedule", "High Engagement Hook", "Trending Audio"],
        steps: [
            "Concept 1: The Unpopular Opinion - Share a controversial take on your industry.",
            "Concept 2: Day in the Life - Show the chaos behind the main pain point.",
            "Concept 3: How to Fix - A 3-step tutorial solving a common problem.",
            "Concept 4: Reaction Video - React to a common bad practice in your industry.",
            "Concept 5: Storytime - Tell a customer success or failure story."
        ]
    },
    accountrecovery: {
        risk: 80,
        causes: ["Suspicious Login Activity", "AI-Flagged Behavior", "Failed 2FA Attempts"],
        steps: [
            "Do NOT pay anyone on Instagram/Twitter to 'hack' it back.",
            "Locate the original email used to create the account.",
            "Check for an email from the platform (including Spam) with a security warning.",
            "Identify if you have a trusted device still logged in.",
            "Use the official Identity Verification form linked in our full report."
        ]
    },
    adbleed: {
        risk: 45,
        causes: ["Audience Saturation", "Rising CPMs", "Overlap > 30%"],
        steps: [
            "Pause ads with Frequency > 3.5 immediately.",
            "Review placement report: turn off Audience Network if ROI is low.",
            "Check for overlapping audiences in your ad sets.",
            "Refresh creative for your top-spending ad set.",
            "Tighten age/gender targeting based on conversion data."
        ]
    },
    amazonsuspend: {
        risk: 90,
        causes: ["Section 3 Violation", "Dropshipping Policy", "Authenticity Complaint"],
        steps: [
            "Stop all fulfillment orders immediately.",
            "Identify the ASIN(s) triggering the complaint.",
            "Gather supply chain invoices for the last 365 days.",
            "Draft a Root Cause Analysis (do not blame Amazon).",
            "Prepare a Plan of Action using our template."
        ]
    },
    chargebackalert: {
        risk: 65,
        causes: ["Fraudulent Card Use", "Product Not Received", "Subscription Not Recognized"],
        steps: [
            "Refund the transaction immediately if it hasn't shipped.",
            "Contact the customer via email and phone to confirm intent.",
            "Gather tracking info showing delivery to the billing address.",
            "Check if the IP address matches the billing country.",
            "Prepare your dispute evidence file."
        ]
    },
    compliancealert: {
        risk: 40,
        causes: ["Missing GDPR Clause", "No Cookie Consent", "Absent Refund Policy"],
        steps: [
            "Add a visible 'Privacy Policy' link to your footer.",
            "Ensure your Refund Policy is not just 'No Refunds' (illegal in EU/UK).",
            "Add a cookie consent banner if targeting Europe.",
            "Verify your Terms of Service includes a limitation of liability.",
            "Update your contact page with a physical address."
        ]
    },
    domainblock: {
        risk: 85,
        causes: ["Listed on Spamhaus", "Malware Hosting Detected", "Phishing URL Pattern"],
        steps: [
            "Stop all outbound email marketing immediately.",
            "Scan your server for recent file changes (hacks).",
            "Check your domain on MxToolbox to confirm the list.",
            "Request delisting ONLY after fixing the root cause.",
            "Reply to the abuse report ticket if one exists."
        ]
    },
    emailspam: {
        risk: 70,
        causes: ["SPF Alignment Failed", "Domain Age < 30 Days", "Spam Trigger Words"],
        steps: [
            "Add a valid SPF record to your DNS.",
            "Set up DKIM signing in your email provider.",
            "Warm up the inbox: Send 20 emails/day to high-engagement contacts.",
            "Remove 'Free', 'Guarantee', and 'Cash' from subject lines.",
            "Check if your IP address is blacklisted."
        ]
    },
    fbadban: {
        risk: 95,
        causes: ["Circumventing Systems", "Unacceptable Business Practices", "ID Verification Failed"],
        steps: [
            "Do NOT create a fresh ad account (it will be linked and banned).",
            "Go to Account Quality (business.facebook.com/accountquality).",
            "Request a review of the Restricted Asset.",
            "Confirm your Business Manager admins are verified real people.",
            "Prepare your appeal letter focusing on compliance."
        ]
    },
    fbpagerestricted: {
        risk: 50,
        causes: ["Community Standards Violation", "Clickbait Content", "Feedback Score < 2"],
        steps: [
            "Delete any recent posts flagged for hate speech or nudity.",
            "Review your Page Feedback Score in the dashboard.",
            "Reply to pending customer comments to boost engagement.",
            "Disavow any unknown admins added recently.",
            "Request a review of the Page Restriction."
        ]
    },
    gbpsuspend: {
        risk: 88,
        causes: ["Address Discrepancy", "Keyword Stuffing in Name", "Duplicate Listing"],
        steps: [
            "Remove extra keywords from your Business Name (use real legal name).",
            "Verify your address matches your utility bills exactly.",
            "Delete any duplicate profiles at the same address.",
            "Photograph your permanent signage as proof.",
            "Submit the Reinstatement Form (do not create a new profile)."
        ]
    },
    merchantsuspend: {
        risk: 92,
        causes: ["Misrepresentation Policy", "Unsuccessful Authorization", "Prohibited Items"],
        steps: [
            "Ensure a physical address and phone number are in the footer.",
            "Verify the checkout process is secure (HTTPS).",
            "Remove any claims of 'Cures' or 'Miracles' from product desc.",
            "Match the shipping policy on the site to the feed data.",
            "Request a review in Google Merchant Center."
        ]
    },
    reviewrepair: {
        risk: 30,
        causes: ["Customer Service Failure", "Slow Shipping", "Product Quality"],
        steps: [
            "Reply publicly within 24 hours.",
            "Acknowledge their frustration (even if they are wrong).",
            "Offer to take the conversation offline (provide support email).",
            "Do not be defensive or argue details publicly.",
            "Flag the review if it violates Hate Speech policies."
        ]
    },
    sitehacked: {
        risk: 99,
        causes: ["WordPress Plugin Exploit", "Weak Admin Password", "SQL Injection"],
        steps: [
            "Put the site in Maintenance Mode immediately.",
            "Change all Admin, FTP, and Database passwords.",
            "Restore from a backup created before the infection date.",
            "Install Wordfence or similar security plugin to scan files.",
            "Update all themes and plugins to the latest version."
        ]
    },
    trackingfix: {
        risk: 60,
        causes: ["Event Deduplication Error", "Missing Purchase Currency", "Pixel Blocked by Browser"],
        steps: [
            "Install the Facebook Pixel Helper extension to debug.",
            "Ensure 'Event ID' is sent with both Browser and Server events.",
            "Verify currency codes match your ad account (e.g. USD).",
            "Check if the Pixel is firing twice on page load.",
            "Implement Conversions API (CAPI) for better accuracy."
        ]
    }
};

export async function executeEngineRun(
    engine: EngineConfig,
    inputs: any,
    user?: any,
    anonymousId?: string
) {
    const userId = user?.id ? (user.id as string) : undefined;

    // 1. Rate Limit
    const allowed = await checkRateLimit(engine.engine_id, userId, anonymousId);
    if (!allowed) {
        throw new Error("RATE_LIMIT_EXCEEDED");
    }

    // 2. Mock Logic (Engine-Aware Simulation)
    const sim = ENGINES_SIMULATION[engine.engine_id] || DEFAULT_SIMULATION;
    
    // Add jitter to risk score (+/- 5) to feel dynamic
    const jitter = Math.floor(Math.random() * 10) - 5;
    const finalRisk = Math.min(100, Math.max(0, sim.risk + jitter));

    const freeOutput = {
        risk_score: finalRisk,
        likely_causes: sim.causes,
        first_5_steps: sim.steps
    };

    // 3. Persist
    const run = await prisma.engineRun.create({
        data: {
            engineId: engine.engine_id,
            userId: userId || null,
            anonymousId: userId ? null : anonymousId,
            inputs: JSON.stringify(inputs ?? {}),
            status: "COMPLETED",
            output: {
                create: {
                    freeOutput: JSON.stringify(freeOutput)
                }
            }
        },
        include: { output: true }
    });

    // 4. Track Event
    await prisma.event.create({
        data: {
            type: "scan_completed",
            engineId: engine.engine_id,
            userId: userId || null,
            anonymousId: userId ? null : anonymousId,
            meta: JSON.stringify({ runId: run.id })
        }
    });

    return run;
}

export async function getRun(runId: string, user?: any, anonymousId?: string) {
    const run = await prisma.engineRun.findUnique({
        where: { id: runId },
        include: { output: true }
    });

    if (!run) return null;

    if (user && run.userId === user.id) return run;

    if (!user && anonymousId && run.anonymousId === anonymousId) return run;

    return null;
}
