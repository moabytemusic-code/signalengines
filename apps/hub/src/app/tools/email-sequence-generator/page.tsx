'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailSequenceGeneratorPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        niche: '',
        offer: '',
        painPoint: '',
        tone: 'professional'
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [usage, setUsage] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/tools/email-sequence-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.requiresAuth) {
                    router.push('/account?redirect=/tools/email-sequence-generator');
                    return;
                }
                if (data.limitReached) {
                    setError(data.error);
                    setUsage(data);
                    return;
                }
                throw new Error(data.error || 'Failed to generate sequence');
            }

            setResult(data);
            setUsage(data.usage);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExportTXT = () => {
        if (!result?.sequence) return;

        const txtContent = result.sequence.map((email: any, index: number) =>
            `EMAIL ${index + 1}: ${email.type.toUpperCase()}\n\nSubject: ${email.subject}\n\n${email.body}\n\n${email.personalization_tip ? `💡 Personalization Tip: ${email.personalization_tip}\n\n` : ''}---\n\n`
        ).join('');

        const blob = new Blob([txtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-sequence-${result.metadata.niche.replace(/\s+/g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyEmail = (email: any) => {
        const text = `Subject: ${email.subject}\n\n${email.body}`;
        navigator.clipboard.writeText(text);
        alert('Email copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-black mb-6 leading-tight">
                        Generate High-Converting Cold Outreach Sequences in 30 Seconds
                    </h1>
                    <p className="text-xl mb-8 text-indigo-100 max-w-3xl mx-auto">
                        Stop staring at a blank screen. Get a complete 7-part email sequence—including subject lines, follow-ups, and personalization hooks—tailored to your niche, offer, and tone.
                    </p>
                    {usage && (
                        <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold">
                            {usage.limit === 'unlimited'
                                ? '✨ Unlimited generations (Pro)'
                                : `${usage.remaining} of ${usage.limit} free generations remaining today`
                            }
                        </div>
                    )}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-xl font-bold mb-2">Instant Writer's Block Cure</h3>
                            <p className="text-gray-600">Enter your niche and offer, get a full sequence instantly.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🧠</div>
                            <h3 className="text-xl font-bold mb-2">Psychologically Proven</h3>
                            <p className="text-gray-600">Built on frameworks that trigger replies, not spam filters.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold mb-2">Smart Follow-ups</h3>
                            <p className="text-gray-600">Includes "Value Add", "Quick Bump", and "Breakup" emails automatically.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            Generate Your Sequence
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Niche or Industry
                                </label>
                                <input
                                    type="text"
                                    value={formData.niche}
                                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., SaaS for real estate agents"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Your Offer
                                </label>
                                <input
                                    type="text"
                                    value={formData.offer}
                                    onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., Free 30-day trial of our CRM"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Audience Pain Point
                                </label>
                                <input
                                    type="text"
                                    value={formData.painPoint}
                                    onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., Losing leads due to slow follow-up"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tone
                                </label>
                                <select
                                    value={formData.tone}
                                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="professional">Professional</option>
                                    <option value="casual">Casual</option>
                                    <option value="friendly">Friendly</option>
                                    <option value="authority">Authority</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading ? 'Generating Your Sequence...' : 'Generate Sequence'}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 font-medium">{error}</p>
                                {usage?.limitReached && (
                                    <a href="/pricing" className="text-red-800 underline font-semibold mt-2 inline-block">
                                        Upgrade to Pro for unlimited access →
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {result && (
                        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Your Email Sequence
                                </h2>
                                <button
                                    onClick={handleExportTXT}
                                    className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium rounded-lg transition-colors"
                                >
                                    📄 Export as .TXT
                                </button>
                            </div>
                            <div className="space-y-6">
                                {result.sequence?.map((email: any, index: number) => (
                                    <div key={index} className="border-l-4 border-indigo-500 pl-6 py-4 bg-gray-50 rounded-r-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm">
                                                    Email {index + 1}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-700 uppercase">
                                                    {email.type}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleCopyEmail(email)}
                                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                📋 Copy
                                            </button>
                                        </div>
                                        <div className="mb-3">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Subject Line</span>
                                            <p className="text-lg font-bold text-gray-900 mt-1">
                                                {email.subject}
                                            </p>
                                        </div>
                                        <div className="mb-3">
                                            <span className="text-xs font-semibold text-gray-500 uppercase">Email Body</span>
                                            <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                                                {email.body}
                                            </p>
                                        </div>
                                        {email.personalization_tip && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                                <span className="text-xs font-semibold text-yellow-800 uppercase">💡 Pro Tip</span>
                                                <p className="text-sm text-yellow-900 mt-1">
                                                    {email.personalization_tip}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <details className="group border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-800 hover:text-indigo-600 transition-colors">
                                Is this just generic AI text?
                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-4 pb-4 text-gray-600">
                                No. SequenceEngine™ uses a fine-tuned structure based on millions of successful cold emails. It doesn't just write words; it builds a <em>persuasion architecture</em> designed to get replies.
                            </div>
                        </details>
                        <details className="group border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-800 hover:text-indigo-600 transition-colors">
                                Can I use this for LinkedIn?
                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-4 pb-4 text-gray-600">
                                Yes! The "Cold Email" output is perfectly formatted for LinkedIn InMails or connection requests (just shorten slightly).
                            </div>
                        </details>
                        <details className="group border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-800 hover:text-indigo-600 transition-colors">
                                What if I don't like the output?
                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-4 pb-4 text-gray-600">
                                Just hit generate again! You can tweak the "Tone" or "Audience Pain Point" inputs to steer the AI in a new direction.
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            {/* Support Footer */}
            <section className="py-12 px-4 bg-indigo-600 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                    <p className="mb-2">
                        <strong>Support:</strong>{' '}
                        <a href="mailto:support@signalengines.com" className="underline hover:text-indigo-200 transition-colors">
                            support@signalengines.com
                        </a>
                    </p>
                    <p className="text-indigo-200">Response time: 24–48 hours</p>
                </div>
            </section>
        </div>
    );
}
