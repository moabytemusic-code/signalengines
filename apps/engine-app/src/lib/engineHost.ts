export function getSubdomainFromHost(hostname: string): string | null {
    // Remove port in case it exists (e.g., localhost:3000)
    const host = hostname.split(":")[0];

    // Localhost, IP (approx), and Root Domain (signalengines.com) have no subdomain
    if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "signalengines.com" ||
        host === "www.signalengines.com" ||
        host === "signalengines.vercel.app" ||
        host === "engine-app.vercel.app" ||
        host === "signal-engines.vercel.app" ||
        host === "signalengines-engine-app.vercel.app" ||
        host.includes("moabytemusic-codes-projects") ||
        (host.endsWith(".vercel.app") && (host.includes("-git-") || host.split(".").length > 3)) ||
        /^\d+\.\d+\.\d+\.\d+$/.test(host)
    ) {
        return null;
    }

    const parts = host.split(".");

    if (parts.length >= 3) {
        const subdomain = parts[0];
        if (subdomain.length > 40 || subdomain.includes("-git-")) {
            return null;
        }
        return subdomain;
    }

    return null;
}

// Friendly Alias Map for Smart Hustler Marketing
const ALIAS_MAP: Record<string, string> = {
    "facebook": "fbadban",
    "adban": "fbadban",
    "amazon": "amazonsuspend",
    "google": "gbpsuspend",
    "business": "gbpsuspend",
    "merchant": "merchantsuspend",
    "shopping": "merchantsuspend",
    "email": "emailspam",
    "spam": "emailspam",
    "domain": "domainblock",
    "blacklist": "domainblock",
    "recovery": "accountrecovery",
    "hacked": "sitehacked",
    "wordpress": "sitehacked",
    "tracking": "trackingfix",
    "pixel": "trackingfix",
    "compliance": "compliancealert",
    "gdpr": "compliancealert",
    "reviews": "reviewrepair",
    "reputation": "reviewrepair",
    "chargeback": "chargebackalert",
    "dispute": "chargebackalert",
    "fbrestricted": "fbpagerestricted",
    "page": "fbpagerestricted", "ideas": "tiktok-idea-batch"
};

export function getEngineIdFromHost(hostname: string): string | null {
    if (process.env.ENGINE_ID) return process.env.ENGINE_ID;
    if (process.env.HOST_OVERRIDE) return getSubdomainFromHost(process.env.HOST_OVERRIDE);

    const subdomain = getSubdomainFromHost(hostname);

    if (subdomain) {
        const lowerSub = subdomain.toLowerCase();
        return ALIAS_MAP[lowerSub] || lowerSub;
    }

    const host = hostname.toLowerCase();
    if (
        host.includes("localhost") ||
        host.includes("vercel.app") ||
        host.includes("signalengines.com")
    ) {
        return "fbadban";
    }

    return null;
}
