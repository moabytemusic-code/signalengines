
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkEngineAccess } from '@/engines/base/guard';
import { sequenceEngineModule } from '@/engines/sequence-engine/module';
import { SEQUENCE_ENGINE_SYSTEM_PROMPT } from '@/engines/sequence-engine/prompt';
import { incrementUsage } from '@/engines/base/usage';

// Initialize OpenAI outside the handler, but apiKey is process.env accessed at runtime
// Ensure it's not trying to access it during build if secret
// But here we instantiate inside scope or globally.
// Globally is fine if env is available.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. Authenticate & Authorize
        const access = await checkEngineAccess(req, sequenceEngineModule.id, {
            free: sequenceEngineModule.tiers.free.generationsPerPeriod,
            pro: sequenceEngineModule.tiers.pro.generationsPerPeriod
        });

        if (!access.authorized || !access.user) {
            return access.response || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tier = (access.tier as 'free' | 'pro') || 'free';

        // 2. Prepare Prompt
        let systemPrompt = SEQUENCE_ENGINE_SYSTEM_PROMPT;
        const variables = ['niche', 'offer_type', 'target_audience', 'traffic_source', 'goal', 'tone'];

        for (const v of variables) {
            const val = body[v] || '';
            const sanitized = val.toString().replace(/[{}]/g, '');
            systemPrompt = systemPrompt.replace(`{{${v}}}`, sanitized);
        }

        const signals = body['personalization_signals'] || 'None';
        systemPrompt = systemPrompt.replace('{{personalization_signals}}', signals.toString().replace(/[{}]/g, ''));

        // 3. Call LLM
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Generate the sequence now." }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("Empty response from LLM");

        let jsonOutput = JSON.parse(content);

        // 4. Shape Response based on Tier
        const finalOutput = { ...jsonOutput };

        if (tier === 'free') {
            if (Array.isArray(finalOutput.follow_ups)) {
                finalOutput.follow_ups = finalOutput.follow_ups.slice(0, 2);
            }
            delete finalOutput.personalization_breakdown;
            finalOutput.upgrade_required = true;
        } else {
            finalOutput.upgrade_required = false;
        }

        // 5. Save Record (Prisma)
        await prisma.sequence.create({
            data: {
                userId: access.user.id,
                engineId: sequenceEngineModule.id,
                inputs: body,
                output: jsonOutput // Save full output
            }
        });

        // 6. Increment Usage
        await incrementUsage(access.user.id, sequenceEngineModule.id);

        return NextResponse.json({
            success: true,
            data: finalOutput,
            usage: {
                current: (access.usage || 0) + 1, // approximate, or fetch fresh
                limit: tier === 'free' ? sequenceEngineModule.tiers.free.generationsPerPeriod : 'Unlimited'
            }
        });

    } catch (e: any) {
        console.error("Sequence Generation Error:", e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}
