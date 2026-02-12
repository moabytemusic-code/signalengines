"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Lock, ChevronRight, Download, Save, Copy, Check, Info, Zap } from 'lucide-react';
import { sequenceEngineModule } from './module';

interface SequenceOutput {
    subject_lines?: string[];
    cold_email?: string;
    follow_ups?: string[];
    personalization_hook?: string;
    psychological_trigger?: string;
    cta_variants?: string[];
    upgrade_required?: boolean;
}

export default function SequenceEngineUI() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<SequenceOutput | null>(null);
    const [usage, setUsage] = useState({ current: 0, limit: 3 });
    const [tier, setTier] = useState<'free' | 'pro'>('free'); // Default to free until loaded

    // Form State
    const [formData, setFormData] = useState({
        niche: '',
        offer_type: '',
        target_audience: '',
        traffic_source: 'LinkedIn', // Default
        goal: 'Reply',
        tone: 'Professional',
        personalization_signals: ''
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.subscription?.tier) {
            setTier(user.subscription.tier);
        }
    }, [user]);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/engines/sequence-engine/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 403 && data.upgradeRequired) {
                    setError("Usage limit reached. Please upgrade to Pro.");
                } else {
                    throw new Error(data.error || 'Failed to generate');
                }
            } else {
                setOutput(data.data);
                if (data.usage) {
                    setUsage({ current: data.usage.current, limit: data.usage.limit === 'Unlimited' ? -1 : 3 });
                }
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!output) return;

        let content = `SEQUENCE ENGINE OUTPUT\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
        content += `Niche: ${formData.niche}\nGoal: ${formData.goal}\n\n`;
        content += `----------------------------------------\n`;
        content += `SUBJECT LINES\n`;
        content += `----------------------------------------\n`;
        content += output.subject_lines?.map(s => `- ${s}`).join('\n') + '\n\n';

        content += `----------------------------------------\n`;
        content += `COLD EMAIL\n`;
        content += `----------------------------------------\n`;
        content += `${output.cold_email}\n\n`;

        if (output.follow_ups) {
            output.follow_ups.forEach((f, i) => {
                content += `----------------------------------------\n`;
                content += `FOLLOW-UP ${i + 1}\n`;
                content += `----------------------------------------\n`;
                content += `${f}\n\n`;
            });
        }

        if (output.personalization_hook) {
            content += `----------------------------------------\n`;
            content += `PERSONALIZATION STRATEGY\n`;
            content += `----------------------------------------\n`;
            content += `${output.personalization_hook}\n\n`;
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sequence-${formData.niche.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const isPro = tier === 'pro';
    const isLimitReached = !isPro && usage.current >= usage.limit;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <header className="border-b bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Info size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">{sequenceEngineModule.name}</h1>
                        <p className="text-xs text-slate-500">{sequenceEngineModule.tagline}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPro ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                        {tier}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Inputs */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <span className="bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                            Configuration
                        </h2>

                        <div>
                            <label className="block text-sm font-medium mb-1">Target Niche</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Real Estate Agents"
                                value={formData.niche}
                                onChange={e => setFormData({ ...formData, niche: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Offer Type</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.offer_type}
                                onChange={e => setFormData({ ...formData, offer_type: e.target.value })}
                            >
                                <option value="">Select offer...</option>
                                <option value="Lead Magnet">Free Lead Magnet</option>
                                <option value="Consultation">Free Consultation</option>
                                <option value="SaaS Trial">SaaS Free Trial</option>
                                <option value="High Ticket Service">High Ticket Service</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Target Audience Pain Point</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                                placeholder="What keeps them up at night?"
                                value={formData.target_audience}
                                onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Source</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    value={formData.traffic_source}
                                    onChange={e => setFormData({ ...formData, traffic_source: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Goal</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg bg-white"
                                    value={formData.goal}
                                    onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                >
                                    <option>Reply</option>
                                    <option>Click</option>
                                    <option>Meeting</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Tone</label>
                            <div className="flex flex-wrap gap-2">
                                {['Professional', 'Casual', 'Authority', 'Friendly'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFormData({ ...formData, tone: t })}
                                        className={`px-3 py-1 rounded-full text-xs border ${formData.tone === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isPro && (
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-sm font-medium mb-1 text-indigo-600 flex items-center justify-between">
                                    Personalization Signals
                                    <span className="text-xs bg-indigo-100 px-2 py-0.5 rounded text-indigo-700">PRO</span>
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-indigo-200 bg-indigo-50/30 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-sm"
                                    placeholder="Paste LinkedIn bio, recent post, or website text here for deep personalization..."
                                    value={formData.personalization_signals}
                                    onChange={e => setFormData({ ...formData, personalization_signals: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || isLimitReached || !formData.niche}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${isLimitReached
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
                                    }`}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Generate Sequence'}
                            </button>

                            {isLimitReached && (
                                <a
                                    href="https://moabytemusic.gumroad.com/l/signal-engines-pro"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-3 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-center transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <Zap size={20} className="fill-current text-white" />
                                    Upgrade to Pro to Continue
                                </a>
                            )}
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Output */}
                <div className="lg:col-span-8 space-y-6">
                    {!output ? (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <ChevronRight className="text-slate-300" size={32} />
                            </div>
                            <p className="text-lg font-medium">Your sequence will appear here</p>
                            <p className="text-sm">Fill out the form and click "Generate Sequence" to get started.</p>
                        </div>
                    ) : (
                        <>
                            {/* Usage Display */}
                            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">Usage</p>
                                        <p className="text-xs text-slate-500">
                                            {usage.current} / {usage.limit === -1 ? 'Unlimited' : usage.limit} generations
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleExport}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                    >
                                        <Download size={16} /> Export
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Logic to copy all output to clipboard
                                            let fullOutput = `Subject Lines:\n${output.subject_lines?.map(s => `- ${s}`).join('\n')}\n\n`;
                                            fullOutput += `Cold Email:\n${output.cold_email}\n\n`;
                                            output.follow_ups?.forEach((f, i) => {
                                                fullOutput += `Follow-up ${i + 1}:\n${f}\n\n`;
                                            });
                                            if (output.personalization_hook) {
                                                fullOutput += `Personalization Strategy:\n${output.personalization_hook}\n\n`;
                                            }
                                            copyToClipboard(fullOutput);
                                        }}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                    >
                                        <Copy size={16} /> Copy All
                                    </button>
                                </div>
                            </div>

                            {/* Subject Lines */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                                    <h3 className="font-medium text-sm text-slate-600">Subject Lines</h3>
                                    <button onClick={() => copyToClipboard(output.subject_lines?.join('\n') || '')} className="text-slate-400 hover:text-blue-500"><Copy size={16} /></button>
                                </div>
                                <div className="p-6 prose prose-slate max-w-none">
                                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                                        {output.subject_lines?.map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Cold Email */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                                    <h3 className="font-medium text-sm text-slate-600">Cold Email</h3>
                                    <button onClick={() => copyToClipboard(output.cold_email || '')} className="text-slate-400 hover:text-blue-500"><Copy size={16} /></button>
                                </div>
                                <div className="p-6 prose prose-slate max-w-none">
                                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{output.cold_email}</p>
                                </div>
                            </div>

                            {/* Follow Ups */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900">Follow-up Sequence</h3>
                                {output.follow_ups?.map((email, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                                        <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                                            <span className="font-medium text-sm text-slate-600">Day {i * 2 + 3}: Follow-up {i + 1}</span>
                                            <button onClick={() => copyToClipboard(email)} className="text-slate-400 hover:text-blue-500"><Copy size={16} /></button>
                                        </div>
                                        <div className="p-6">
                                            <p className="whitespace-pre-wrap text-slate-700">{email}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Locked Content for Free Tier */}
                                {output.upgrade_required && (
                                    <div className="relative group cursor-pointer" onClick={() => !isPro && setError("Upgrade to unlock full sequence")}>
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center flex-col gap-3 transition-all group-hover:backdrop-blur-[1px]">
                                            <div className="bg-white p-4 rounded-full shadow-xl border border-amber-100">
                                                <Lock className="text-amber-500" size={24} />
                                            </div>
                                            <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-slate-600">
                                                Unlock 3 More Follow-ups + Secret Variables
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 opacity-50 filter blur-sm select-none">
                                            <div className="bg-slate-50 px-4 py-2 border-b"><span className="h-4 w-24 bg-slate-200 block rounded"></span></div>
                                            <div className="p-6 space-y-2">
                                                <div className="h-4 w-full bg-slate-200 rounded"></div>
                                                <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                                                <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pro Features */}
                            {output.personalization_hook && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                                        <h3 className="font-medium text-sm text-slate-600">Personalization Strategy</h3>
                                        <button onClick={() => copyToClipboard(output.personalization_hook || '')} className="text-slate-400 hover:text-blue-500"><Copy size={16} /></button>
                                    </div>
                                    <div className="p-6 prose prose-slate max-w-none">
                                        <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{output.personalization_hook}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
