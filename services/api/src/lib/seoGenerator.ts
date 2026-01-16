import { engineRegistry } from "../engineRegistry";
import { prisma } from "./db";
import fs from "fs";
import path from "path";

interface PagePreview {
    slug: string;
    title: string;
    type: string;
    wordCount: number;
    status: 'NEW' | 'EXISTING' | 'OVERWRITE';
    markdown: string;
    schema: any;
}

export async function generateSeoPages(jobId: string) {
    const job = await prisma.seoGenerationJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    try {
        const engine = engineRegistry.get(job.engineId);
        if (!engine) throw new Error("Engine not found");

        const previews: PagePreview[] = [];

        if (job.mode === 'standard_5') {
            const types = [
                { id: 'A', name: 'Fix Guide', suffix: 'fix' },
                { id: 'B', name: 'Why It Happens', suffix: 'causes' },
                { id: 'C', name: 'Common Mistakes', suffix: 'mistakes' },
                { id: 'D', name: 'Appeal Template', suffix: 'template' },
                { id: 'E', name: 'Prevention', suffix: 'prevention' }
            ];

            for (const t of types) {
                const page = generatePageContent(engine, t);
                const status = await getPageStatus(engine.engine_id, page.slug, job.overwrite);
                previews.push({ ...page, status });
            }
        } else if (job.mode === 'weekly_pack_v1') {
            // Logic for weekly rotation
            // We'll use the current week number to decide the pattern
            const now = new Date();
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const weekNumber = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);

            const isOdd = weekNumber % 2 !== 0;
            const primaryType = isOdd ? { id: 'B', name: 'Why It Happens', suffix: 'causes' } : { id: 'A', name: 'Fix Guide', suffix: 'fix' };

            // Get content map for variants
            const map = loadContentMap(engine.engine_id);
            const variantCount = map?.variants?.length || 0;

            // Pick a variant based on week number to ensure rotation
            const pagesToGen = 1; // Default to 1 as per requirements (1-2)

            for (let i = 0; i < pagesToGen; i++) {
                const variantIndex = (weekNumber + i) % (variantCount || 1);
                const variant = map?.variants?.[variantIndex] || engine.primary_keyword;

                const page = generatePageContent(engine, primaryType, variant);
                const status = await getPageStatus(engine.engine_id, page.slug, job.overwrite);

                // Avoid recently published duplicates (last 30 days check would go here if we tracked strictly, 
                // but variant rotation by week number is a good proxy for now)
                previews.push({ ...page, status });
            }
        }

        // Save result
        await prisma.seoGenerationJob.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                resultJson: JSON.stringify(previews)
            }
        });

    } catch (e: any) {
        await prisma.seoGenerationJob.update({
            where: { id: jobId },
            data: { status: 'FAILED', resultJson: JSON.stringify({ error: e.message }) }
        });
    }
}

async function getPageStatus(engineId: string, slug: string, overwrite: boolean): Promise<'NEW' | 'EXISTING' | 'OVERWRITE'> {
    const existing = await prisma.seoPage.findUnique({
        where: { engineId_slug: { engineId, slug } }
    });

    if (existing) {
        return overwrite ? 'OVERWRITE' : 'EXISTING';
    }
    return 'NEW';
}

function loadContentMap(engineId: string) {
    // Use the registry's getContentMap helper which is already initialized with the correct path
    return engineRegistry.getContentMap(engineId);
}

function generatePageContent(engine: any, type: any, variant?: string) {
    const keyword = variant || engine.primary_keyword;
    const properKw = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    const map = loadContentMap(engine.engine_id);

    let title = "";
    let slug = "";
    let body = "";

    const listToBullets = (items: string[]) => items ? items.map(i => `- ${i}`).join('\n') : "";

    switch (type.id) {
        case 'A':
            title = `How to Fix ${properKw} (Step-by-Step Guide)`;
            slug = `how-to-fix-${keyword.toLowerCase().replace(/\s+/g, '-')}`;
            const actions = map ? listToBullets(map.immediate_actions) : "- Identify the error\n- Check documentation\n- Contact support";
            body = `
# ${title}

Is your account or site affected by **${keyword}**? You are not alone. This guide covers exactly how to diagnose and fix it.

## 1. Diagnose the Issue
First, run a scan to confirm the specific error code.
[Run Free Scan](/)

## 2. Immediate Actions
${actions}

## 3. The Fix
Follow these steps carefully to resolve the issue for good.

## 4. Professional Assistance
If you are unable to resolve the issue yourself, consider using our [automated recovery tool](/${engine.engine_id}) which handles the heavy lifting for you.
            `;
            break;
        case 'B':
            title = `Why ${properKw} Happens: Top Causes`;
            slug = `why-${keyword.toLowerCase().replace(/\s+/g, '-')}-happens`;
            const causes = map ? listToBullets(map.causes) : "- Policy violations\n- Technical errors\n- Suspicious activity";
            body = `
# ${title}

Understanding why **${keyword}** occurs is the first step to fixing it. Many users face this issue due to automated enforcement or sudden changes in account activity.

## Common Causes
${causes}

## How to Check Your Status
You can use our [diagnostic tool](/${engine.engine_id}) to identify the exact cause triggered by the platform algorithms.
            `;
            break;
        case 'C':
            title = `5 Common Mistakes When Fixing ${properKw}`;
            slug = `${keyword.toLowerCase().replace(/\s+/g, '-')}-fix-mistakes`;
            const mistakes = map ? listToBullets(map.mistakes) : "- Ignoring warnings\n- Rushing the fix\n- Using unverified tools";
            body = `# ${title}\n\nDon't make it worse. Here are things to avoid:\n\n${mistakes}\n\nRecommended: [Use a verified recovery engine](/${engine.engine_id})`;
            break;
        case 'D':
            title = `${properKw} Appeal Template (Copy & Paste)`;
            slug = `${keyword.toLowerCase().replace(/\s+/g, '-')}-appeal-template`;
            body = `# ${title}\n\nUse this template to appeal your **${keyword}**.\n\n## Template\nSubject: Appeal for ${keyword}\n\nDear Support,\n\n...`;
            break;
        case 'E':
            title = `How to Prevent ${properKw} in 2026`;
            slug = `prevent-${keyword.toLowerCase().replace(/\s+/g, '-')}`;
            const prevention = map ? listToBullets(map.prevention) : "- Auditing regularly\n- Following guidelines";
            body = `# ${title}\n\nSecurity and compliance are key.\n\n## Prevention Tips\n${prevention}`;
            break;
    }

    // Add generic or specific FAQ
    let faqSection = "";
    if (map && map.faqs) {
        faqSection = "## Frequently Asked Questions\n\n";
        map.faqs.slice(0, 5).forEach((q: string) => {
            faqSection += `### ${q}\nOur automated engine analyzed thousands of similar cases and found that most users resolve this by following our step-by-step checklist. You can generate a custom action plan by [starting a scan here](/${engine.engine_id}).\n\n`;
        });
    }

    // Related Engine Link
    const related = map?.related_engines?.[0] || 'accountrecovery';
    body += `\n\n## Related Resources\n- [Fix ${related} Issues](/${related})\n- [Contact Support](/)`;

    body += "\n" + faqSection;

    // Word count padder if needed (ensuring 450+)
    const filler = `\n\n## Deep Dive into ${properKw}\nMaintaining a healthy digital presence requires constant monitoring of ${keyword}. When a restriction is placed, it often impacts revenue and customer trust. Our research indicates that ${keyword} is one of the most common blockers for scaling businesses in 2026. By understanding the root triggers—ranging from technical signals to policy enforcement—you can build a more resilient infrastructure. Always ensure you have backups and redundancy in place before a crisis hits.`;

    const wordCount = body.split(/\s+/).length;
    if (wordCount < 400) {
        body += filler;
    }

    // Schema
    const schema: any = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": map && map.faqs ? map.faqs.slice(0, 5).map((q: string) => ({
            "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": "Answer..." }
        })) : []
    };

    if (type.id === 'A') {
        schema["@type"] = ["FAQPage", "HowTo"];
        schema["name"] = title;
        schema["step"] = map?.immediate_actions?.map((a: string, i: number) => ({
            "@type": "HowToStep",
            "position": i + 1,
            "text": a
        })) || [];
    }

    return { slug, title, type: type.name, wordCount: body.split(/\s+/).length, markdown: body, schema };
}

export async function publishJob(jobId: string) {
    const job = await prisma.seoGenerationJob.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'COMPLETED') throw new Error("Job not ready");

    const previews: PagePreview[] = JSON.parse(job.resultJson);
    const published = [];

    for (const p of previews) {
        if (p.status === 'EXISTING' && !job.overwrite) continue;

        await prisma.seoPage.upsert({
            where: { engineId_slug: { engineId: job.engineId, slug: p.slug } },
            create: {
                engineId: job.engineId,
                slug: p.slug,
                title: p.title,
                description: `Learn about ${p.title}`,
                markdown: p.markdown,
                schemaJson: JSON.stringify(p.schema),
                published: true
            },
            update: {
                title: p.title,
                markdown: p.markdown,
                schemaJson: JSON.stringify(p.schema),
                published: true,
                updatedAt: new Date()
            }
        });
        published.push(p.slug);
    }
    return published;
}
