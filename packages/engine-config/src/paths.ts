import { z } from "zod";

// ------------------------------------------------------------------
// CORE PATH INTERFACES
// ------------------------------------------------------------------

export const PathResultSchema = z.object({
    // The core data produced by this path (e.g., list of keywords, leads, content)
    data: z.any(),

    // Monetization metadata specific to this path
    monetization: z.object({
        offers: z.array(z.any()).optional(), // specific offers matched
        value: z.number().optional(),      // estimated value of this result
        currency: z.string().optional().default("USD"),
        type: z.enum(["traffic", "lead", "sale", "data"]).optional()
    }).optional(),

    // Any implementation-specific metadata (e.g. source, reliability)
    meta: z.record(z.any()).optional(),
});

export type PathResult = z.infer<typeof PathResultSchema>;

export interface PathContext {
    signal: any;         // The raw input signal
    config: any;         // Engine configuration
    user?: any;          // User context (if authenticated)
    previousResults?: Record<string, PathResult>; // Results from previous paths in a chain
}

export interface PathEngine {
    id: string;
    name: string;
    description: string;

    // Check if this path can handle the given signal/context
    canHandle(context: PathContext): boolean;

    // Execute the path logic
    execute(context: PathContext): Promise<PathResult>;
}

// ------------------------------------------------------------------
// PATH REGISTRY
// ------------------------------------------------------------------

class PathRegistryImpl {
    private paths: Map<string, PathEngine> = new Map();

    register(path: PathEngine) {
        if (this.paths.has(path.id)) {
            console.warn(`Path with ID ${path.id} is already registered. Overwriting.`);
        }
        this.paths.set(path.id, path);
    }

    get(id: string): PathEngine | undefined {
        return this.paths.get(id);
    }

    list(): PathEngine[] {
        return Array.from(this.paths.values());
    }
}

export const PathRegistry = new PathRegistryImpl();
