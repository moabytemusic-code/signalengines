import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
    try {
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

        return NextResponse.json({
            sequence,
            metadata: {
                topic,
                platform,
                tone,
                count
            }
        });

    } catch (error: any) {
        console.error('Sequence generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate sequence' },
            { status: 500 }
        );
    }
}
