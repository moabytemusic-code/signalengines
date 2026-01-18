"use client";

import { useState } from 'react';
import { apiClient } from '../lib/api';
import { Loader2, Check } from 'lucide-react';

interface PricingProps {
    engineId: string;
    runId: string;
}

export function PricingCards({ engineId, runId }: PricingProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (product: string) => {
        setLoading(product);
        try {
            const returnUrl = `${window.location.origin}/r/${runId}?success=true`;
            const res = await apiClient('/billing/checkout', {
                method: 'POST',
                body: JSON.stringify({
                    engine_id: engineId,
                    product,
                    success_url: returnUrl,
                    cancel_url: returnUrl
                })
            });
            window.location.href = res.checkout_url;
        } catch (e: any) {
            alert(e.message);
            setLoading(null);
        }
    };

    return (
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 mt-8">
            {/* One Time - Emergency */}
            <div className="bg-white border text-center p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-slate-800">Emergency Kit</h3>
                <div className="text-3xl font-bold mt-2 mb-4">$7</div>
                <p className="text-sm text-slate-600 mb-6">Immediate access to this detailed report + action plan.</p>
                <button
                    onClick={() => handleCheckout('emergency')}
                    disabled={!!loading}
                    className="w-full border-2 border-blue-600 text-blue-600 font-bold py-2 rounded-lg hover:bg-blue-50"
                >
                    {loading === 'emergency' ? <Loader2 className="animate-spin mx-auto" /> : 'Buy One-Time'}
                </button>
            </div>

            {/* One Time - Full */}
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg transform scale-105 relative">
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                <h3 className="text-xl font-bold">Full Recovery</h3>
                <div className="text-3xl font-bold mt-2 mb-4">$27</div>
                <p className="text-sm text-blue-100 mb-6">Lifetime access to this engine + templates + priority support.</p>
                <button
                    onClick={() => handleCheckout('full')}
                    disabled={!!loading}
                    className="w-full bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-blue-50"
                >
                    {loading === 'full' ? <Loader2 className="animate-spin mx-auto" /> : 'Get Full Access'}
                </button>
                <div className="mt-4 text-xs flex items-center justify-center opacity-80">
                    <Check size={14} className="mr-1" /> One-time payment
                </div>
            </div>

            {/* Monthly */}
            <div className="bg-white border text-center p-6 rounded-xl shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-slate-800">Prevention Club</h3>
                <div className="text-3xl font-bold mt-2 mb-4">$29<span className="text-sm font-normal text-slate-500">/mo</span></div>
                <p className="text-sm text-slate-600 mb-6">All engines + monitoring + templates + community.</p>
                <button
                    onClick={() => handleCheckout('monthly')}
                    disabled={!!loading}
                    className="w-full border-2 border-slate-800 text-slate-800 font-bold py-2 rounded-lg hover:bg-slate-50"
                >
                    {loading === 'monthly' ? <Loader2 className="animate-spin mx-auto" /> : 'Join Subscription'}
                </button>
            </div>
        </div>
    );
}
