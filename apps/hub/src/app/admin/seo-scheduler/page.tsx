'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';

export default function SeoSchedulerPage() {
    const { user } = useAuth();
    const [engines, setEngines] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedEngine, setSelectedEngine] = useState("");
    const [isEnabled, setIsEnabled] = useState(true);
    const [dayOfWeek, setDayOfWeek] = useState(1);
    const [hour, setHour] = useState(9);
    const [pagesPerRun, setPagesPerRun] = useState(1);
    const [autoPublish, setAutoPublish] = useState(true);

    useEffect(() => {
        if (!user) return;
        Promise.all([
            apiClient('/public/engines'),
            apiClient('/admin/seo/schedules')
        ]).then(([enginesRes, schedulesRes]) => {
            setEngines(enginesRes);
            setSchedules(schedulesRes);
            setLoading(false);
        }).catch(console.error);
    }, [user]);

    const handleSave = async () => {
        if (!selectedEngine) return;
        try {
            await apiClient('/admin/seo/schedules', {
                method: 'POST',
                body: JSON.stringify({
                    engine_id: selectedEngine,
                    is_enabled: isEnabled,
                    day_of_week: Number(dayOfWeek),
                    hour: Number(hour),
                    pages_per_run: Number(pagesPerRun),
                    auto_publish: autoPublish
                })
            });
            alert("Schedule saved!");
            // Refresh
            const updated = await apiClient('/admin/seo/schedules');
            setSchedules(updated);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleRunNow = async (id: string) => {
        if (!confirm("Run this schedule now? This will generate and potentially publish pages immediately.")) return;
        try {
            await apiClient(`/admin/seo/schedules/${id}/run-now`, { method: 'POST' });
            alert("Job started!");
        } catch (e: any) {
            alert(e.message);
        }
    };

    const editSchedule = (s: any) => {
        setSelectedEngine(s.engineId);
        setIsEnabled(s.isEnabled);
        setDayOfWeek(s.dayOfWeek);
        setHour(s.hour);
        setPagesPerRun(s.pagesPerRun);
        setAutoPublish(s.autoPublish);
    };

    if (!user) return <div className="p-8">Please log in as admin.</div>;
    if (loading) return <div className="p-8 text-center text-gray-500">Loading scheduler...</div>;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">SEO Auto-Publish Scheduler</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Config Panel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-bold mb-4">Setup Weekly Schedule</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Target Engine</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedEngine}
                                onChange={(e) => setSelectedEngine(e.target.value)}
                            >
                                <option value="">Select Engine</option>
                                {engines.map(e => (
                                    <option key={e.engine_id} value={e.engine_id}>{e.engine_name} ({e.engine_id})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Day of Week</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={dayOfWeek}
                                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                                >
                                    <option value={0}>Sunday</option>
                                    <option value={1}>Monday</option>
                                    <option value={2}>Tuesday</option>
                                    <option value={3}>Wednesday</option>
                                    <option value={4}>Thursday</option>
                                    <option value={5}>Friday</option>
                                    <option value={6}>Saturday</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Hour (UTC)</label>
                                <input
                                    type="number"
                                    min="0" max="23"
                                    className="w-full p-2 border rounded"
                                    value={hour}
                                    onChange={e => setHour(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Pages per Run</label>
                                <input
                                    type="number"
                                    min="1" max="2"
                                    className="w-full p-2 border rounded"
                                    value={pagesPerRun}
                                    onChange={e => setPagesPerRun(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isEnabled}
                                        onChange={e => setIsEnabled(e.target.checked)}
                                    />
                                    <span className="text-sm font-semibold">Enabled</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer mt-2">
                                    <input
                                        type="checkbox"
                                        checked={autoPublish}
                                        onChange={e => setAutoPublish(e.target.checked)}
                                    />
                                    <span className="text-sm font-semibold">Auto-Publish</span>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={!selectedEngine}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            Save Schedule
                        </button>
                    </div>
                </div>

                {/* Status Column */}
                <div className="bg-gray-50 p-6 rounded-xl border">
                    <h2 className="text-xl font-bold mb-4">Active Schedules</h2>
                    <div className="space-y-3">
                        {schedules.length === 0 && <p className="text-gray-500 italic">No schedules configured yet.</p>}
                        {schedules.map(s => (
                            <div key={s.id} className="bg-white p-4 rounded shadow-sm border flex justify-between items-center">
                                <div>
                                    <div className="font-bold">{s.engineId}</div>
                                    <div className="text-xs text-gray-500">
                                        Weekly on {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][s.dayOfWeek]} @ {s.hour}:00 UTC
                                    </div>
                                    <div className="text-xs mt-1">
                                        Next: {s.nextRunAt ? new Date(s.nextRunAt).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => editSchedule(s)}
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded"
                                        title="Edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleRunNow(s.id)}
                                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold hover:bg-green-200"
                                    >
                                        Run Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Execution History</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-semibold text-gray-600 text-sm">Engine</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Started</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Published</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Job</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.flatMap(s => (s.runs || []).map((r: any) => (
                            <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium">{r.engineId}</td>
                                <td className="p-4 text-sm text-gray-500">{new Date(r.startedAt).toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${r.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                            r.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm font-bold">{r.publishedCount}</td>
                                <td className="p-4">
                                    {r.jobId && (
                                        <a href={`/admin/seo-generator?jobId=${r.jobId}`} className="text-blue-600 hover:underline text-sm font-medium">
                                            View Job
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))).sort((a: any, b: any) => new Date(b.props.children[1].props.children).getTime() - new Date(a.props.children[1].props.children).getTime()).slice(0, 20)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
