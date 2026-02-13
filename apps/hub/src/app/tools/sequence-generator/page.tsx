'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SequenceGeneratorPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        topic: '',
        platform: 'tiktok',
        tone: 'educational',
        count: 5
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
            const res = await fetch('/api/tools/sequence-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.requiresAuth) {
                    router.push('/account?redirect=/tools/sequence-generator');
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

    const handleExportCSV = () => {
        if (!result?.sequence) return;

        const csvRows = [
            ['Post #', 'Hook Type', 'Hook', 'Content', 'Hashtags'],
            ...result.sequence.map((post: any, index: number) => [
                index + 1,
                post.hook_type,
                post.hook,
                post.content,
                post.hashtags?.join(' ') || ''
            ])
        ];

        const csvContent = csvRows.map(row =>
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sequence-${result.metadata.topic.replace(/\s+/g, '-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportJSON = () => {
        if (!result) return;

        const jsonContent = JSON.stringify(result, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sequence-${result.metadata.topic.replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyAll = () => {
        if (!result?.sequence) return;

        const text = result.sequence.map((post: any, index: number) =>
            `Post ${index + 1}: ${post.hook_type}\n\n${post.hook}\n\n${post.content}\n\n${post.hashtags?.join(' ') || ''}`
        ).join('\n\n---\n\n');

        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-black mb-6 leading-tight">
                        Generate Viral Content Sequences in Seconds
                    </h1>
                    <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
                        Stop posting randomly. Get a strategic content sequence designed to build momentum, grow your audience, and maximize engagement on any platform.
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
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold mb-2">Strategic Sequencing</h3>
                            <p className="text-gray-600">Posts that build on each other, taking viewers from awareness to engagement to action.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🔥</div>
                            <h3 className="text-xl font-bold mb-2">Platform-Optimized</h3>
                            <p className="text-gray-600">Tailored for TikTok, Instagram, YouTube Shorts, or Twitter with platform-specific best practices.</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">⚡</div>
                            <h3 className="text-xl font-bold mb-2">Hook Variety</h3>
                            <p className="text-gray-600">Mix of questions, stats, stories, and controversies to keep your feed fresh and engaging.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tool Section */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            Generate Your Content Sequence
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Topic or Niche
                                </label>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., AI productivity tools"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Platform
                                </label>
                                <select
                                    value={formData.platform}
                                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="tiktok">TikTok</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="youtube">YouTube Shorts</option>
                                    <option value="twitter">Twitter/X</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Content Tone
                                </label>
                                <select
                                    value={formData.tone}
                                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="educational">Educational</option>
                                    <option value="entertaining">Entertaining</option>
                                    <option value="inspirational">Inspirational</option>
                                    <option value="promotional">Promotional</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Number of Posts (3-10)
                                </label>
                                <input
                                    type="number"
                                    min="3"
                                    max="10"
                                    value={formData.count}
                                    onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading ? 'Generating...' : 'Generate Sequence'}
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
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Your Content Sequence
                                </h2>
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={handleCopyAll}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                                    >
                                        📋 Copy All
                                    </button>
                                    <button
                                        onClick={handleExportCSV}
                                        className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition-colors"
                                    >
                                        📊 Export CSV
                                    </button>
                                    <button
                                        onClick={handleExportJSON}
                                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-colors"
                                    >
                                        💾 Export JSON
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {result.sequence?.map((post: any, index: number) => (
                                    <div key={index} className="border-l-4 border-blue-500 pl-6 py-4 bg-gray-50 rounded-r-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-sm">
                                                Post {index + 1}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {post.hook_type}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {post.hook}
                                        </h3>
                                        <p className="text-gray-700 mb-3">
                                            {post.content}
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            {post.hashtags?.map((tag: string, i: number) => (
                                                <span key={i} className="text-sm text-blue-600 font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Use Content Sequences?</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-bold text-lg mb-2">📈 Build Momentum</h3>
                            <p className="text-gray-600">Each post builds on the last, creating a narrative that keeps viewers coming back for more.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-bold text-lg mb-2">🎨 Stay Consistent</h3>
                            <p className="text-gray-600">Never run out of ideas. Generate weeks of content in minutes with a cohesive strategy.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-bold text-lg mb-2">💡 Hook Variety</h3>
                            <p className="text-gray-600">Mix questions, stats, stories, and controversies to keep your audience engaged.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="font-bold text-lg mb-2">🚀 Platform-Specific</h3>
                            <p className="text-gray-600">Optimized for each platform's algorithm and best practices for maximum reach.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <details className="group border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-800 hover:text-blue-600 transition-colors">
                                How is this different from ChatGPT?
                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-4 pb-4 text-gray-600">
                                This tool generates <em>sequences</em>, not individual posts. Each post is strategically designed to build on the previous one, creating a content arc that maximizes engagement and audience growth. Plus, it's optimized for each platform's specific best practices.
                            </div>
                        </details>
                        <details className="group border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-800 hover:text-blue-600 transition-colors">
                                Can I edit the generated content?
                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-4 pb-4 text-gray-600">
                                Absolutely! Use the export or copy features to get the content into your preferred editor. The generated sequences are starting points—personalize them to match your unique voice and brand.
                            </div>
                        </details>
                        <details className="group border border-gray-200 rounded-lg overflow-hidden bg-white">
                            <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-gray-800 hover:text-blue-600 transition-colors">
                                What's the difference between free and pro?
                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-4 pb-4 text-gray-600">
                                Free users get 3 sequence generations per day. Pro users get unlimited generations, priority support, and access to all our other tools and engines.
                            </div>
                        </details>
                    </div>
                </div>
            </section>
        </div>
    );
}
