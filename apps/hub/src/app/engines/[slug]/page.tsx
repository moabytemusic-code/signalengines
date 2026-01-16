import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Activity, HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";

// Engine Steps Mapping
const ENGINE_STEPS: Record<string, string[]> = {
    accountrecovery: ["Enter profile URL or ID", "Identify specific lock reason", "Get direct recovery form links"],
    adbleed: ["Connect ad account or upload data", "Analyze CPC/CPM spikes vs benchmarks", "Receive budget optimization plan"],
    amazonsuspend: ["Paste suspension notice text", "Analyze violation type & root cause", "Generate winning Plan of Action (POA)"],
    chargebackalert: ["Upload transaction CSV", "Detect fraud patterns & high-risk BINs", "Get dispute evidence template"],
    compliancealert: ["Enter website URL", "Scan for required policies (GDPR/CCPA)", "Download missing legal templates"],
    domainblock: ["Enter domain name", "Check 50+ security blacklists", "Get specific delisting instructions"],
    emailspam: ["Send test email to analyzer", "Check SPF, DKIM, DMARC & Reputation", "Receive deliverability score & fix guide"],
    fbadban: ["Enter Ad Account ID", "Scan for policy flags & quality score", "Generate professional appeal letter"],
    fbpagerestricted: ["Enter Page URL", "Check page quality status & violations", "Get restriction removal steps"],
    gbpsuspend: ["Enter Business Profile ID", "Diagnose specific suspension cause", "Get reinstatement guide & template"],
    merchantsuspend: ["Input merchant website URL", "Check policy compliance & misrepresentation", "Get appeal template for Stripe/GMC"],
    reviewrepair: ["Paste negative review text", "Analyze sentiment & claims", "Generate professional, neutralized response"],
    sitehacked: ["Enter site URL", "Scan publicly visible malware signatures", "Get immediate cleanup checklist"],
    trackingfix: ["Install helper pixel or providing ID", "Fire test events to validate flow", "Identify missed attribution & fix tracking"]
};

// Engine FAQs Mapping
const ENGINE_FAQS: Record<string, {q: string, a: string}[]> = {
    accountrecovery: [
        { q: "Why is my account locked?", a: "Platforms lock accounts for suspicious login activity, suspected compromise, or age verification failures." },
        { q: "Platform asked for ID, is that safe?", a: "If it is the official in-app prompt, yes. It is the standard way to verify ownership when automated signs fail." },
        { q: "Can I pay someone to unlock it?", a: "Generally, no. 'Hackers' claiming to unlock accounts on social media are usually scams. Use official channels only." },
        { q: "What does this recovery engine do?", a: "It guides you to the correct, often hidden, official support forms for your specific lock type (2FA, ID, hack)." }
    ],
    adbleed: [
        { q: "Why is my CPA rising?", a: "Ad fatigue, audience saturation, or overlapping audiences are common culprits." },
        { q: "How often should I check budget allocation?", a: "Weekly checks are recommended. Daily fluctuating can reset learning phases too often." },
        { q: "What is a 'good' CPM?", a: "It varies wildly by industry. This tool compares your metrics against broad benchmarks to validate if you are overpaying." },
        { q: "What output do I get?", a: "A calculation of wasted spend based on performance drop-offs and a checklist to tighten your targeting." }
    ],
    amazonsuspend: [
        { q: "What is a Section 3 suspension?", a: "It usually refers to dropshipping violations, authenticity complaints, or related accounts. It is critical to identify the root cause before appealing." },
        { q: "Can I just apologize in my appeal?", a: "No. Amazon requires a Plan of Action (POA) containing a root cause, immediate corrective actions, and long-term preventive measures." },
        { q: "What if I don't appeal?", a: "After a certain period (usually 17-90 days), Amazon may permanently deactivate the account and hold funds." },
        { q: "What does the engine output?", a: "It provides a structured Plan of Action (POA) template based on your specific suspension type to maximize reinstatement chances." }
    ],
    chargebackalert: [
        { q: "What triggers a chargeback?", a: "Fraudulent use of a card, unrecognizable billing descriptor, or 'product not as described' claims." },
        { q: "Can I win a dispute?", a: "Yes, if you have compelling evidence like delivery confirmation, IP logs, and signed contracts." },
        { q: "What is a high dispute rate?", a: "Anything above 1% is dangerous and can lead to merchant account termination (MATCH list)." },
        { q: "How does this engine assist?", a: "It analyzes your transaction data for risk patterns and provides an evidence letter template for fighting invalid disputes." }
    ],
    compliancealert: [
        { q: "Do I really need a Privacy Policy?", a: "Yes. Laws like GDPR and CCPA, and platforms like Facebook Ads/Google Ads, require an accessible privacy policy." },
        { q: "What happens if I'm non-compliant?", a: "You risk ad account bans, merchant processing holds, and potential fines depending on your jurisdiction." },
        { q: "Is a generic template enough?", a: "Better than nothing, but it must reflect your actual data practices (cookies, pixels, email collection)." },
        { q: "What does the scan check?", a: "It checks for the presence of required legal pages (Terms, Privacy, Refund) on your domain." }
    ],
    domainblock: [
        { q: "Why is my domain blacklisted?", a: "Sending spam, malware hosting (even if hacked), or deceptive links can land you on lists like Spamhaus or URIBL." },
        { q: "How do I get off a blacklist?", a: "You must fix the root cause (e.g., stop spam, clean malware) and then submit a delisting request to the specific vendor." },
        { q: "Does this affect SEO?", a: "Yes. Security warnings block traffic, increasing bounce rates, which kills organic rankings." },
        { q: "What does the engine do?", a: "It checks your domain against major security blocklists and provides links/steps to request delisting." }
    ],
    emailspam: [
        { q: "Why are my emails going to spam?", a: "Poor reputation, missing authentication (SPF/DKIM), or 'spammy' content words are the main drivers." },
        { q: "What is SPF and DKIM?", a: "DNS records that prove you are authorized to send email from your domain. Without them, you look like a spoofing attacker." },
        { q: "Can I fix a bad sender reputation?", a: "Yes, by stopping cold outreach temporarily, fixing technical records, and warming up the domain with high-engagement email." },
        { q: "How does this tool help?", a: "It analyzes your email headers for authentication failures and content risks." }
    ],
    fbadban: [
        { q: "Why was my ad account disabled?", a: "Common triggers include high negative feedback, payment failures, or violating the Circumventing Systems policy." },
        { q: "Should I create a new account immediately?", a: "No. Creating a new account while one is disabled is a policy violation and often leads to an instant ban on the new asset." },
        { q: "How long does an appeal take?", a: "Reviews typically take 24-48 hours, but can take weeks. This engine helps ensure your first appeal is accurate to speed this up." },
        { q: "What does this engine provide?", a: "It scans for visible flags and generates a professional appeal letter tailored to your specific restriction code." }
    ],
    fbpagerestricted: [
        { q: "What restricts a Facebook Page?", a: "Repeated community standards violations, clickbait, or being associated with 'bad' ad accounts." },
        { q: "Can I advertise with a restricted page?", a: "Usually, no. Advertising access is the first thing removed." },
        { q: "How do I appeal?", a: "You must request a review in the 'Page Quality' or 'Account Quality' dashboard." },
        { q: "What does this engine provide?", a: "It helps identify the severity of the restriction and provides a template for your quality appeal." }
    ],
    gbpsuspend: [
        { q: "Why is my Google Business Profile suspended?", a: "Common reasons include address discrepancies, keyword stuffing in the name, or multiple profiles for the same location." },
        { q: "Is a 'Hard Suspension' permanent?", a: "Not necessarily, but it removes your listing from Maps entirely. Soft suspensions just remove ownership access. Both require reinstatement." },
        { q: "Should I create a new profile?", a: "No. Duplicate profiles trigger further algorithms. Focus on un-suspending the original verified profile." },
        { q: "How does this tool help?", a: "It helps identify specific policy violations in your profile data and guides you through the official Google Reinstatement Form process." }
    ],
    merchantsuspend: [
        { q: "Why did Stripe/PayPal hold my funds?", a: "High chargebacks, sudden spikes in volume, or selling restricted items (like supplements) without pre-approval." },
        { q: "What is 'Misrepresentation' in GMC?", a: "It means Google doesn't trust your site provides what it claims (e.g., missing contact info, unclear refund policy)." },
        { q: "Can I open a new Stripe account?", a: "No. They track tax IDs and personal info. A new account will be linked and banned immediately." },
        { q: "How does the engine help?", a: "It scans for common website compliance failures that trigger these bans and offers an appeal template." }
    ],
    reviewrepair: [
        { q: "Can I delete negative Google reviews?", a: "Only if they violate Google's content policy (hate speech, conflict of interest). You cannot delete legitimate bad feedback." },
        { q: "Should I respond to bad reviews?", a: "Yes. A professional response shows future customers you care and can sometimes convince the reviewer to update their rating." },
        { q: "What is the best way to respond?", a: "Acknowledge the issue, apologize if necessary, and take the conversation offline (phone/email). Do not argue publicly." },
        { q: "What does the engine generate?", a: "A calm, professional, effective response text based on the specific complaint." }
    ],
    sitehacked: [
        { q: "How do I know if I'm hacked?", a: "Redirects to weird sites, new admin users you didn't create, or security warnings in browsers." },
        { q: "What should I do first?", a: "Put the site in maintenance mode and change all passwords (database, FTP, admin panel)." },
        { q: "Will Google de-index me?", a: "If the hack serves malware, Google will show a 'This site may be hacked' warning, killing traffic until fixed." },
        { q: "What does the engine output?", a: "A checklist of locations to check for malware and steps to secure your CMS." }
    ],
    trackingfix: [
        { q: "Why doesn't my Pixel match my sales?", a: "Browser blocks (iOS 14+), ad blockers, or improper installation often cause 15-40% data loss." },
        { q: "What is CAPI?", a: "Conversions API. It sends data from your server to Facebook, bypassing browser-based blocking." },
        { q: "Do I need both Pixel and CAPI?", a: "Yes. They work together (deduplicated) to maximize data accuracy." },
        { q: "What does the tool check?", a: "It validates if your pixel fires correctly on key events (PageView, Purchase) and suggests fixes." }
    ]
};

const DEFAULT_FAQS = [
    { q: "How accurate is the diagnostic?", a: "The engine uses live checks against platform policies and technical indicators to provide a high-confidence assessment." },
    { q: "Is this tool free?", a: "The initial scan and diagnostic report are free. Advanced templates and ongoing monitoring may require a plan." },
    { q: "Does Signal Engines fix it for me?", a: "We provide the exact steps, templates, and data you need to fix it yourself, often faster than hiring an agency." }
];

const DEFAULT_STEPS = ["Start diagnostic scan", "Analyze issue details", "Get clear fix steps"];

// Micro-copy Mapping
const ENGINE_MICROCOPY: Record<string, string> = {
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

async function getEngine(id: string) {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.signalengines.com'}/public/engines/${id}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export default async function EngineDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const engine = await getEngine(slug);

    if (!engine) return notFound();

    const launchUrl = (engine as any).url || (engine as any).launchUrl || `https://${engine.subdomain}.signalengines.com`;
    const steps = ENGINE_STEPS[slug] || DEFAULT_STEPS;
    const faqs = ENGINE_FAQS[slug] || DEFAULT_FAQS;
    const microcopy = ENGINE_MICROCOPY[slug] || DEFAULT_MICROCOPY;

    return (
        <main className="bg-slate-50 min-h-screen">
            {/* Header / Hero */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-x-3 text-sm text-blue-600 font-bold uppercase tracking-wide mb-4">
                            <span className="bg-blue-50 px-2 py-1 rounded">{(engine as any).category || "Utility"}</span>
                            {engine.primary_keyword && <span className="text-gray-400">&bull;</span>}
                            {engine.primary_keyword && <span>{engine.primary_keyword}</span>}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">{engine.engine_name}</h1>
                        <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                            {engine.seo.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                             <div className="flex flex-col items-center">
                                <a
                                    href={launchUrl}
                                    target="_blank"
                                    className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-base font-bold text-white shadow-lg hover:bg-black hover:shadow-xl transition-all min-w-[200px]"
                                >
                                    <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                                    Run Scan Now
                                </a>
                                <p className="text-xs text-gray-400 mt-2 font-medium">{microcopy}</p>
                            </div>

                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-bold text-gray-900 border-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all mb-6 sm:mb-0"
                            >
                                <ShieldCheck className="mr-2 h-5 w-5 text-gray-500" />
                                Join Prevention Club
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content / Features */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        
                        {/* About Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">About this Engine</h2>
                            <div className="prose prose-blue max-w-none bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <p>
                                    The <strong>{engine.engine_name}</strong> is a specialized diagnostic tool designed to help you verify and resolve issues related to <em>{engine.primary_keyword || "your account"}</em>.
                                </p>
                                <p className="mt-4">
                                    Use this engine to instantly analyze your current status and get a step-by-step fix plan. This tool runs on the SignalEngines proprietary verification network.
                                </p>

                                <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                                    <h4 className="text-sm font-bold text-yellow-800 uppercase mb-1">Why prompt action matters</h4>
                                    <p className="text-yellow-700 text-sm">
                                        Delays in resolving {engine.primary_keyword || "compliance"} issues can lead to permanent account restrictions. Run a scan immediately to assess your risk level.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* How It Works Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">How it Works</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <span className="text-6xl font-black text-gray-900">{idx + 1}</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-700 font-bold mb-4 border border-blue-200">
                                                {idx + 1}
                                            </div>
                                            <p className="font-semibold text-gray-800 leading-snug">
                                                {step}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* FAQ Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-4">
                                {faqs.map((item, idx) => (
                                    <details key={idx} className="group bg-white rounded-xl border border-gray-200 open:ring-1 open:ring-blue-100 open:border-blue-300 transition-all duration-200 shadow-sm cursor-pointer">
                                        <summary className="flex items-center justify-between p-5 font-bold text-gray-900 list-none select-none">
                                            <span className="pr-4">{item.q}</span>
                                            <span className="text-gray-400 group-open:text-blue-600 group-open:rotate-180 transition-transform duration-200">
                                                <ChevronDown className="w-5 h-5" />
                                            </span>
                                        </summary>
                                        <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                            {item.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-8 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
                                    <Activity className="mr-2 text-green-600" />
                                    Live Status
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">System Status</span>
                                        <span className="font-bold text-green-600 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>ONLINE</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Access Tier</span>
                                        <span className="font-medium text-gray-900">{(engine as any).accessTier || "Public / Free"}</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span className="text-gray-500">Last Updated</span>
                                        <span className="font-medium text-gray-900">Today</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-4">Need unlimited access to all engines?</p>
                                    <Link href="/pricing" className="text-blue-600 hover:text-blue-700 font-bold text-sm block flex items-center">
                                        Upgrade to Pro <ArrowRight className="ml-1 w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Quick CTA */}
                             <div className="bg-slate-900 rounded-2xl p-6 text-white text-center shadow-lg">
                                <p className="font-bold mb-4">Ready to start?</p>
                                <a
                                    href={launchUrl}
                                    target="_blank"
                                    className="inline-block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition shadow-md"
                                >
                                    Launch Engine
                                </a>
                                <p className="text-xs text-gray-400 mt-3 font-medium opacity-80">{microcopy}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
