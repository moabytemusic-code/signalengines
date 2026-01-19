
import { MetadataRoute } from 'next';

const ACTIVE_ENGINES = [
    "emailwarmup",
    "tiktok-idea-batch",
    "tiktok-script-generator",
    "fbadban",
    "fbpagerestricted",
    "accountrecovery",
    "trackingfix",
    "adbleed",
    "amazonsuspend",
    "merchantsuspend",
    "emailspam",
    "domainblock",
    "compliancealert",
    "chargebackalert",
    "reviewrepair",
    "sitehacked",
    "gbpsuspend"
];

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://signalengines.com';

    const staticRoutes = [
        '',
        '/engines',
        '/pricing',
        '/articles',
        '/login',
        '/signup',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    const engineRoutes = ACTIVE_ENGINES.map((id) => ({
        url: `${baseUrl}/go/${id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    return [...staticRoutes, ...engineRoutes];
}
