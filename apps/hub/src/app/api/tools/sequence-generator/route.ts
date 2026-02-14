import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { apiClient } from '@/lib/api';
import { sendLimitReachedEmail } from '@/lib/brevo';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const prisma = new PrismaClient();

const ENGINE_ID = 'sequence-generator';
const FREE_DAILY_LIMIT = 3;

async function getOrCreateUsageCounter(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    let counter = await prisma.usageCounter.findUnique({
        where: {
            userId_engineId: {
                userId,
                engineId: ENGINE_ID
            }
        }
    });

    // Reset counter if it's a new day
    if (counter && counter.periodEnd < now) {
        counter = await prisma.usageCounter.update({
            where: { id: counter.id },
            data: {
                count: 0,
                periodStart: startOfDay,
                periodEnd: endOfDay
            }
        });
    }

    // Create counter if it doesn't exist
    if (!counter) {
        counter = await prisma.usageCounter.create({
            data: {
                userId,
                engineId: ENGINE_ID,
                periodStart: startOfDay,
                periodEnd: endOfDay,
                count: 0
            }
        });
    }

    return counter;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { topic, platform, tone, count } = body;

        // 1. Try to authenticate user
        let user = null;
        try {
            const authResponse = await apiClient('/me', {
                headers: {
                    cookie: request.headers.get('cookie') || ''
                }
            });
            if (authResponse.ok) {
                user = await authResponse.json();
            }
        } catch (e) {
            // Ignore auth error, treat as anonymous
        }

        const anonymousId = request.headers.get('x-anonymous-id');
        let isAllowed = false;
        let usageInfo = { count: 0, limit: FREE_DAILY_LIMIT, remaining: 0, isUnlimited: false };
        let counter = null; // For logged in user

        // 2. Check Permissions
        if (user) {
            // Check specific engine entitlement
            const entitlement = await prisma.engineEntitlement.findUnique({
                where: { userId_engineId: { userId: user.id, engineId: ENGINE_ID } }
            });
            const isPaid = entitlement?.hasAccess || user.tier === 'agency';

            usageInfo.isUnlimited = isPaid;

            counter = await getOrCreateUsageCounter(user.id);
            usageInfo.count = counter.count;
            usageInfo.remaining = isPaid ? 999 : (FREE_DAILY_LIMIT - counter.count);

            if (isPaid || counter.count < FREE_DAILY_LIMIT) {
                isAllowed = true;
            } else {
                // Limit reached for free user
                await sendLimitReachedEmail(user.email, 'Social Media Content Sequence Generator').catch(err => console.error(err));
                return NextResponse.json(
                    { error: `Free tier limit reached (${FREE_DAILY_LIMIT}/day). Upgrade for unlimited access.`, limitReached: true, ...usageInfo },
                    { status: 429 }
                );
            }
        } else if (anonymousId) {
            // Check anonymous usage in EngineRun table (daily reset)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const runs = await prisma.engineRun.count({
                where: {
                    engineId: ENGINE_ID,
                    anonymousId: anonymousId,
                    createdAt: { gte: today }
                }
            });

            usageInfo.count = runs;
            usageInfo.remaining = FREE_DAILY_LIMIT - runs;

            if (runs < FREE_DAILY_LIMIT) {
                isAllowed = true;
            } else {
                // Anonymous limit reached -> Prompt login
                return NextResponse.json(
                    { error: 'Free limit reached. Please sign in or upgrade.', requiresAuth: true },
                    { status: 401 }
                );
            }
        } else {
            // No user and no anonymous ID? Should not happen if client is set up right
            return NextResponse.json({ error: 'Authentication required', requiresAuth: true }, { status: 401 });
        }

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        // 3. Generate Content
        const prompt = `Generate a strategic content sequence of ${count} posts for ${platform} about "${topic}".
Tone: ${tone}
Platform: ${platform}

For each post, provide:
1. A compelling hook
2. The hook type
3. Main content (2-3 sentences)
4. 3-5 relevant hashtags

The sequence should build strategically and be optimized for ${platform}.

Return as JSON array: [{ "hook": "...", "hook_type": "...", "content": "...", "hashtags": ["..."] }]`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a social media strategist. Return only valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.8
        });

        const responseText = completion.choices[0].message.content || '';
        const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const sequence = JSON.parse(cleanedResponse);

        // 4. Save Result
        let savedId = '';

        if (user) {
            // Save to Sequence table for user
            const saved = await prisma.sequence.create({
                data: {
                    userId: user.id,
                    engineId: ENGINE_ID,
                    inputs: { topic, platform, tone, count },
                    output: { sequence }
                }
            });
            savedId = saved.id;

            // Increment UsageCounter
            if (counter) {
                await prisma.usageCounter.update({
                    where: { id: counter.id },
                    data: { count: counter.count + 1 }
                });
            }
        } else {
            // Save to EngineRun table for anonymous
            // EngineRun stores output via relation to EngineOutput
            const saved = await prisma.engineRun.create({
                data: {
                    engineId: ENGINE_ID,
                    anonymousId: anonymousId,
                    inputs: JSON.stringify({ topic, platform, tone, count }),
                    status: 'COMPLETED',
                    output: {
                        create: {
                            freeOutput: JSON.stringify(sequence),
                            paidOutput: null // No paid output for this tool
                        }
                    }
                }
            });
            savedId = saved.id;
        }

        return NextResponse.json({
            id: savedId,
            sequence,
            metadata: { topic, platform, tone, count },
            usage: {
                count: usageInfo.count + 1,
                limit: usageInfo.isUnlimited ? 'unlimited' : FREE_DAILY_LIMIT,
                remaining: usageInfo.isUnlimited ? 'unlimited' : Math.max(0, usageInfo.remaining - 1)
            }
        });

    } catch (error: any) {
        console.error('Sequence generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate sequence' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
