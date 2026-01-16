
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const engines = [
    {
        "id": "fbadban",
        "name": "Facebook Ad Account Disabled",
        "url": "https://facebook.smarthustlermarketing.com",
        "description": "Recover disabled ad accounts and unrestricted generic assets.",
        "category": "Ad Compliance",
        "primary_keyword": "Ad Account Recovery" // Added for frontend compatibility
    },
    {
        "id": "amazonsuspend",
        "name": "Amazon Seller Suspension",
        "url": "https://amazon.smarthustlermarketing.com",
        "description": "Appeal templates for Amazon Seller Central suspensions.",
        "category": "E-commerce",
        "primary_keyword": "Amazon Suspension"
    },
    {
        "id": "gbpsuspend",
        "name": "Google Business Profile Suspended",
        "url": "https://google.smarthustlermarketing.com",
        "description": "Restore your local business listing on Google Maps.",
        "category": "Local SEO",
        "primary_keyword": "GBP Restoration"
    },
    {
        "id": "merchantsuspend",
        "name": "Merchant Center Suspension",
        "url": "https://merchant.smarthustlermarketing.com",
        "description": "Fix Misrepresentation and Policy violations in GMC.",
        "category": "E-commerce",
        "primary_keyword": "GMC Appeal"
    },
    {
        "id": "emailspam",
        "name": "Email Spam Score Checker",
        "url": "https://email.smarthustlermarketing.com",
        "description": "Check if your emails are landing in Spam folders.",
        "category": "Email Marketing",
        "primary_keyword": "Spam Checker"
    },
    {
        "id": "domainblock",
        "name": "Domain Blacklist Checker",
        "url": "https://domain.smarthustlermarketing.com",
        "description": "See if your website is blacklisted by security vendors.",
        "category": "Security",
        "primary_keyword": "Blacklist Check"
    },
    {
        "id": "accountrecovery",
        "name": "Account Locked Recovery",
        "url": "https://recovery.smarthustlermarketing.com",
        "description": "Step-by-step guide to recovering locked social accounts.",
        "category": "Social Media",
        "primary_keyword": "Account Unlock"
    },
    {
        "id": "sitehacked",
        "name": "Hacked Site Recovery",
        "url": "https://hacked.smarthustlermarketing.com",
        "description": "Clean malware and recover hacked WordPress sites.",
        "category": "Security",
        "primary_keyword": "Malware Removal"
    },
    {
        "id": "trackingfix",
        "name": "Pixel/Tracking Debugger",
        "url": "https://tracking.smarthustlermarketing.com",
        "description": "Fix broken Facebook Pixels and conversion API events.",
        "category": "Analytics",
        "primary_keyword": "Tracking Fix"
    },
    {
        "id": "compliancealert",
        "name": "Website Compliance Checker",
        "url": "https://compliance.smarthustlermarketing.com",
        "description": "Scan for missing legal pages (GDPR, Terms, Privacy).",
        "category": "Legal",
        "primary_keyword": "Compliance Scan"
    },
    {
        "id": "reviewrepair",
        "name": "Review Response Generator",
        "url": "https://reviews.smarthustlermarketing.com",
        "description": "Generate professional responses to negative reviews.",
        "category": "Reputation",
        "primary_keyword": "Review AI"
    },
    {
        "id": "chargebackalert",
        "name": "Chargeback Dispute Helper",
        "url": "https://chargeback.smarthustlermarketing.com",
        "description": "Win disputes with generated evidence letters.",
        "category": "Finance",
        "primary_keyword": "Chargeback Win"
    },
    {
        "id": "fbpagerestricted",
        "name": "Facebook Page Restricted",
        "url": "https://page.smarthustlermarketing.com",
        "description": "Appeal restricted Facebook Business Pages.",
        "category": "Social Media",
        "primary_keyword": "Page Appeal"
    },
    {
        "id": "tiktok-idea-batch",
        "name": "TikTok Viral Idea Batch",
        "url": "https://ideas.smarthustlermarketing.com",
        "description": "Generate 10 viral video concepts tailored to your niche.",
        "category": "Growth",
        "primary_keyword": "content ideas"
    },
    {
        "id": "emailwarmup",
        "name": "Email Reputation Checker",
        "url": "https://warmup.smarthustlermarketing.com",
        "description": "Check for blacklists and low sender reputation scores.",
        "category": "Deliverability",
        "primary_keyword": "email warmup"
    }
];

async function main() {
    console.log('Seeding engines...');

    for (const engine of engines) {
        const engineConfig = {
            engine_id: engine.id,
            engine_name: engine.name,
            subdomain: engine.id, // Legacy compatibility
            launchUrl: engine.url,
            primary_keyword: engine.primary_keyword,
            category: engine.category,
            seo: {
                title: engine.name,
                description: engine.description,
                h1: engine.name
            },
            // Minimal required fields for legacy EngineConfig schema compat if strict parsing is used elsewhere
            inputs: [],
            scoring_rules: [],
            free_output_sections: [],
            paid_output_sections: [],
            pricing: { emergency: 0, full: 0, monthly: 0 },
            cross_sell_engines: []
        };

        await prisma.engineDefinition.upsert({
            where: { engineId: engine.id },
            update: {
                engineJson: JSON.stringify(engineConfig),
                updatedAt: new Date()
            },
            create: {
                engineId: engine.id,
                engineJson: JSON.stringify(engineConfig),
                contentMapJson: "{}",
                status: "active"
            }
        });
        console.log(`Upserted ${engine.id}`);
    }

    console.log('Seeding complete.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
