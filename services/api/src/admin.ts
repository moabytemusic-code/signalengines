import express from "express";
import { prisma } from "./lib/db";
import { generateSeoPages, publishJob } from "./lib/seoGenerator";
import { AuthRequest } from "./auth";
import { engineRegistry } from "./engineRegistry";

export const adminRouter = express.Router();

const schedulerTickHandler = async (req: any, res: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const cronSecret = process.env.CRON_SECRET || "dev-secret-123";
    const isVercelCron = req.headers['x-vercel-cron'] === '1';

    if (token !== cronSecret && !isVercelCron) {
        return res.status(401).send("Unauthorized Scheduler");
    }

    try {
        const now = new Date();
        const dueSchedules = await prisma.seoSchedule.findMany({
            where: {
                isEnabled: true,
                nextRunAt: { lte: now }
            }
        });

        const results = [];
        for (const schedule of dueSchedules) {
            try {
                const job = await prisma.seoGenerationJob.create({
                    data: {
                        engineId: schedule.engineId,
                        mode: schedule.mode,
                        dryRun: schedule.dryRun,
                        overwrite: true,
                        status: 'PENDING',
                        resultJson: '[]',
                        createdBy: 'SCHEDULER'
                    }
                });

                await generateSeoPages(job.id);

                let publishedCount = 0;
                if (schedule.autoPublish && !schedule.dryRun) {
                    const published = await publishJob(job.id);
                    publishedCount = published.length;
                }

                await prisma.seoScheduleRun.create({
                    data: {
                        scheduleId: schedule.id,
                        engineId: schedule.engineId,
                        status: 'SUCCESS',
                        jobId: job.id,
                        publishedCount,
                        finishedAt: new Date()
                    }
                });

                const nextRun = new Date(schedule.nextRunAt || now);
                nextRun.setDate(nextRun.getDate() + 7);

                await prisma.seoSchedule.update({
                    where: { id: schedule.id },
                    data: {
                        lastRunAt: now,
                        nextRunAt: nextRun
                    }
                });

                results.push({ engineId: schedule.engineId, status: 'SUCCESS', publishedCount });
            } catch (e: any) {
                console.error(`Scheduler error for ${schedule.engineId}`, e);
                results.push({ engineId: schedule.engineId, status: 'FAILED', error: e.message });
            }
        }

        res.json({ processed: dueSchedules.length, results });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

adminRouter.all("/seo/scheduler/tick", schedulerTickHandler);

// Init Endpoint
adminRouter.post("/seo/scheduler/init", async (req: AuthRequest, res) => {
    try {
        const engines = engineRegistry.list();
        const results = [];
        let created = 0;

        for (const engine of engines) {
            const engineId = engine.engine_id;
            const existing = await prisma.seoSchedule.findUnique({ where: { engineId } });

            if (!existing) {
                const dayOfWeek = Math.floor(Math.random() * 7);
                const hour = 9 + Math.floor(Math.random() * 8); // 9-17 UTC

                const nextRun = new Date();
                nextRun.setUTCHours(hour, 0, 0, 0);
                const currentDay = nextRun.getUTCDay();
                let diff = dayOfWeek - currentDay;
                if (diff <= 0) diff += 7;
                nextRun.setUTCDate(nextRun.getUTCDate() + diff);

                await prisma.seoSchedule.create({
                    data: {
                        engineId,
                        isEnabled: true,
                        dayOfWeek,
                        hour,
                        timezone: 'UTC',
                        pagesPerRun: 1,
                        autoPublish: true,
                        dryRun: false,
                        nextRunAt: nextRun,
                        mode: 'standard_5',
                        createdBy: req.user?.id || 'system-init'
                    }
                });
                results.push({ engineId, status: 'created', nextRun });
                created++;
            } else {
                results.push({ engineId, status: 'exists' });
            }
        }
        res.json({ success: true, created, total: engines.length, results });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRouter.use((req: AuthRequest, res, next) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    next();
});

// Batch Create Engines
adminRouter.post("/engines/batch-create", async (req: AuthRequest, res) => {
    const { engines, dry_run, overwrite, generate_pages, publish_pages } = req.body;
    const results = [];
    const generated_jobs = [];

    if (!Array.isArray(engines)) {
        return res.status(400).json({ error: "Engines must be an array" });
    }

    for (const item of engines) {
        try {
            let engineId = "";
            let customConfig: any = null;

            if (typeof item === 'string') {
                engineId = item;
            } else if (item && typeof item === 'object') {
                engineId = item.engine_id || item.id;
                customConfig = item;
            }

            if (!engineId) {
                results.push({ success: false, error: "No engineId found", input: item });
                continue;
            }

            // check if exists
            const existing = await prisma.engineDefinition.findUnique({ where: { engineId } });
            if (existing && !overwrite) {
                results.push({ success: true, engineId, status: "exists", dry_run });
                continue;
            }

            // Default Config (Merged with custom if provided)
            const engineConfig = {
                engine_id: engineId,
                engine_name: customConfig?.engine_name || customConfig?.name || engineId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
                subdomain: customConfig?.subdomain || engineId.split('-')[0],
                launchUrl: customConfig?.launchUrl || customConfig?.url || `https://${engineId}.signalengines.com`,
                category: customConfig?.category || "Diagnostic",
                primary_keyword: customConfig?.primary_keyword || engineId.replace(/-/g, ' '),
                seo: {
                    title: customConfig?.seo?.title || `${engineId} Dashboard`,
                    description: customConfig?.seo?.description || `Instant diagnostic and fix plan for ${engineId}.`,
                    h1: customConfig?.seo?.h1 || engineId
                },
                inputs: customConfig?.inputs || [],
                scoring_rules: customConfig?.scoring_rules || { base_risk: 50 },
                free_output_sections: [],
                paid_output_sections: [],
                pricing: { emergency: 0, full: 0, monthly: 0 },
                cross_sell_engines: []
            };

            if (!dry_run) {
                await prisma.engineDefinition.upsert({
                    where: { engineId },
                    update: {
                        engineJson: JSON.stringify(engineConfig),
                        updatedAt: new Date()
                    },
                    create: {
                        engineId,
                        engineJson: JSON.stringify(engineConfig),
                        contentMapJson: "{}",
                        status: "active",
                        createdBy: req.user?.id
                    }
                });

                if (generate_pages) {
                    const job = await prisma.seoGenerationJob.create({
                        data: {
                            engineId,
                            mode: 'standard_5',
                            dryRun: false,
                            overwrite: overwrite || false,
                            status: 'PENDING',
                            resultJson: '[]',
                            createdBy: req.user?.id
                        }
                    });

                    // Trigger Generation (this updates registry but gen runs as well)
                    // We don't await gen here to keep batch responsive, but we collect jobId
                    generateSeoPages(job.id).then(async () => {
                        if (publish_pages) {
                            await publishJob(job.id);
                        }
                    }).catch(console.error);

                    generated_jobs.push({ engineId, jobId: job.id });
                }
            }

            results.push({ success: true, engineId, dry_run, config_preview: engineConfig });

        } catch (e: any) {
            results.push({ success: false, engineId: item, error: e.message });
        }
    }

    if (!dry_run) {
        await engineRegistry.reload();
    }

    res.json({ success: true, results, generated_jobs });
});

// Basic Job Endpoints
adminRouter.post("/seo/generate", async (req: AuthRequest, res) => {
    const { engine_id, mode, dry_run, overwrite } = req.body;
    try {
        const job = await prisma.seoGenerationJob.create({
            data: {
                engineId: engine_id,
                mode: mode || 'standard_5',
                dryRun: dry_run ?? true,
                overwrite: overwrite ?? false,
                status: 'PENDING',
                resultJson: '[]',
                createdBy: req.user?.id
            }
        });
        generateSeoPages(job.id).catch(err => console.error("SEO Gen Error", err));
        res.json({ job_id: job.id });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRouter.get("/seo/jobs/:id", async (req: AuthRequest, res) => {
    const job = await prisma.seoGenerationJob.findUnique({ where: { id: req.params.id as string } });
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
});

adminRouter.post("/seo/jobs/:id/publish", async (req: AuthRequest, res) => {
    try {
        const publishedSlugs = await publishJob(req.params.id as string);
        res.json({ success: true, published_pages: publishedSlugs });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

adminRouter.get("/seo/pages", async (req: AuthRequest, res) => {
    const { engine_id } = req.query;
    const pages = await prisma.seoPage.findMany({
        where: engine_id ? { engineId: engine_id as string } : {},
        orderBy: { updatedAt: 'desc' }
    });
    res.json(pages);
});

adminRouter.post("/seo/pages/regenerate", async (req: AuthRequest, res) => {
    const { engine_id, publish } = req.body;
    if (!engine_id) return res.status(400).json({ error: "Missing engine_id" });

    try {
        const job = await prisma.seoGenerationJob.create({
            data: {
                engineId: engine_id,
                mode: 'standard_5',
                dryRun: false,
                overwrite: true,
                status: 'PENDING',
                resultJson: '[]',
                createdBy: req.user?.id
            }
        });

        await generateSeoPages(job.id);

        if (publish) {
            await publishJob(job.id);
        }

        res.json({ success: true, job_id: job.id });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

adminRouter.get("/seo/schedules", async (req: AuthRequest, res) => {
    const schedules = await prisma.seoSchedule.findMany({
        include: { runs: { orderBy: { createdAt: 'desc' }, take: 20 } }
    });
    res.json(schedules);
});
