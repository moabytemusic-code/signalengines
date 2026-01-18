"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/api';
import { ResultsDisplay } from '../../../components/ResultsDisplay';
import { GateModal } from '../../../components/GateModal';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, Check, FileText, Loader2, Shield } from 'lucide-react';


const RELATED_ENGINES: Record<string, string[]> = {
    fbadban: ['trackingfix', 'compliancealert'],
    gbpsuspend: ['compliancealert', 'reviewrepair'],
    emailspam: ['domainblock', 'compliancealert'],
    default: ['compliancealert', 'sitehacked']
};

export default function RunResultsPage() {
    const params = useParams();
    const runId = params.runId as string;
    const { user, loading: authLoading } = useAuth();
    const router = useRouter(); // Helper for navigation if needed

    const [run, setRun] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!runId || authLoading) return;

        apiClient(`/runs/${runId}`)
            .then(data => setRun(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [runId, authLoading, user]);

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
    }

    if (!run) return null;

    const relatedKeys = RELATED_ENGINES[run.engine_id] || RELATED_ENGINES.default;

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Analysis Results</h1>
                    <div className="text-sm text-slate-500">Run ID: {run.run_id}</div>
                </div>

                <ResultsDisplay run={run} />

                {/* Phase 3: Ethical Monetization Layers */}
                <div className="mt-12 space-y-8">

                    {/* 6. Soft Paid Upgrades */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Recommended Recovery Paths</h2>
                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Option A: Toolkit ($19) */}
                            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <FileText size={24} />
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">$19</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Recovery Toolkit</h3>
                                <p className="text-sm text-slate-500 mb-6">Want this in a clean, copy-paste format? Get the exact templates and checklists needed.</p>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-center text-sm text-slate-600"><Check size={16} className="text-green-500 mr-2" /> Appeal Templates</li>
                                    <li className="flex items-center text-sm text-slate-600"><Check size={16} className="text-green-500 mr-2" /> Compliance Checklist</li>
                                </ul>
                                <button className="w-full py-2 px-4 bg-white border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                                    Get Toolkit
                                </button>
                            </div>

                            {/* Option B: Guided Fix ($49) */}
                            <div className="bg-white border-2 border-blue-600 rounded-xl p-6 shadow-md relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                                        <Shield size={24} />
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">$49</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Guided Repair</h3>
                                <p className="text-sm text-slate-500 mb-6">Follow step-by-step with guided prompts to ensure you don't miss a critical detail.</p>
                                <ul className="space-y-2 mb-6">
                                    <li className="flex items-center text-sm text-slate-600"><Check size={16} className="text-green-500 mr-2" /> Interactive Walkthrough</li>
                                    <li className="flex items-center text-sm text-slate-600"><Check size={16} className="text-green-500 mr-2" /> Confirmation Checkpoints</li>
                                    <li className="flex items-center text-sm text-slate-600"><Check size={16} className="text-green-500 mr-2" /> Priority Support</li>
                                </ul>
                                <button className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                    Start Guided Fix
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* 7. Prevention Recurring Offer */}
                    <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-bold mb-2 flex items-center">
                                    <Shield className="mr-2 text-green-400" />
                                    Avoid this happening again
                                </h3>
                                <p className="text-slate-300 text-sm max-w-lg">
                                    Get 24/7 monitoring and prevention checklists to future-proof your business against automated flags.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold">$29<span className="text-sm font-normal text-slate-400">/mo</span></span>
                                <button className="py-2 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors">
                                    Enable Protection
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Phase 4: Related Checks */}
                    <section className="pt-8 border-t border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">You may also want to check...</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            {relatedKeys.map(key => (
                                <a key={key} href={`http://${key}.signalengines.com`} className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-700 capitalize">{key.replace('fix', ' Fix').replace('alert', ' Alert')}</span>
                                        <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-xs text-slate-500">Run a quick diagnostic check.</p>
                                </a>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Gate Modal if not logged in */}
                {!user && (
                    <GateModal engineId={run.engine_id} />
                )}
            </div>
        </div>
    );
}
