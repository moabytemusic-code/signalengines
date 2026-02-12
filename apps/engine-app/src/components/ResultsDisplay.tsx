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
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">

                        {/* Premium Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 md:p-8">
                            <h3 className="text-2xl font-bold mb-2 flex items-center">
                                <ShieldAlert className="mr-3 text-yellow-300" />
                                Emergency Recovery Kit
                            </h3>
                            <p className="text-blue-100">
                                Official templates, checklists, and guides to restore your status.
                            </p>
                        </div>

                        {isLocked ? (
                            // Locked State Placeholder
                            <div className="bg-white p-6 md:p-8 h-96">
                                <div className="space-y-8 animate-pulse">
                                    <div className="space-y-4">
                                        <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                                        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-32 bg-slate-100 rounded"></div>
                                        <div className="h-32 bg-slate-100 rounded"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Unlocked State - Rich Kit Display
                            <div className="p-6 md:p-8">
                                {run.paid_output ? (
                                    <div className="space-y-10">

                                        {/* 1. Action Plan */}
                                        {run.paid_output.action_plan && (
                                            <section>
                                                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">1</span>
                                                    Your Action Plan
                                                </h4>
                                                <div className="prose prose-slate max-w-none text-slate-700 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                                    {Array.isArray(run.paid_output.action_plan)
                                                        ? run.paid_output.action_plan.map((step: string, i: number) => (
                                                            <div key={i} className="mb-2 flex items-start">
                                                                <ArrowRight className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                                                                <span>{step}</span>
                                                            </div>
                                                        ))
                                                        : <p>{run.paid_output.action_plan}</p>
                                                    }
                                                </div>
                                            </section>
                                        )}

                                        {/* 2. Appeal Templates */}
                                        {run.paid_output.templates && (
                                            <section>
                                                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm">2</span>
                                                    Copy-Paste Templates
                                                </h4>
                                                <div className="space-y-6">
                                                    {run.paid_output.templates.map((tmpl: any, i: number) => (
                                                        <div key={i} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                                                <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">{tmpl.title || `Template #${i + 1}`}</span>
                                                                <button
                                                                    onClick={() => { navigator.clipboard.writeText(tmpl.content); alert('Copied to clipboard!'); }}
                                                                    className="text-xs bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 px-3 py-1 rounded-md font-medium transition-colors"
                                                                >
                                                                    Copy Text
                                                                </button>
                                                            </div>
                                                            <div className="p-4 bg-white">
                                                                <textarea
                                                                    readOnly
                                                                    className="w-full h-48 text-sm text-slate-600 font-mono p-4 bg-slate-50 border-0 rounded-lg focus:ring-0 resize-none selection:bg-indigo-100 selection:text-indigo-900"
                                                                    defaultValue={tmpl.content}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2 italic">Tip: Customize the bracketed text [like this] before sending.</p>
                                            </section>
                                        )}

                                        {/* 3. Checklist */}
                                        {run.paid_output.checklist && (
                                            <section>
                                                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 text-sm">3</span>
                                                    Compliance Checklist
                                                </h4>
                                                <div className="grid gap-3">
                                                    {run.paid_output.checklist.map((item: string, i: number) => (
                                                        <label key={i} className="flex items-start p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all">
                                                            <input type="checkbox" className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 mt-0.5 mr-3" />
                                                            <span className="text-slate-700">{item}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {/* Fallback for raw data if structured keys missing */}
                                        {!run.paid_output.templates && !run.paid_output.checklist && !run.paid_output.action_plan && (
                                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                                                <h5 className="font-bold mb-2">Raw Output Data</h5>
                                                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs">{JSON.stringify(run.paid_output, null, 2)}</pre>
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                    <div className="text-slate-500 italic p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                        No additional kit data was generated for this specific run.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ------------------------------------------------------------------ */}
                    {/* 4. NEW PATH ENGINE RESULTS DISPLAY */}
                    {/* ------------------------------------------------------------------ */}
                    {run.paid_output && run.paid_output.path_results && Object.keys(run.paid_output.path_results).length > 0 && (
                        <section className="bg-slate-50 border-t border-slate-200 p-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                                <Activity className="w-6 h-6 mr-3 text-purple-600" />
                                Demand & Monetization Paths
                            </h3>

                            <div className="space-y-8">
                                {Object.entries(run.paid_output.path_results).map(([pathId, result]: [string, any]) => (
                                    <div key={pathId} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                        {/* Path Header */}
                                        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
                                                <h4 className="font-bold text-slate-800 uppercase tracking-wide text-sm">{pathId.replace(/_/g, " ")}</h4>
                                            </div>
                                            {result.monetization && (
                                                <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 text-xs font-bold">
                                                    <span>Est. Value:</span>
                                                    <span>{result.monetization.currency} {result.monetization.value}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Path Body */}
                                        <div className="p-6">

                                            {/* Buyer Intent Data */}
                                            {result.data.outline && (
                                                <div className="mb-6">
                                                    <h5 className="font-bold text-slate-700 mb-2">Content Outline ({result.data.intent})</h5>
                                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm">
                                                        <div className="font-bold text-lg mb-2">{result.data.outline.h1}</div>
                                                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                                                            {result.data.outline.sections.map((s: any, i: number) => (
                                                                <li key={i}>{s.h2}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Competitor / Leads Data */}
                                            {result.data.sources && (
                                                <div className="mb-6">
                                                    <h5 className="font-bold text-slate-700 mb-2">Detailed Signal Sources</h5>
                                                    <ul className="space-y-2">
                                                        {result.data.sources.slice(0, 3).map((s: any, i: number) => (
                                                            <li key={i} className="flex items-center text-sm text-slate-600">
                                                                <ArrowRight className="w-3 h-3 text-purple-400 mr-2" />
                                                                <a href={s.url} target="_blank" className="hover:text-purple-600 underline truncate max-w-xs">{s.url}</a>
                                                                <span className="ml-2 text-xs text-slate-400">({s.source_type})</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Leads Data */}
                                            {result.data.leads && (
                                                <div className="mb-6">
                                                    <h5 className="font-bold text-slate-700 mb-2">Verified Leads ({result.data.count})</h5>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full text-sm text-left">
                                                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                                                <tr>
                                                                    <th className="px-3 py-2">Name</th>
                                                                    <th className="px-3 py-2">Source</th>
                                                                    <th className="px-3 py-2">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {result.data.leads.slice(0, 5).map((l: any, i: number) => (
                                                                    <tr key={i} className="border-t border-slate-100">
                                                                        <td className="px-3 py-2">{l.contact?.name || "N/A"}</td>
                                                                        <td className="px-3 py-2 truncate max-w-[100px]">{l.url}</td>
                                                                        <td className="px-3 py-2">
                                                                            {l.contact?.verified ?
                                                                                <span className="text-green-600 font-bold text-xs">Verified</span> :
                                                                                <span className="text-slate-400 text-xs">Unknown</span>
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommended Offers */}
                                            {result.monetization && result.monetization.offers && result.monetization.offers.length > 0 && (
                                                <div className="mt-6 border-t border-slate-100 pt-4">
                                                    <h5 className="font-bold text-slate-700 mb-3 text-xs uppercase tracking-wider">Monetization Opportunities</h5>
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {result.monetization.offers.map((offer: any, i: number) => (
                                                            <a key={i} href={offer.link || "#"} target="_blank" className="block group">
                                                                <div className={`p-3 rounded-lg border transition-all ${offer.type === 'Internal' ? 'bg-amber-50 border-amber-200 hover:border-amber-400' : 'bg-white border-slate-200 hover:border-purple-300'}`}>
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <div className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{offer.name}</div>
                                                                            <div className="text-xs text-slate-500 mt-1">{offer.type} Offer</div>
                                                                        </div>
                                                                        {offer.payout && <div className="font-mono font-bold text-green-600 text-sm bg-white px-2 py-1 rounded shadow-sm">{offer.payout}</div>}
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
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
    );
}
