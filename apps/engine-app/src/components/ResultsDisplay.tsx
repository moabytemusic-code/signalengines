"use client";

import { Lock, AlertTriangle, CheckCircle, AlertOctagon, ArrowRight, ShieldAlert, Activity, ListChecks } from 'lucide-react';
import Link from 'next/link';

interface ResultsProps {
    run: any;
}

function RiskGauge({ score }: { score: number }) {
    let color = "text-green-500";
    let bgColor = "bg-green-100";
    let label = "Low Risk";
    let icon = <CheckCircle className="w-8 h-8" />;

    if (score >= 70) {
        color = "text-red-600";
        bgColor = "bg-red-100";
        label = "Critical Risk";
        icon = <AlertOctagon className="w-8 h-8" />;
    } else if (score >= 40) {
        color = "text-yellow-600";
        bgColor = "bg-yellow-100";
        label = "Moderate Risk";
        icon = <AlertTriangle className="w-8 h-8" />;
    }

    return (
        <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Simple SVG Circle Gauge (Static) */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-200"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * score) / 100}
                        className={color}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-black ${color}`}>{score}</span>
                </div>
            </div>
            <div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${bgColor} ${color}`}>
                    {icon} <span className="ml-2">{label}</span>
                </div>
                <p className="text-sm text-slate-500">Based on technical signals & policy checks.</p>
            </div>
        </div>
    );
}

export function ResultsDisplay({ run }: ResultsProps) {
    const isLocked = !run.access?.premium;

    // Safely parse JSON output if stringified
    let data: any = {};
    try {
        const raw = run.output?.freeOutput || run.free_output; // Handle nested or flat structure
        data = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
    } catch (e) {
        console.error("Failed to parse free output", e);
    }

    const causes = Array.isArray(data.likely_causes) ? data.likely_causes : [];
    const steps = Array.isArray(data.first_5_steps) ? data.first_5_steps : [];
    const score = typeof data.risk_score === 'number' ? data.risk_score : 0;

    return (
        <div className="space-y-8">
            {/* Free Output (Diagnostic Report) */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center text-white font-bold">
                        <Activity className="w-5 h-5 mr-2 text-blue-400" />
                        Diagnostic Report
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Risk Section */}
                    <div className=" pb-8 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Risk Assessment</h3>
                        <RiskGauge score={score} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Causes */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                <ShieldAlert className="w-5 h-5 mr-2 text-red-500" />
                                Likely Root Causes
                            </h3>
                            <div className="space-y-3">
                                {causes.map((cause: string, i: number) => (
                                    <div key={i} className="flex items-start bg-red-50 p-3 rounded-lg border border-red-100">
                                        <div className="min-w-[6px] h-[6px] rounded-full bg-red-400 mt-2 mr-3"></div>
                                        <p className="text-slate-800 font-medium text-sm leading-relaxed">{cause}</p>
                                    </div>
                                ))}
                                {causes.length === 0 && <p className="text-slate-400 italic">No specific causes identified.</p>}
                            </div>
                        </div>

                        {/* Steps */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                <ListChecks className="w-5 h-5 mr-2 text-blue-600" />
                                Immediate Actions
                            </h3>
                            <div className="space-y-4">
                                {steps.map((step: string, i: number) => (
                                    <div key={i} className="flex">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-0.5">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed pt-1.5">{step}</p>
                                    </div>
                                ))}
                                {steps.length === 0 && <p className="text-slate-400 italic">No steps available.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Paid Output (Gated) */}
            <div className="relative">
                <div className={`transition-all duration-500 ${isLocked ? 'blur-md opacity-60 select-none' : ''}`}>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Full Recovery Assets (Premium)</h3>
                        {isLocked ? (
                            <div className="h-48 bg-slate-100 rounded animate-pulse">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center space-x-4">
                                         <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                                         <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-3 bg-slate-200 rounded w-full"></div>
                                        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                                        <div className="h-3 bg-slate-200 rounded w-4/6"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="prose max-w-none text-slate-700">
                                {run.paid_output ? (
                                    <pre className="bg-green-50 p-4 rounded-lg overflow-x-auto text-sm border border-green-100">
                                        {JSON.stringify(run.paid_output, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="text-slate-500 italic">No additional paid data generated for this run.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pt-12">
                        <div className="text-center bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100 max-w-md mx-4">
                            <div className="bg-blue-50 p-4 rounded-full shadow-inner inline-block mb-4">
                                <Lock className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">Unlock Full Plan</h3>
                            <p className="text-slate-600 mb-8 leading-relaxed">
                                Get the complete templates, scripts, and official links needed to execute the fix safely.
                            </p>
                            <Link
                                href={`/upgrade?engine_id=${run.engine_id}&run_id=${run.run_id}`}
                                className="w-full block bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
                            >
                                Get Instant Access <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <p className="text-xs text-slate-400 mt-4">Safe & Secure Payment • Money-back Guarantee</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
