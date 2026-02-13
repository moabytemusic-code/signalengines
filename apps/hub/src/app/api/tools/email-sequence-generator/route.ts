import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { apiClient } from '@/lib/api';

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
        const user = await apiClient('/me').then(res => res.json()).catch(() => null);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required', requiresAuth: true },
                { status: 401 }
            );
        }

        const counter = await getOrCreateUsageCounter(user.id);
        const isPaid = user.tier === 'pro' || user.tier === 'agency';

        if (!isPaid && counter.count >= FREE_DAILY_LIMIT) {
            return NextResponse.json(
                {
                    error: `Free tier limit reached (${FREE_DAILY_LIMIT}/day). Upgrade for unlimited access.`,
                    limitReached: true,
                    usageCount: counter.count,
                    limit: FREE_DAILY_LIMIT
                },
                { status: 429 }
            );
        }

        const { niche, offer, painPoint, tone } = await request.json();

        if (!niche || !offer || !painPoint) {
            return NextResponse.json(
                { error: 'Niche, offer, and pain point are required' },
                { status: 400 }
            );
        }

        const emailCount = isPaid ? 7 : 3;

        const prompt = `Generate a ${emailCount}-email cold outreach sequence for the following:

Niche: ${niche}
Offer: ${offer}
Pain Point: ${painPoint}
Tone: ${tone}

Create a persuasion architecture with these email types in order:
1. Initial Outreach (pattern interrupt + value proposition)
${emailCount >= 3 ? '2. Value Add (share insight, case study, or resource)' : ''}
${emailCount >= 3 ? '3. Quick Bump (short, casual check-in)' : ''}
${emailCount >= 5 ? '4. Social Proof (testimonial or results)' : ''}
${emailCount >= 5 ? '5. Objection Handler (address common concerns)' : ''}
${emailCount >= 7 ? '6. Last Chance (urgency/scarcity)' : ''}
${emailCount >= 7 ? '7. Breakup Email (permission to close loop)' : ''}

For each email, provide:
- type: (e.g., "Initial Outreach", "Value Add", "Quick Bump", "Breakup")
- subject: A compelling subject line
- body: The email body (2-4 short paragraphs, conversational)
${isPaid ? '- personalization_tip: Specific advice on how to personalize this email for each prospect' : ''}

Use the ${tone} tone throughout. Make it feel human, not robotic.

Return as JSON array:
[
  {
    "type": "string",
    "subject": "string",
    "body": "string"${isPaid ? ',\n    "personalization_tip": "string"' : ''}
  }
]`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert cold email copywriter. Return only valid JSON, no markdown formatting. Write emails that get replies, not spam complaints.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 3000
        });

        const responseText = completion.choices[0].message.content || '';
        const cleanedResponse = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const sequence = JSON.parse(cleanedResponse);

        const savedSequence = await prisma.sequence.create({
            data: {
                userId: user.id,
                engineId: ENGINE_ID,
                inputs: { niche, offer, painPoint, tone },
                output: { sequence }
            }
        });

        await prisma.usageCounter.update({
            where: { id: counter.id },
            data: { count: counter.count + 1 }
        });

        return NextResponse.json({
            id: savedSequence.id,
            sequence,
            metadata: {
                niche,
                offer,
                painPoint,
                tone
            },
            usage: {
                count: counter.count + 1,
                limit: isPaid ? 'unlimited' : FREE_DAILY_LIMIT,
                remaining: isPaid ? 'unlimited' : FREE_DAILY_LIMIT - (counter.count + 1)
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
