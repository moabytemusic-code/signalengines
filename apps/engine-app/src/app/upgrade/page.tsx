"use client";

import { useSearchParams } from 'next/navigation';
import { PricingCards } from '../../components/PricingCards';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

function UpgradeContent() {
    const searchParams = useSearchParams();
    const engineId = searchParams.get('engine_id');
    const runId = searchParams.get('run_id');

    if (!engineId || !runId) return <div>Missing params</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <Link href={`/r/${runId}`} className="text-slate-500 hover:text-slate-800 flex items-center mb-6">
                    <ArrowLeft size={16} className="mr-2" /> Back to Results
                </Link>

                <h1 className="text-3xl font-black text-center text-slate-900 mb-4">
                    Upgrade to Unlock Full Results
                </h1>
                <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                    Get immediate access to the solution, templates, and expert guidance you need to resolve this issue.
                </p>

                <PricingCards engineId={engineId} runId={runId} />

                <div className="mt-12 text-center text-sm text-slate-400">
                    <p>Secure payment via Stripe. 100% Money-back guarantee.</p>
                </div>
            </div>
        </div>
    );
}

export default function UpgradePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <UpgradeContent />
        </Suspense>
    );
}
