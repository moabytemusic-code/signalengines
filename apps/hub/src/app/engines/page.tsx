
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Search, Activity, Shield, DollarSign, Lock, AlertTriangle } from "lucide-react";
import { getAllEngines } from '../../engines/registry';

// 1. Local Registry (Legacy)
const LEGACY_ENGINES = [
    { id: "sequence-generator", name: "Content Engine", category: "Social & Content", shortDescription: "Generate viral content sequences for social media platforms.", status: "live", accessTier: "free", launchUrl: "/tools/sequence-generator" },
    { id: "email-sequence-generator", name: "Email Engine", category: "Email Marketing", shortDescription: "Create high-converting cold email sequences in seconds.", status: "live", accessTier: "free", launchUrl: "/tools/email-sequence-generator" },

    { id: "emailwarmup", name: "Email Reputation Checker", category: "Deliverability", shortDescription: "Check for blacklists and low sender reputation scores.", status: "live", accessTier: "free", launchUrl: "https://warmup.signalengines.com" },
    { id: "tiktok-idea-batch", name: "TikTok Viral Idea Batch", category: "Growth", shortDescription: "Generate 10 viral video concepts tailored to your niche.", status: "live", accessTier: "free", launchUrl: "https://ideas.signalengines.com" },
    { id: "tiktok-script-generator", name: "TikTok Script Generator", category: "Growth", shortDescription: "Turn any idea into a viral script in seconds (Hook, Body, CTA).", status: "live", accessTier: "free", launchUrl: "https://scripts.signalengines.com" },
    { id: "fbadban", name: "Facebook Ad Account Disabled", category: "Facebook", shortDescription: "Recover disabled ad accounts and unrestricted generic assets.", status: "live", accessTier: "free", launchUrl: "https://fbadban.signalengines.com" },
    { id: "fbpagerestricted", name: "Facebook Page Restricted", category: "Facebook", shortDescription: "Appeal restricted Facebook Business Pages.", status: "live", accessTier: "free", launchUrl: "https://fbpagerestricted.signalengines.com" },
    { id: "accountrecovery", name: "Account Access Recovery", category: "Facebook", shortDescription: "Find out why your account was locked and the fastest way to regain access.", status: "live", accessTier: "free", launchUrl: "https://accountrecovery.signalengines.com" },
    { id: "trackingfix", name: "Pixel/Tracking Debugger", category: "Ads & Tracking", shortDescription: "Fix broken Facebook Pixels and conversion API events.", status: "live", accessTier: "free", launchUrl: "https://trackingfix.signalengines.com" },
    { id: "adbleed", name: "Ad Budget Bleed Calculator", category: "Ads & Tracking", shortDescription: "Scan your ad funnel and stop wasting money.", status: "live", accessTier: "free", launchUrl: "https://adbleed.signalengines.com" },
    { id: "amazonsuspend", name: "Amazon Seller Suspension", category: "Ecommerce", shortDescription: "Generate a winning Plan of Action (POA) for Amazon Seller Central.", status: "live", accessTier: "free", launchUrl: "https://amazonsuspend.signalengines.com" },
    { id: "merchantsuspend", name: "Merchant Center Suspension", category: "Ecommerce", shortDescription: "Fix Misrepresentation and Policy violations in GMC.", status: "live", accessTier: "free", launchUrl: "https://merchantsuspend.signalengines.com" },
    { id: "emailspam", name: "Email Spam Score Checker", category: "Deliverability", shortDescription: "Check if your emails are landing in Spam folders.", status: "live", accessTier: "free", launchUrl: "https://emailspam.signalengines.com" },
    { id: "domainblock", name: "Domain Blacklist Checker", category: "Deliverability", shortDescription: "See if your website is blacklisted by security vendors.", status: "live", accessTier: "free", launchUrl: "https://domainblock.signalengines.com" },
    { id: "compliancealert", name: "Website Compliance Checker", category: "Compliance", shortDescription: "Scan for missing legal pages (GDPR, Terms, Privacy).", status: "live", accessTier: "free", launchUrl: "https://compliancealert.signalengines.com" },
    { id: "chargebackalert", name: "Chargeback & Dispute Alert", category: "Payments", shortDescription: "Analyze your transaction risk factors and get a plan to reduce disputes.", status: "live", accessTier: "free", launchUrl: "https://chargebackalert.signalengines.com" },
    { id: "reviewrepair", name: "Negative Review Response", category: "Reputation", shortDescription: "Generate professional responses to negative reviews.", status: "live", accessTier: "free", launchUrl: "https://reviewrepair.signalengines.com" },
    { id: "sitehacked", name: "Hacked Site Recovery Steps", category: "Security", shortDescription: "Clean malware and recover hacked WordPress sites.", status: "live", accessTier: "free", launchUrl: "https://sitehacked.signalengines.com" },
    { id: "gbpsuspend", name: "Google Business Profile Suspended", category: "Local SEO", shortDescription: "Restore your local business listing on Google Maps.", status: "live", accessTier: "free", launchUrl: "https://gbpsuspend.signalengines.com" }
];

// Combine with Modular Engines
const MODULAR_ENGINES = getAllEngines().map(e => ({
    id: e.id,
    name: e.name,
    category: "Marketing",
    shortDescription: e.tagline,
    status: "live",
    accessTier: "freemium",
    launchUrl: e.route
}));

const ACTIVE_ENGINES = [...MODULAR_ENGINES, ...LEGACY_ENGINES];

// Micro-copy Mapping
const ENGINE_MICROCOPY: Record<string, string> = {
    "sequence-engine": "Generate cold outreach in 30s.",
    "emailwarmup": "See if you are landing in spam.",
    "tiktok-idea-batch": "Unlock 10 viral concepts in 30s.",
    "tiktok-script-generator": "Get a full script in 5 seconds.",
    accountrecovery: "Fast recovery checklist—start here.",
    adbleed: "Spot wasted spend in 2 minutes.",
    amazonsuspend: "Appeal framework + action plan.",
    chargebackalert: "Reduce disputes with a clear checklist.",
    compliancealert: "Find high-risk gaps—fix in order.",
    domainblock: "Check blacklist risk + next steps.",
    emailspam: "Improve deliverability step-by-step.",
    fbadban: "Triage + appeal-ready next steps.",
    fbpagerestricted: "Fix restrictions with clean steps.",
    gbpsuspend: "Reinstatement checklist, simplified.",
    merchantsuspend: "Fix policy issues before recheck.",
    reviewrepair: "Copy-paste replies that de-escalate.",
    sitehacked: "Recover safely—don’t miss steps.",
    trackingfix: "Diagnose pixel issues in minutes."
};
const DEFAULT_MICROCOPY = "Takes about 2–5 minutes.";

// Popular Selection Order
const POPULAR_IDS = ["sequence-engine", "fbadban", "gbpsuspend", "trackingfix", "emailspam", "compliancealert", "amazonsuspend"];

export default function EnginesDir() {
    // 2. Initialize with Fallback (Never Empty)
    const [engines, setEngines] = useState<any[]>(ACTIVE_ENGINES);
    const [search, setSearch] = useState("");

    // 3. Attempt Fetch
    useEffect(() => {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.signalengines.com'}/public/engines`;
        fetch(url)
            .then(async (r) => {
                if (r.ok) {
                    const data = await r.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const localMap = new Map(ACTIVE_ENGINES.map(e => [e.id, e]));

                        // Refine API data with local backups (e.g. status)
                        const enhancedData = data.map((apiEngine: any) => {
                            const id = apiEngine.engine_id || apiEngine.id;
                            const local = localMap.get(id);
                            return {
                                ...apiEngine,
                                // If API status is missing/null, fallback to local, else default to 'live' to avoid accidental waitlisting
                                status: apiEngine.status || local?.status || 'live'
                            };
                        });

                        const apiIds = new Set(enhancedData.map((e: any) => e.engine_id || e.id));

                        const missing = ACTIVE_ENGINES.filter(e => !apiIds.has(e.id)).map(e => ({
                            engine_id: e.id,
                            engine_name: e.name,
                            category: e.category,
                            shortDescription: e.shortDescription,
                            accessTier: e.accessTier,
                            launchUrl: e.launchUrl,
                            status: e.status
                        }));

                        setEngines([...enhancedData, ...missing]);
                    }
                }
            })
            .catch(() => { });
    }, []);

    const filtered = engines.filter((e: any) => {
        const q = search.toLowerCase();
        const name = e.name || e.engine_name || "";
        const desc = e.shortDescription || e.seo?.description || "";
        return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });

    // 4. Popular Engines Logic
    const popularEngines = POPULAR_IDS.map(id => engines.find((e: any) => (e.id || e.engine_id) === id)).filter(Boolean);
    const displayPopular = popularEngines.length > 0 ? popularEngines : engines.slice(0, 6);

    return (
        <div className="bg-slate-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-12 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Signal Engines Directory</h1>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        Diagnostic tools to detect, fix, and prevent platform bans, suspensions, and traffic leaks.
                    </p>
                </header>

                {/* Search */}
                <div className="relative max-w-lg mb-12">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                        placeholder="Search engines (e.g. 'ads', 'google', 'ban')"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {filtered.map((engine: any) => {
                        const id = engine.id || engine.engine_id;
                        const name = engine.name || engine.engine_name;
                        const desc = engine.shortDescription || engine.seo?.description;
                        const kw = engine.primary_keyword || engine.category || "Utility";
                        const link = id.startsWith('sequence-engine') ? engine.launchUrl : `/go/${id}`;
                        const microcopy = ENGINE_MICROCOPY[id] || DEFAULT_MICROCOPY;

                        const isLive = engine.status === 'live';
                        const badgeColor = isLive ? 'text-green-600' : 'text-amber-600';
                        const badgeIcon = isLive ? <Activity className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />;
                        const badgeText = isLive ? 'LIVE' : 'WAITLIST';
                        const buttonText = isLive ? 'Open Engine' : 'Join Waitlist';
                        const buttonClass = isLive
                            ? "w-full flex items-center justify-center bg-gray-900 text-white font-bold py-2.5 rounded-lg hover:bg-black transition group"
                            : "w-full flex items-center justify-center bg-amber-100 text-amber-900 font-bold py-2.5 rounded-lg hover:bg-amber-200 transition group";

                        return (
                            <div key={id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md hover:border-blue-300 transition duration-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide px-2 py-1 rounded">
                                        {kw}
                                    </div>
                                    <div className={`flex items-center ${badgeColor} text-xs font-bold`}>{badgeIcon} {badgeText}</div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate" title={name}>{name}</h3>
                                <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed line-clamp-3">{desc}</p>

                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <Link
                                        href={link}
                                        className={buttonClass}
                                    >
                                        {buttonText} {isLive && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </Link>
                                    <p className="text-center text-xs text-gray-400 mt-2 font-medium">
                                        {microcopy}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filtered.length === 0 && search && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 mb-16">
                        <p className="text-gray-500 text-lg">No engines found matching "{search}".</p>
                        <button onClick={() => setSearch("")} className="mt-4 text-blue-600 font-medium hover:underline">Clear Search</button>
                    </div>
                )}

                {/* Popular Engines */}
                <div className="border-t border-gray-200 pt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-blue-600" />
                        Most Popular Diagnostics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayPopular.map((engine: any) => {
                            const id = engine.id || engine.engine_id;
                            const name = engine.name || engine.engine_name;
                            const microcopy = ENGINE_MICROCOPY[id] || DEFAULT_MICROCOPY;
                            const link = id.startsWith('sequence-engine') ? engine.launchUrl : `/go/${id}`;

                            return (
                                <Link key={id} href={link} className="group block bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition flex flex-col h-full">
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700">{name}</h3>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-grow">{engine.shortDescription || engine.seo?.description}</p>

                                    {/* Added CTA + Microcopy */}
                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                        <span className="text-sm font-bold text-blue-600 flex items-center mb-1">
                                            Open Engine <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <p className="text-xs text-gray-400 font-medium">
                                            {microcopy}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
