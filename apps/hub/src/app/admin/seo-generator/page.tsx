"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';

export default function SeoGeneratorPage() {
    const { user } = useAuth();
    const [engines, setEngines] = useState<any[]>([]);

    // Batch States
    const [batchInput, setBatchInput] = useState("");
    const [batchLoading, setBatchLoading] = useState(false);
    const [batchDryRun, setBatchDryRun] = useState(true);
    const [batchOverwrite, setBatchOverwrite] = useState(false);
    const [batchGenerate, setBatchGenerate] = useState(true);
    const [batchPublish, setBatchPublish] = useState(false);
    const [batchResults, setBatchResults] = useState<any[]>([]);

    // Existing Single Gen States
    const [selectedEngine, setSelectedEngine] = useState("");
    const [dryRun, setDryRun] = useState(true);
    const [overwrite, setOverwrite] = useState(false);
    const [currentJob, setCurrentJob] = useState<any>(null);
    const [previews, setPreviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState<any>(null);

    useEffect(() => {
        apiClient('/public/engines').then(setEngines).catch(console.error);
    }, []);

    const handleBatchCreate = async () => {
        setBatchLoading(true);
        setBatchResults([]);
        try {
            // Parse Input
            let engines: any[] = [];
            const trimmed = batchInput.trim();
            if (trimmed.startsWith("[")) {
                try { engines = JSON.parse(trimmed); } catch (e) { alert("Invalid JSON"); setBatchLoading(false); return; }
            } else {
                engines = trimmed.split("\n").map(s => s.trim()).filter(Boolean);
            }

            const res = await apiClient('/admin/engines/batch-create', {
                method: 'POST',
                body: JSON.stringify({
                    engines,
                    dry_run: batchDryRun,
                    overwrite: batchOverwrite,
                    generate_pages: batchGenerate,
                    publish_pages: batchPublish
                })
            });

            setBatchResults(res.results || []);

            if (res.generated_jobs && res.generated_jobs.length > 0) {
                // If we generated jobs, maybe we want to poll them? 
                // For now just alert or list them.
                console.log("Started jobs:", res.generated_jobs);
            }

            // Refresh engine list
            apiClient('/public/engines').then(setEngines).catch(console.error);

        } catch (e: any) {
            alert(e.message);
        } finally {
            setBatchLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await apiClient('/admin/seo/generate', {
                method: 'POST',
                body: JSON.stringify({
                    engine_id: selectedEngine,
                    mode: 'standard_5',
                    dry_run: dryRun,
                    overwrite: overwrite
                })
            });
            if (res.job_id) {
                pollJob(res.job_id);
            }
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    const pollJob = (jobId: string) => {
        const interval = setInterval(async () => {
            const job = await apiClient(`/admin/seo/jobs/${jobId}`);
            setCurrentJob(job);
            if (job.status === 'COMPLETED') {
                setPreviews(JSON.parse(job.resultJson));
                clearInterval(interval);
            } else if (job.status === 'FAILED') {
                clearInterval(interval);
            }
        }, 1000);
        setRefreshInterval(interval);
    };

    const handlePublish = async () => {
        if (!currentJob) return;
        if (!confirm("Are you sure you want to publish these pages?")) return;

        try {
            await apiClient(`/admin/seo/jobs/${currentJob.id}/publish`, { method: 'POST' });
            alert("Published successfully!");
            location.reload();
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (!user) return <div className="p-8">Please log in.</div>;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Programmatic SEO Generator</h1>

            {/* Batch Panel */}
            <div className="bg-white p-6 rounded shadow mb-8 border-l-4 border-purple-500">
                <h2 className="text-xl font-bold mb-4">Batch Create Engines</h2>
                <div className="mb-4">
                    <label className="block mb-2 font-semibold">Engine IDs (one per line) or JSON Array</label>
                    <textarea
                        className="w-full p-2 border rounded h-32 font-mono text-sm"
                        placeholder={`example_engine\nanother_engine\n\nOR\n\n[{ "engine_id": "test", "seo": {...} }]`}
                        value={batchInput}
                        onChange={e => setBatchInput(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={batchDryRun} onChange={e => setBatchDryRun(e.target.checked)} />
                        Dry Run
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={batchOverwrite} onChange={e => setBatchOverwrite(e.target.checked)} />
                        Overwrite
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={batchGenerate} onChange={e => setBatchGenerate(e.target.checked)} />
                        Generate Pages
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={batchPublish} onChange={e => setBatchPublish(e.target.checked)} />
                        Auto Publish
                    </label>
                </div>
                <button
                    onClick={handleBatchCreate}
                    disabled={batchLoading || !batchInput}
                    className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                    {batchLoading ? 'Processing...' : 'Batch Create / Update'}
                </button>

                {batchResults.length > 0 && (
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">Engine ID</th>
                                    <th className="p-2 text-left">Status</th>
                                    <th className="p-2 text-left">Config Preview</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batchResults.map((r, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-2 font-medium">{r.engineId || r.input?.engine_id || JSON.stringify(r.input)}</td>
                                        <td className={`p-2 ${r.success ? 'text-green-600' : 'text-red-600'}`}>
                                            {r.success ? (r.dry_run ? 'Dry Run OK' : 'Created') : r.error}
                                        </td>
                                        <td className="p-2 font-mono text-xs text-gray-500 max-w-xs truncate">
                                            {JSON.stringify(r.config_preview)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Manual Generator</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-2 font-semibold">Target Engine</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedEngine}
                            onChange={(e) => setSelectedEngine(e.target.value)}
                        >
                            <option value="">Select Engine...</option>
                            {engines.map(e => <option key={e.engine_id} value={e.engine_id}>{e.engine_name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} />
                        Dry Run (Preview Only)
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={overwrite} onChange={e => setOverwrite(e.target.checked)} />
                        Overwrite Existing
                    </label>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !selectedEngine}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Generating...' : 'Generate Pages'}
                    </button>
                    {currentJob && currentJob.status === 'COMPLETED' && (
                        <button
                            onClick={handlePublish}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                            Approve & Publish
                        </button>
                    )}
                </div>
            </div>

            {currentJob && (
                <div className="bg-gray-50 p-6 rounded border">
                    <h3 className="font-bold mb-4">Job Status: {currentJob.status}</h3>
                    <div className="space-y-2">
                        {previews.map((p, i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-3 rounded border">
                                <div>
                                    <div className="font-semibold">{p.title}</div>
                                    <div className="text-sm text-gray-500">{p.slug} • {p.wordCount} words</div>
                                </div>
                                <div className={`text-sm font-bold ${p.status === 'NEW' ? 'text-green-600' : 'text-orange-500'}`}>
                                    {p.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
