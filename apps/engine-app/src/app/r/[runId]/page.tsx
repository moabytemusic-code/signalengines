"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '../../../lib/api';
import { ResultsDisplay } from '../../../components/ResultsDisplay';
import { GateModal } from '../../../components/GateModal';
import { useAuth } from '../../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RunResultsPage() {
    const params = useParams();
    const runId = params.runId as string;
    const { user, loading: authLoading } = useAuth();

    const [run, setRun] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!runId || authLoading) return;

        apiClient(`/runs/${runId}`)
            .then(data => setRun(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [runId, authLoading, user]); // Re-fetch if user status changes (e.g. after magic link login)

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
    }

    if (!run) return null;

    // Gate Logic: If user is NOT logged in, show GateModal over results?
    // Actually config said: "If not logged in: show email gate modal... POST /auth/request-link"
    // Does this mean they CANNOT see free results?
    // "results page shows free_output... If not logged in: show email gate modal"
    // Usually "Gate" implies blocking. 
    // But Phase F Scan Flow says: "results page shows free_output... If not logged in: show email gate modal".
    // I will show GateModal *Overlay* but maybe allow seeing Free Output behind it?
    // Or GateModal is for *Unlocking Full Results*?
    // "Enter email to unlock full results"
    // So they CAN see free results. The modal is an Upsell/Capture.
    // I will show GateModal if !user.

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Analysis Results</h1>
                    <div className="text-sm text-slate-500">Run ID: {run.run_id}</div>
                </div>

                <ResultsDisplay run={run} />

                {/* Gate Modal if not logged in */}
                {!user && (
                    <GateModal engineId={run.engine_id} />
                )}
            </div>
        </div>
    );
}
