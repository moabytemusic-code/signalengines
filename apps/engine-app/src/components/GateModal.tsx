"use client";

import { useState } from 'react';
import { apiClient } from '../lib/api';
import { Loader2, Mail, Check } from 'lucide-react';

export function GateModal({ engineId }: { engineId: string }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient('/auth/request-link', {
                method: 'POST',
                body: JSON.stringify({ email, engine_id: engineId, return_to: window.location.href })
            });
            setSent(true);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Unlock Full Results</h2>
                <p className="text-slate-600 mb-6">Enter your email to save your progress and see detailed findings.</p>

                {sent ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 flex items-center justify-center">
                        <Check className="mr-2" size={20} />
                        <div>
                            <span className="font-bold">Link Sent!</span> Check your email (and spam).
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="w-full p-3 border border-slate-300 rounded-lg mb-4"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Continue'}
                        </button>
                    </form>
                )}

                <p className="text-xs text-slate-400 mt-4">We respect your privacy. No spam.</p>
            </div>
        </div>
    );
}
