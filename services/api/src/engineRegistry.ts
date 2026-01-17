import { EngineConfig, loadAllEngineConfigs } from "@signalengines/engine-config";
import path from "path";
import fs from "fs";
import { prisma } from "./lib/db";

class EngineRegistry {
    private engines: Map<string, EngineConfig> = new Map();
    private contentMaps: Map<string, any> = new Map();
    private initialized = false;

    public async initialize() {
        if (this.initialized) return;

        // More robust path resolution for Vercel vs Local
        const pathsToTry = [
            path.join(process.cwd(), "engines"),
            path.join(process.cwd(), "../../engines"), // Monorepo root from service
            path.join(__dirname, "../../../engines"), // From src/lib/.. or similar
            path.join(process.cwd(), "services/api/engines"),
            path.join(__dirname, "../engines"),
        ];

        const foundDirs: string[] = [];

        for (const p of pathsToTry) {
            try {
                if (fs.existsSync(p)) {
                    console.log(`Scanning engines at path: ${p}`);
                    foundDirs.push(p);

                    // Load from this directory
                    const engineDirs = fs.readdirSync(p);
                    for (const dir of engineDirs) {
                        const configPath = path.join(p, dir, "engine.json");
                        if (fs.existsSync(configPath)) {
                            try {
                                const raw = fs.readFileSync(configPath, 'utf8');
                                const json = JSON.parse(raw);
                                // We do a loose check or reuse Zod, but handle errors gracefully
                                this.engines.set(json.engine_id, json);

                                // Load content map if exists
                                const mapPath = path.join(p, dir, "content_map.json");
                                if (fs.existsSync(mapPath)) {
                                    const mapRaw = fs.readFileSync(mapPath, 'utf8');
                                    this.contentMaps.set(json.engine_id, JSON.parse(mapRaw));
                                }

                                console.log(`Loaded engine (FS): ${json.engine_id} from ${p}`);
                            } catch (e: any) {
                                console.error(`Failed to load engine ${dir} from ${p}: ${e.message}`);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn(`Error scanning path ${p}:`, e);
            }
        }

        if (foundDirs.length === 0) {
            console.error("CRITICAL: No engines directory found! Tried: " + pathsToTry.join(", "));
        }

        // 2. Load from Database (Overrides FS)
        try {
            // Check if DATABASE_URL is set if we were using a remote DB, 
            // but here we are using SQLite dev.db by default.

            const dbEngines = await prisma.engineDefinition.findMany({
                where: { status: 'active' }
            });

            for (const dbEngine of dbEngines) {
                try {
                    const engineData = JSON.parse(dbEngine.engineJson);
                    engineData.loadedFrom = "database"; // Tag it!
                    this.engines.set(dbEngine.engineId, engineData);
                    this.contentMaps.set(dbEngine.engineId, JSON.parse(dbEngine.contentMapJson));
                    console.log(`Loaded engine (DB): ${dbEngine.engineId}`);
                } catch (e) {
                    console.error(`Failed to parse engine ${dbEngine.engineId} from DB`, e);
                }
            }
        } catch (error: any) {
            console.warn("Engine Registry DB loading skipped. This is normal if no database is configured or migrations haven't run.", error?.message || error);
        }

        this.initialized = true;
    }

    public get(engineId: string): EngineConfig | undefined {
        return this.engines.get(engineId);
    }

    public getAll(): EngineConfig[] {
        return Array.from(this.engines.values());
    }

    public getContentMap(engineId: string): any | undefined {
        return this.contentMaps.get(engineId);
    }

    public list(): EngineConfig[] {
        return this.getAll();
    }

    // Helper to reload dynamically after batch create
    public async reload() {
        this.initialized = false;
        await this.initialize();
    }
}

export const engineRegistry = new EngineRegistry();
