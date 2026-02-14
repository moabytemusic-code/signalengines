import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { apiClient } from '@/lib/api';
import { sendLimitReachedEmail } from '@/lib/brevo';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const prisma = new PrismaClient();

const ENGINE_ID = 'email-sequence-generator';
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
        const { niche, offer, painPoint, tone } = body;

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
            // Ignore auth error
        }

        const anonymousId = request.headers.get('x-anonymous-id');
        let isAllowed = false;
        let usageInfo = { count: 0, limit: FREE_DAILY_LIMIT, remaining: 0, isUnlimited: false };
        let counter = null;

        let isPaid = false; // logic determines this below

        // 2. Check Permissions
        if (user) {
            // Check specific engine entitlement
            const entitlement = await prisma.engineEntitlement.findUnique({
                where: { userId_engineId: { userId: user.id, engineId: ENGINE_ID } }
            });
            isPaid = entitlement?.hasAccess || user.tier === 'agency';

            usageInfo.isUnlimited = isPaid;

            counter = await getOrCreateUsageCounter(user.id);
            usageInfo.count = counter.count;
            usageInfo.remaining = isPaid ? 999 : (FREE_DAILY_LIMIT - counter.count);

            if (isPaid || counter.count < FREE_DAILY_LIMIT) {
                isAllowed = true;
            } else {
                await sendLimitReachedEmail(user.email, 'Cold Email Sequence Generator').catch(err => console.error(err));
                return NextResponse.json(
                    { error: `Free tier limit reached (${FREE_DAILY_LIMIT}/day). Upgrade for unlimited access.`, limitReached: true, ...usageInfo },
                    { status: 429 }
                );
            }
        } else if (anonymousId) {
            // Anonymous Usage Logic
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
                return NextResponse.json(
                    { error: 'Free limit reached. Please sign in or upgrade.', requiresAuth: true },
                    { status: 401 }
                );
            }
        } else {
            return NextResponse.json({ error: 'Authentication required', requiresAuth: true }, { status: 401 });
        }

        if (!niche || !offer || !painPoint) {
            return NextResponse.json({ error: 'Niche, offer, and pain point are required' }, { status: 400 });
        }

        const emailCount = isPaid ? 7 : 3;

        // 3. Generate Content
        const prompt = `Generate a ${emailCount}-email cold outreach sequence for the following:
Niche: ${niche}
Offer: ${offer}
Pain Point: ${painPoint}
Tone: ${tone}

Create a persuasion architecture with these email types in order:
1. Initial Outreach
${emailCount >= 3 ? '2. Value Add' : ''}
${emailCount >= 3 ? '3. Quick Bump' : ''}
${emailCount >= 5 ? '4. Social Proof' : ''}
${emailCount >= 5 ? '5. Objection Handler' : ''}
${emailCount >= 7 ? '6. Last Chance' : ''}
${emailCount >= 7 ? '7. Breakup Email' : ''}

For each email, provide: type, subject, body.
${isPaid ? 'Include "personalization_tip" for each email.' : ''}

Return as JSON array: [{ "type": "...", "subject": "...", "body": "..." }]`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an expert cold email copywriter. Return only valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        });

        const responseText = completion.choices[0].message.content || '';
        const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const sequence = JSON.parse(cleanedResponse);

        // 4. Save Result
        let savedId = '';

        if (user) {
            const saved = await prisma.sequence.create({
                data: {
                    userId: user.id,
                    engineId: ENGINE_ID,
                    inputs: { niche, offer, painPoint, tone },
                    output: { sequence }
                }
            });
            savedId = saved.id;

            if (counter) {
                await prisma.usageCounter.update({
                    where: { id: counter.id },
                    data: { count: counter.count + 1 }
                });
            }
        } else {
            // Save to EngineRun for anonymous
            const saved = await prisma.engineRun.create({
                data: {
                    engineId: ENGINE_ID,
                    anonymousId: anonymousId,
                    inputs: JSON.stringify({ niche, offer, painPoint, tone }),
                    status: 'COMPLETED',
                    output: {
                        create: {
                            freeOutput: JSON.stringify(sequence),
                            paidOutput: null
                        }
                    }
                }
            });
            savedId = saved.id;
        }

        return NextResponse.json({
            id: savedId,
            sequence,
            metadata: { niche, offer, painPoint, tone },
            usage: {
                count: usageInfo.count + 1,
                limit: usageInfo.isUnlimited ? 'unlimited' : FREE_DAILY_LIMIT,
                remaining: usageInfo.isUnlimited ? 'unlimited' : Math.max(0, usageInfo.remaining - 1)
            }
        });

    } catch (error: any) {
        console.error('Email sequence generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate sequence' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
