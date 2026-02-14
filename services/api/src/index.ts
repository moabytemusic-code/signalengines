import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { engineRegistry } from "./engineRegistry";
import {
    authMiddleware,
    generateMagicLinkToken,
    verifyMagicLinkToken,
    createSession,
    AuthRequest
} from "./auth";
import { executeEngineRun, getRun } from "./engineRuns";
import { prisma } from "./lib/db";
import { addOrUpdateContact } from "./lib/brevo";

dotenv.config();


// Initialize Registry
import { PathRegistry } from "@signalengines/engine-config";
import { BuyerIntentPath } from "./paths/BuyerIntentPath";

import { CompetitorLeakPath } from "./paths/CompetitorLeakPath";
import { AffiliateLeadPath } from "./paths/AffiliateLeadPath";
import { OfferMatchPath } from "./paths/OfferMatchPath";

(async () => {
    try {
        await engineRegistry.initialize();

        // Register Paths
        PathRegistry.register(new BuyerIntentPath());
        PathRegistry.register(new CompetitorLeakPath());
        PathRegistry.register(new AffiliateLeadPath());
        PathRegistry.register(new OfferMatchPath());
        console.log("Path Engines Registered: ", PathRegistry.list().map(p => p.id));
    } catch (e) {
        console.error("FATAL: Engine Registry initialization failed on boot.", e);
    }
})();

const app = express();
const port = process.env.PORT || 4005;

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production') return callback(null, true);

        const allowedOrigins = [
            "https://signalengines.com",
            "https://hub.signalengines.com",
            "https://engine-app.vercel.app",
            "https://signalengines.vercel.app",
        ];

        if (
            allowedOrigins.includes(origin) ||
            /^https:\/\/.*\.signalengines\.com$/.test(origin) ||
            /^https:\/\/.*\.smarthustlermarketing\.com$/.test(origin) ||
            origin === "https://smarthustlermarketing.com" ||
            /^https:\/\/.*\.vercel\.app$/.test(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

import { createCheckoutSession, createPortalSession } from "./billing";
import { handleStripeWebhook } from "./webhooks";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware as any);
import { adminRouter } from "./admin";
app.use("/admin", adminRouter);

app.post("/billing/checkout", async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const { engine_id, product, success_url, cancel_url } = req.body;
    try {
        const url = await createCheckoutSession(req.user.id, engine_id, product, success_url, cancel_url);
        res.json({ checkout_url: url });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.post("/billing/portal", async (req: AuthRequest, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const { return_url } = req.body;
    try {
        const url = await createPortalSession(req.user.id, return_url);
        res.json({ portal_url: url });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

app.get("/", async (req, res) => {
    let dbStatus = "Connecting...";
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = "Connected ✅";
    } catch (e) {
        dbStatus = "Disconnected ❌";
    }

    const dbUrl = process.env.DATABASE_URL || "";
    const dbType = dbUrl.startsWith("postgres") ? "PostgreSQL (Supabase)" : "SQLite (Local)";

    res.send(`
        <div style="font-family: sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px;">
            <h1 style="color: #0c4a6e;">Signal Engines API (V4)</h1>
            <p style="color: #64748b;">Status: <strong>Running</strong></p>
            <p style="color: #64748b;">Database: <strong>${dbStatus}</strong> (${dbType})</p>
            <hr style="border: 0; border-top: 1px solid #bae6fd; margin: 2rem 0;">
            <div style="font-size: 0.875rem; color: #075985;">
                <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
                <p>Engines Loaded: ${engineRegistry.getAll().length}</p>
                <p>Root Dir (CWD): ${process.cwd()}</p>
                <p>Last Sync: ${new Date().toISOString()}</p>
            </div>
        </div>
    `);
});

app.get("/public/engine", (req, res) => {
    res.redirect("/public/engines");
});

app.get("/public/engines", (req, res) => {
    const engines = engineRegistry.list().map(e => ({
        engine_id: e.engine_id,
        engine_name: e.engine_name,
        subdomain: e.subdomain,
        url: (e as any).launchUrl || (e as any).url,
        launchUrl: (e as any).launchUrl,
        category: (e as any).category,
        primary_keyword: e.primary_keyword,
        seo: e.seo
    }));
    res.json(engines);
});

app.get("/public/engines/:id", (req, res) => {
    const engine = engineRegistry.get(req.params.id);
    if (!engine) {
        res.status(404).json({ error: "Engine not found" });
        return;
    }
    const { scoring_rules, ...sanitized } = engine;
    res.json(sanitized);
});

app.get("/public/sync/engines", (req, res) => {
    // Explicit endpoint for SmartHustler Sync
    const engines = engineRegistry.list().map(e => ({
        id: e.engine_id,
        name: e.engine_name,
        description: e.seo?.description || e.shortDescription,
        category: (e as any).category,
        url: (e as any).launchUrl || (e as any).url,
        status: (e as any).status || "live",
        images: {
            // Placeholder for future logic if we want to serve dynamic OG images from here
            og: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.signalengines.com'}/public/og/${e.engine_id}.jpg`
        }
    }));

    res.json({
        synced_at: new Date().toISOString(),
        count: engines.length,
        engines
    });
});

app.get("/public/articles", async (req, res) => {
    try {
        const { engine_id, limit } = req.query;
        const take = limit ? parseInt(limit as string) : 50;
        const where: any = { published: true };
        if (engine_id) where.engineId = engine_id;

        const articles = await prisma.seoPage.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            take,
            select: {
                slug: true,
                title: true,
                description: true,
                engineId: true,
                updatedAt: true
            }
        });
        res.json(articles);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/public/articles/:slug", async (req, res) => {
    try {
        const article = await prisma.seoPage.findFirst({
            where: {
                slug: req.params.slug,
                published: true
            }
        });
        if (!article) return res.status(404).json({ error: "Article not found" });
        res.json(article);
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.post("/auth/request-link", async (req, res) => {
    const { email, engine_id, return_to } = req.body;

    if (!email || !engine_id) {
        res.status(400).json({ error: "Missing email or engine_id" });
        return;
    }

    try {
        const token = generateMagicLinkToken(email);

        const baseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;
        let link = `${baseUrl}/auth/verify?token=${token}`;
        if (return_to) {
            link += `&return_to=${encodeURIComponent(return_to)}`;
        }

        await prisma.emailCapture.create({
            data: {
                email,
                engineId: engine_id,
                source: "magic_link_request"
            }
        });

        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: "Signal Engines <login@signalengines.com>",
                to: email,
                subject: "Your Login Link - Signal Engines",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #111;">Login to Signal Engines</h1>
                        <p>Click the link below to verify your email and access your dashboard engine:</p>
                        <a href="${link}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login now</a>
                        <p style="color: #666; font-size: 14px; margin-top: 24px;">Or copy this link: <br>${link}</p>
                    </div>
                `
            });
            console.log(`[INFO] Email sent to ${email}`);
            res.json({ success: true, message: "Login link sent to your email!" });
        } else {
            console.log(`[DEV] Magic Link: ${link}`);
            res.json({ success: true, message: "Link sent (check console)" });
        }
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/auth/verify", async (req, res) => {
    const { token, return_to } = req.query;
    if (!token || typeof token !== 'string') {
        res.status(400).send("Invalid token");
        return;
    }

    const email = verifyMagicLinkToken(token);
    if (!email) {
        res.status(400).send("Expired or invalid token");
        return;
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = await prisma.user.create({ data: { email } });
        // Add to Brevo
        try {
            await addOrUpdateContact(email, "free");
        } catch (err) {
            console.error('[Brevo] Sync failed on signup:', err);
        }
    }

    await createSession(user.id, res);

    const hubUrl = process.env.HUB_URL || "http://localhost:3006";
    res.redirect((return_to as string) || hubUrl);
});

app.get("/me", (req: AuthRequest, res) => {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    res.json(req.user);
});

app.post("/auth/create-session", async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        res.status(400).json({ error: "userId required" });
        return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    // Create session
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
        data: {
            userId,
            token,
            expiresAt
        }
    });

    res.json({ sessionToken: token });
});


app.post("/engines/:id/run", async (req: AuthRequest, res) => {
    const engineId = req.params.id as string;
    const { inputs } = req.body;
    const engine = engineRegistry.get(engineId);

    if (!engine) {
        res.status(404).json({ error: "Engine not found" });
        return;
    }

    try {
        const run = await executeEngineRun(
            engine,
            inputs,
            req.user,
            req.anonymousId
        );

        const freeOutRaw = run.output?.freeOutput;
        const freeOut = typeof freeOutRaw === 'string' ? JSON.parse(freeOutRaw) : freeOutRaw;

        let isPremium = false;
        if (req.user) {
            const ent = await prisma.entitlement.findUnique({ where: { userId: req.user.id } });
            if (ent?.isPremium) isPremium = true;
            const engEnt = await prisma.engineEntitlement.findUnique({
                where: { userId_engineId: { userId: req.user.id, engineId: engineId } }
            });
            if (engEnt?.hasAccess) isPremium = true;
        }

        res.json({
            run_id: run.id,
            free_output: freeOut,
            paid_output: null,
            access: { premium: isPremium }
        });

    } catch (e: any) {
        if (e.message === "RATE_LIMIT_EXCEEDED") {
            res.status(429).json({ error: "Daily limit reached. Please upgrade." });
            return;
        }
        console.error(e);
        res.status(500).json({ error: "Internal Error" });
    }
});

app.get("/runs/:id", async (req: AuthRequest, res) => {
    const run = await getRun(req.params.id as string, req.user, req.anonymousId);

    if (!run) {
        res.status(404).json({ error: "Run not found" });
        return;
    }

    let isPremium = false;
    if (run.userId) {
        const ent = await prisma.entitlement.findUnique({ where: { userId: run.userId } });
        if (ent?.isPremium) isPremium = true;
        const engEnt = await prisma.engineEntitlement.findUnique({
            where: { userId_engineId: { userId: run.userId, engineId: run.engineId } }
        });
        if (engEnt?.hasAccess) isPremium = true;
    }

    const freeOutRaw = run.output?.freeOutput;
    const freeOut = typeof freeOutRaw === 'string' ? JSON.parse(freeOutRaw) : freeOutRaw;

    let paidOut = null;
    if (isPremium && run.output?.paidOutput) {
        const paidRaw = run.output.paidOutput;
        paidOut = typeof paidRaw === 'string' ? JSON.parse(paidRaw) : paidRaw;
    }

    res.json({
        run_id: run.id,
        engine_id: run.engineId,
        free_output: freeOut,
        paid_output: paidOut,
        access: { premium: isPremium }
    });
});

app.get("/account/entitlements", async (req: AuthRequest, res) => {
    if (!req.user) {
        res.json({ isPremium: false, maxRunsPerDay: 3, engineEntitlements: [] });
        return;
    }

    const ent = await prisma.entitlement.findUnique({ where: { userId: req.user.id } });
    const engEnts = await prisma.engineEntitlement.findMany({ where: { userId: req.user.id } });

    res.json({
        isPremium: ent?.isPremium || false,
        maxRunsPerDay: ent?.maxRunsPerDay || 3,
        engineEntitlements: engEnts.map(e => ({ engineId: e.engineId, hasAccess: e.hasAccess }))
    });
});

app.get("/account/runs", async (req: AuthRequest, res) => {
    if (!req.user) {
        res.json([]);
        return;
    }
    const limit = parseInt(req.query.limit as string) || 20;
    const runs = await prisma.engineRun.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
            id: true,
            engineId: true,
            createdAt: true,
            status: true
        }
    });

    res.json(runs);
});

export default app;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`API listening at http://localhost:${port}`);
    });
}
