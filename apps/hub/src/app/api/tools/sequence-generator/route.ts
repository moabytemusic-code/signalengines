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
        // Get user from session
        const user = await apiClient('/me').then(res => res.json()).catch(() => null);

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required', requiresAuth: true },
                { status: 401 }
            );
        }

        // Check usage limits
        const counter = await getOrCreateUsageCounter(user.id);
        const isPaid = user.tier === 'pro' || user.tier === 'agency';

        if (!isPaid && counter.count >= FREE_DAILY_LIMIT) {
            // Send limit reached email
            await sendLimitReachedEmail(user.email, 'Social Media Content Sequence Generator').catch(err => {
                console.error('Failed to send limit email:', err);
            });

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

        const { topic, platform, tone, count } = await request.json();

        if (!topic) {
            return NextResponse.json(
                { error: 'Topic is required' },
                { status: 400 }
            );
        }

        const prompt = `Generate a strategic content sequence of ${count} posts for ${platform} about "${topic}".

Tone: ${tone}
Platform: ${platform}

For each post, provide:
1. A compelling hook (first line that grabs attention)
2. The hook type (question, stat, story, controversy, etc.)
3. Main content (2-3 sentences)
4. 3-5 relevant hashtags

The sequence should:
- Build on each other strategically
- Mix different hook types
- Progress from awareness → interest → engagement
- Be optimized for ${platform} best practices

Return as JSON array with this structure:
[
  {
    "hook": "string",
    "hook_type": "string",
    "content": "string",
    "hashtags": ["string"]
  }
]`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a social media content strategist. Return only valid JSON, no markdown formatting.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 2000
        });

        const responseText = completion.choices[0].message.content || '';

        // Clean up response (remove markdown code blocks if present)
        const cleanedResponse = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const sequence = JSON.parse(cleanedResponse);

        // Save to database
        const savedSequence = await prisma.sequence.create({
            data: {
                userId: user.id,
                engineId: ENGINE_ID,
                inputs: { topic, platform, tone, count },
                output: { sequence }
            }
        });

        // Increment usage counter
        await prisma.usageCounter.update({
            where: { id: counter.id },
            data: { count: counter.count + 1 }
        });

        return NextResponse.json({
            id: savedSequence.id,
            sequence,
            metadata: {
                topic,
                platform,
                tone,
                count
            },
            usage: {
                count: counter.count + 1,
                limit: isPaid ? 'unlimited' : FREE_DAILY_LIMIT,
                remaining: isPaid ? 'unlimited' : FREE_DAILY_LIMIT - (counter.count + 1)
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
