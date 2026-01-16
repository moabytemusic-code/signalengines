import { headers } from 'next/headers';
import { EngineForm } from '../components/EngineForm';
import { EngineConfig } from '@signalengines/engine-config';
import EngineNotFound from './engine-not-found/page';

// 1. Micro-copy Mapping for Form Area
const ENGINE_FORM_MICROCOPY: Record<string, string> = {
  accountrecovery: "Answer a few questions to identify the fastest recovery path.",
  adbleed: "Quick inputs reveal where spend is leaking.",
  amazonsuspend: "Clarify the issue before submitting an appeal.",
  chargebackalert: "Identify dispute triggers before they escalate.",
  compliancealert: "Check gaps before they turn into enforcement issues.",
  domainblock: "Confirm risk level before attempting delisting.",
  emailspam: "Identify deliverability issues before sending more.",
  fbadban: "Determine the likely trigger before appealing.",
  fbpagerestricted: "Find the cleanest fix before making changes.",
  gbpsuspend: "Verify requirements before requesting reinstatement.",
  merchantsuspend: "Resolve policy issues before re-review.",
  reviewrepair: "Choose the right response for your situation.",
  sitehacked: "Stabilize first—then fix safely.",
  trackingfix: "Confirm what’s broken before optimizing ads."
};

// 2. Steps Mapping for "How it Works"
const ENGINE_STEPS: Record<string, {title: string, desc: string}[]> = {
    accountrecovery: [
        { title: "Input Profile", desc: "Enter your locked profile URL or ID." },
        { title: "Diagnose Lock", desc: "We identify the specific lock type (2FA, ID, etc)." },
        { title: "Get Recovery Link", desc: "Access the precise official form to unlock it." }
    ],
    adbleed: [
        { title: "Connect/Upload", desc: "Securely input your ad performance data." },
        { title: "Audit Spend", desc: "We detect high CPA/CPM anomalies." },
        { title: "Stop Bleeding", desc: "Get a checklist to cut wasted budget." }
    ],
    amazonsuspend: [
        { title: "Paste Notice", desc: "Input your suspension email text." },
        { title: "Analyze Root Cause", desc: "We identify the exact policy violation." },
        { title: "Generate POA", desc: "Get a tailored Plan of Action template." }
    ],
    chargebackalert: [
        { title: "Upload Orders", desc: "Input recent transaction details." },
        { title: "Risk Scan", desc: "Detect fraud patterns or high-risk bins." },
        { title: "Prevent Disputes", desc: "Get evidence templates to win fights." }
    ],
    compliancealert: [
        { title: "Enter URL", desc: "Input your website domain." },
        { title: "Policy Scan", desc: "We check for GDPR, CCPA, and Legal pages." },
        { title: "Download Fixes", desc: "Get missing legal templates instantly." }
    ],
    domainblock: [
        { title: "Check Domain", desc: "Enter your URL to scan security lists." },
        { title: "Identify Blacklists", desc: "See exactly who is blocking you (Spamhaus, etc)." },
        { title: "Request Delisting", desc: "Get direct removal links for each vendor." }
    ],
    emailspam: [
        { title: "Send Test", desc: "Send an email to our analyzer address." },
        { title: "Check Headers", desc: "We verify SPF, DKIM, DMARC alignment." },
        { title: "Fix Delivery", desc: "Get a score and steps to hit the inbox." }
    ],
    fbadban: [
        { title: "Enter ID", desc: "Input your Ad Account ID." },
        { title: "Scan Status", desc: "We check account quality and policy flags." },
        { title: "Appeal Smart", desc: "Generate a professional appeal letter." }
    ],
    fbpagerestricted: [
        { title: "Enter Page URL", desc: "Input the restricted Facebook Page." },
        { title: "Check Violations", desc: "Identify community standards triggers." },
        { title: "Restore Quality", desc: "Get steps to clear the restriction." }
    ],
    gbpsuspend: [
        { title: "Input Business", desc: "Enter your Google Business Profile ID." },
        { title: "Check Guidelines", desc: "We scan for name/address violations." },
        { title: "Reinstatement", desc: "Get the correct form/template to appeal." }
    ],
    merchantsuspend: [
        { title: "Scan Website", desc: "Enter your store URL." },
        { title: "Check Policy", desc: "Find 'Misrepresentation' triggers." },
        { title: "Audit & Fix", desc: "Get a checklist to clear the suspension." }
    ],
    reviewrepair: [
        { title: "Paste Review", desc: "Input the negative review text." },
        { title: "Analyze Intent", desc: "We detect claims and sentiment." },
        { title: "Generate Reply", desc: "Get a professional, de-escalating response." }
    ],
    sitehacked: [
        { title: "Scan Site", desc: "Enter URL to check for public malware." },
        { title: "Isolate Threat", desc: "Identify infected files or user accounts." },
        { title: "Clean & Secure", desc: "Get a recovery checklist to safe-mode." }
    ],
    trackingfix: [
        { title: "Check Pixel", desc: "Input ID or use the helper tool." },
        { title: "Fire Events", desc: "Validate PageView and Purchase events." },
        { title: "Fix CAPI", desc: "Identify server-side tracking gaps." }
    ]
};

const DEFAULT_MICROCOPY = "Answer a few questions to get clear next steps.";
const DEFAULT_STEPS = [
    { title: "Input Details", desc: "Provide basic context about your specific issue." },
    { title: "Run Analysis", desc: "We compare your data against known benchmarks." },
    { title: "Get Fix Plan", desc: "Receive instant steps to resolve the problem." }
];

async function getEngineConfig(engineId: string): Promise<EngineConfig | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4005';
    const res = await fetch(`${baseUrl}/public/engines/${engineId}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function LandingPage() {
  const headersList = await headers();
  const engineId = headersList.get('x-engine-id');

  if (!engineId) {
    return <EngineNotFound errorCode="SIG_ID_MISSING" />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4005';
  const config = await getEngineConfig(engineId);

  if (!config) {
    return (
      <EngineNotFound
        engineId={engineId}
        errorCode="SIG_CONFIG_LOAD_FAILED"
        debugInfo={`API_BASE: ${baseUrl} | ID: ${engineId}`}
      />
    );
  }

  // Determine contents
  const microcopy = ENGINE_FORM_MICROCOPY[engineId] || DEFAULT_MICROCOPY;
  const steps = ENGINE_STEPS[engineId] || DEFAULT_STEPS;
  const displayTitle = config.seo?.title?.split('|')[0] || config.engine_name;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
          
          {/* Left Column: Content */}
          <div className="flex-1 space-y-6 pt-4">
            <div className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Free Diagnostic Tool
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              {displayTitle}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
              {config.seo?.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 text-sm font-medium text-slate-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Instant Results
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                No Credit Card Required
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Live System Check
              </span>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 md:p-2">
                 <div className="px-6 pt-6 pb-2">
                    <p className="text-sm text-slate-500 font-medium tracking-tight">
                        {microcopy}
                    </p>
                 </div>
                 <EngineForm config={config} />
            </div>
          </div>

        </div>
      </section>

      {/* Trust / Process Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-12">How Signal Engines Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, idx) => (
                <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-blue-600 text-xl">{idx + 1}</div>
                  <h3 className="font-bold text-lg mb-3 text-slate-900">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
            ))}
        </div>
      </section>
    </main>
  );
}
