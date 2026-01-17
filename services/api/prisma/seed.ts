import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Dynamic Engine Seeding ---');

    // Folders to scan
    const enginePaths = [
        path.join(process.cwd(), 'engines'),
        path.join(process.cwd(), 'services/api/engines')
    ];

    const processedIds = new Set<string>();

    for (const baseDir of enginePaths) {
        if (!fs.existsSync(baseDir)) continue;
        console.log(`Scanning: ${baseDir}`);

        const dirs = fs.readdirSync(baseDir);
        for (const dirName of dirs) {
            const configPath = path.join(baseDir, dirName, 'engine.json');
            if (fs.existsSync(configPath)) {
                try {
                    const configRaw = fs.readFileSync(configPath, 'utf8');
                    const config = JSON.parse(configRaw);
                    const engineId = config.engine_id;

                    if (!engineId) {
                        console.warn(`[SKIP] No engine_id in ${configPath}`);
                        continue;
                    }

                    // Content Map
                    const mapPath = path.join(baseDir, dirName, 'content_map.json');
                    let contentMap = "{}";
                    if (fs.existsSync(mapPath)) {
                        contentMap = fs.readFileSync(mapPath, 'utf8');
                    }

                    // Prepare for DB (Ensure all required fields exist for legacy compat)
                    const engineData = {
                        ...config,
                        subdomain: config.subdomain || engineId.split('-')[0],
                        launchUrl: config.launchUrl || config.url || `https://${engineId}.signalengines.com`,
                        pricing: config.pricing || { emergency: 0, full: 0, monthly: 0 },
                        inputs: config.inputs || [],
                        scoring_rules: config.scoring_rules || { base_risk: 50 },
                        free_output_sections: config.free_output_sections || [],
                        paid_output_sections: config.paid_output_sections || []
                    };

                    await prisma.engineDefinition.upsert({
                        where: { engineId },
                        update: {
                            engineJson: JSON.stringify(engineData),
                            contentMapJson: contentMap,
                            updatedAt: new Date()
                        },
                        create: {
                            engineId,
                            engineJson: JSON.stringify(engineData),
                            contentMapJson: contentMap,
                            status: "active"
                        }
                    });

                    console.log(`[DONE] Upserted: ${engineId}`);
                    processedIds.add(engineId);
                } catch (e: any) {
                    console.error(`[ERROR] Failed to seed ${dirName}: ${e.message}`);
                }
            }
        }
    }

    console.log(`Seeding complete. Total engines: ${processedIds.size}`);

    console.log('\n--- Initializing SEO Schedules ---');
    for (const engineId of processedIds) {
        const existing = await prisma.seoSchedule.findUnique({ where: { engineId } });
        if (!existing) {
            const dayOfWeek = Math.floor(Math.random() * 7);
            const hour = 9 + Math.floor(Math.random() * 8);

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
                    createdBy: 'system-seed'
                }
            });
            console.log(`[INIT] Schedule created for: ${engineId}`);
        } else {
            console.log(`[SKIP] Schedule already exists for: ${engineId}`);
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
