"use client";

import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { Loader2, ExternalLink, CreditCard } from "lucide-react";

export default function AccountPage() {
    const { user, loading } = useAuth();
    const [loginEmail, setLoginEmail] = useState("");
    const [magicSent, setMagicSent] = useState(false);

    // Data
    const [runs, setRuns] = useState<any[]>([]);
    const [entitlements, setEntitlements] = useState<any>(null);

    useEffect(() => {
        // Handle Session Token Handoff (Fix for Cross-Domain Cookie Issues)
        const params = new URLSearchParams(window.location.search);
        const token = params.get('session_token');
        if (token) {
            console.log("Detected session_token, setting cookie...");
            // Set cookie for root domain if possible, or current host
            const isProd = window.location.hostname !== 'localhost';
            const domain = isProd ? `domain=.signalengines.com;` : '';
            const secure = isProd ? 'secure;' : '';

            document.cookie = `signal_session=${token}; path=/; ${domain} ${secure} max-age=2592000; samesite=${isProd ? 'none' : 'lax'}`;

            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);

            // Reload to pick up cookie? Or just let useAuth fetch /me
            // useAuth likely runs on mount. We might need to trigger re-fetch.
            window.location.reload();
        }
    }, []);

    useEffect(() => {
        if (user) {
            apiClient("/account/runs").then(setRuns).catch(console.error);
            apiClient("/account/entitlements").then(setEntitlements).catch(console.error);
        }
    }, [user]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient("/auth/request-link", {
                method: "POST",
                body: JSON.stringify({ email: loginEmail, engine_id: "hub", return_to: window.location.href })
            });
            setMagicSent(true);
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handlePortal = async () => {
        try {
            const res = await apiClient("/billing/portal", {
                method: "POST",
                body: JSON.stringify({ return_url: window.location.href })
            });
            window.location.href = res.portal_url;
        } catch (e: any) {
            alert(e.message);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    // Login Form State
    if (!user) {
        return (
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    {magicSent ? (
                        <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
                            Check your email (and spam).
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                                <div className="mt-2">
                                    <input id="email" type="email" required
                                        value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                                Send Magic Link
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    // Authenticated View
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-gray-500 mb-8">Logged in as {user.email}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Entitlements / Subscription */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Plan & Billing</h2>
                    <div className="mb-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entitlements?.isPremium ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {entitlements?.isPremium ? 'Premium (Club or Engine)' : 'Free Tier'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                        Daily Limit: {entitlements?.maxRunsPerDay} runs
                    </p>
                    <button onClick={handlePortal} className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <CreditCard className="mr-2 h-4 w-4" /> Manage Billing
                    </button>
                </div>

                {/* Recent Activity */}
                <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Scans</h2>
                    {runs.length === 0 ? (
                        <div className="text-gray-500 italic">No runs yet.</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {runs.map(run => (
                                <li key={run.id} className="py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{run.engineId}</p>
                                        <p className="text-xs text-gray-500">{new Date(run.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${run.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {run.status}
                                        </span>
                                        <a href={`http://${run.engineId}.localhost:3005/r/${run.id}`} className="text-blue-600 hover:text-blue-900">
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
