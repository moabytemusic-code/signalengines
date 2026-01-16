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

adminRouter.get("/seo/schedules", async (req: AuthRequest, res) => {
    const schedules = await prisma.seoSchedule.findMany({
        include: { runs: { orderBy: { createdAt: 'desc' }, take: 20 } }
    });
    res.json(schedules);
});
