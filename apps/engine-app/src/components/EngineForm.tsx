"use client";

import { useState } from 'react';
import { EngineConfig } from '@signalengines/engine-config';
import { apiClient } from '../lib/api';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function EngineForm({ config }: { config: EngineConfig }) {
    const [inputs, setInputs] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await apiClient(`/engines/${config.engine_id}/run`, {
                method: 'POST',
                body: JSON.stringify({ inputs })
            });
            router.push(`/r/${res.run_id}`);
        } catch (err: any) {
            alert(err.message || 'Failed to start scan');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-slate-800">Start Scan</h3>
            <div className="space-y-4">
                {config.inputs.map((input) => (
                    <div key={input.id}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            {input.label}
                        </label>
                        {input.type === 'select' ? (
                            <select
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={e => handleChange(input.id, e.target.value)}
                                required={input.required}
                            >
                                <option value="">Select option...</option>
                                {input.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={input.type}
                                placeholder={input.placeholder}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={e => handleChange(input.id, e.target.value)}
                                required={input.required}
                            />
                        )}
                    </div>
                ))}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : 'Run Scan'}
            </button>
        </form>
    );
}
