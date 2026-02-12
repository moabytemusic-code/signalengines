import { prisma } from "./lib/db";
import { EngineConfig, PathRegistry, PathContext, PathResult } from "@signalengines/engine-config";

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
// Default Paid Content (Fallback)
const DEFAULT_PAID_CONTENT = {
    action_plan: [
        "Step 1: Log into your account dashboard and navigate to settings.",
        "Step 2: Locate the compliance or appeal form linked in the Resources section.",
        "Step 3: Submit the provided appeal template, ensuring you fill in your specific case ID.",
        "Step 4: wait 24-48 hours for a response before submitting again."
    ],
    templates: [
        {
            title: "Standard Appeal",
            content: "Dear Support Team,\n\nI believe my account was flagged in error. I have reviewed the policies and confirmed that my [Specific Content/Action] follows all guidelines.\n\nPlease review this decision.\n\nSincerely,\n[Your Name]"
        }
    ],
    checklist: [
        "Review Terms of Service",
        "Check 3rd party tool permissions",
        "Update Contact Information"
    ]
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
        ],
        paid: {
            action_plan: [
                "Phase 1 (Day 1-3): Manual Warmup. Send 10 emails/day to known contacts (colleagues, personal accounts) and ensure they REPLY.",
                "Phase 2 (Day 4-7): Setup SPF/DKIM. Use the checklist below to verify your DNS settings.",
                "Phase 3 (Day 8+): Gradual Ramp. Increase volume by max 20% per day. Use a dedicated warmup tool like Lemwarm or Instantly.",
                "CRITICAL: If you are on a blacklist (Spamhaus), do NOT send any cold emails until delisted."
            ],
            templates: [
                {
                    title: "Blacklist Delisting Request",
                    content: "Subject: Delisting Request for IP [Your IP Address]\n\nHello Abuse Team,\n\nWe have identified a configuration error that caused a spike in complaints. This has been resolved by implementing strict double opt-in validation.\n\nPlease review our remediation and delist our IP.\n\nThank you,\n[Your Name]"
                },
                {
                    title: "ISP Support Request",
                    content: "Hello [Provider],\n\nMy emails to [Domain] are landing in spam. I have verified my SPF and DKIM records are valid (see headers attached).\n\nCan you please check the reputation status of my domain?\n\nDomain: [Your Domain]\nIP: [Your IP]\n\nThanks!"
                }
            ],
            checklist: [
                "SPF Record is valid (v=spf1 ...)",
                "DKIM Signatures are passing",
                "DMARC policy is set to at least 'none' (monitoring)",
                "Reverse DNS (rDNS) matches hostname",
                "Not listed on Spamhaus or Barracuda"
            ]
        }
    },
    // ... (Keep other simple engines same, they will fallback to DEFAULT_PAID_CONTENT if accessed)
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
    // ... keep rest ...
};

// ... (existing code for other engines omitted for brevity in replacement, assume valid JS merge)

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
    const sim = ENGINES_SIMULATION[engine.engine_id] || (ENGINES_SIMULATION[engine.engine_id] = DEFAULT_SIMULATION); // Fallback fix

    // Add jitter to risk score (+/- 5) to feel dynamic
    const jitter = Math.floor(Math.random() * 10) - 5;
    const finalRisk = Math.min(100, Math.max(0, (sim.risk || 60) + jitter));

    const freeOutput = {
        risk_score: finalRisk,
        likely_causes: sim.causes || DEFAULT_SIMULATION.causes,
        first_5_steps: sim.steps || DEFAULT_SIMULATION.steps
    };

    const paidOutput = sim.paid || DEFAULT_PAID_CONTENT;

    // 3. Execute Paths (if any)
    const pathResults: Record<string, PathResult> = {};
    const enabledPaths = engine.paths || [];

    // Allow input to override/add paths if needed (e.g. checkbox in UI)
    if (inputs?.enabledPaths && Array.isArray(inputs.enabledPaths)) {
        // Merge or replace based on logic. For now, let's append unique.
        const inputPaths = inputs.enabledPaths as string[];
        inputPaths.forEach(p => {
            if (!enabledPaths.includes(p)) enabledPaths.push(p);
        });
    }

    if (enabledPaths.length > 0) {
        // Context for paths
        const context: PathContext = {
            signal: inputs,
            config: engine,
            user: user,
            previousResults: pathResults
        };

        for (const pathId of enabledPaths) {
            const pathEngine = PathRegistry.get(pathId);
            if (pathEngine) {
                try {
                    if (pathEngine.canHandle(context)) {
                        const result = await pathEngine.execute(context);
                        pathResults[pathId] = result;
                        // Update context for next path in chain
                        context.previousResults = { ...pathResults };

                        // CREDIT DEDUCTION LOGIC
                        if (pathId === "affiliate_lead_path" && result.data?.count > 0 && user) {
                            // Example: 1 credit per lead
                            const cost = result.data.count;
                            console.log(`[Billing] Deducting ${cost} credits for ${pathId} from User ${user.id}`);
                            // await prisma.user.update({ where: { id: user.id }, data: { credits: { decrement: cost } } });
                        }
                    }
                } catch (error) {
                    console.error(`Path ${pathId} failed:`, error);
                    pathResults[pathId] = {
                        data: null,
                        meta: { error: String(error) }
                    };
                }
            } else {
                console.warn(`Path engine ${pathId} not found in registry.`);
            }
        }
    }

    // Merge path results into paidOutput or keep separate?
    // For now, attach to a new field 'path_results' in the JSON
    const finalPaidOutput = {
        ...paidOutput,
        path_results: pathResults
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
                    freeOutput: JSON.stringify(freeOutput),
                    paidOutput: JSON.stringify(finalPaidOutput)
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
