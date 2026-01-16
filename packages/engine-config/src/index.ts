import { z } from "zod";
import fs from "fs";
import path from "path";

// Define Zod Schema
export const EngineSeoSchema = z.object({
    title: z.string(),
    description: z.string(),
    h1: z.string(),
    primary_color: z.string().optional(),
});

export const EngineInputSchema = z.object({
    id: z.string(),
    type: z.enum(["text", "url", "select", "textarea"]),
    label: z.string(),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional(),
    required: z.boolean().optional(),
    validation: z.string().optional(), // regex string
});

export const ScoringRuleSchema = z.object({
    id: z.string().optional(),
    type: z.enum(["keyword_match", "logic", "condition"]).optional(),
    field: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    condition: z.string().optional(),
    score: z.number().optional().default(0),
    // legacy support fields from Phase A if needed, or strict
    score_impact: z.number().optional(),
    message: z.string().optional(),
});

export const EnginePricingSchema = z.object({
    emergency: z.number(),
    full: z.number(),
    monthly: z.number(),
});

export const EngineConfigSchema = z.object({
    engine_id: z.string(),
    engine_name: z.string(),
    subdomain: z.string(),
    primary_keyword: z.string(),
    secondary_keywords: z.array(z.string()),
    seo: EngineSeoSchema,
    inputs: z.array(EngineInputSchema),
    scoring_rules: z.array(ScoringRuleSchema),
    free_output_sections: z.array(z.string()),
    paid_output_sections: z.array(z.string()),
    pricing: EnginePricingSchema,
    cross_sell_engines: z.array(z.string()),
});

// TypeScript Types derived from Zod
export type EngineConfig = z.infer<typeof EngineConfigSchema>;
export type EngineInput = z.infer<typeof EngineInputSchema>;
export type EnginePricing = z.infer<typeof EnginePricingSchema>;
export type EngineSeo = z.infer<typeof EngineSeoSchema>;

// Loader Functions
export function loadEngineConfig(enginePath: string): EngineConfig {
    const content = fs.readFileSync(enginePath, "utf-8");
    const json = JSON.parse(content);
    return EngineConfigSchema.parse(json);
}

export function loadAllEngineConfigs(enginesRootDir: string): Record<string, EngineConfig> {
    const configs: Record<string, EngineConfig> = {};

    if (!fs.existsSync(enginesRootDir)) {
        throw new Error(`Engines directory not found at ${enginesRootDir}`);
    }

    const engineDirs = fs.readdirSync(enginesRootDir);

    for (const dir of engineDirs) {
        const configPath = path.join(enginesRootDir, dir, "engine.json");
        if (fs.existsSync(configPath)) {
            try {
                const config = loadEngineConfig(configPath);
                configs[config.engine_id] = config;
            } catch (error) {
                console.error(`Failed to load config for engine ${dir}:`, error);
                throw error; // Fail fast as requested
            }
        }
    }
    return configs;
}

export function listEngineIds(enginesRootDir: string): string[] {
    const configs = loadAllEngineConfigs(enginesRootDir);
    return Object.keys(configs);
}
