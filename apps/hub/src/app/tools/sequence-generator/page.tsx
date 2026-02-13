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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Content Sequence Generator
                    </h1>
                    <p className="text-lg text-gray-600">
                        Generate a strategic content sequence for your social media
                    </p>
                    {usage && (
                        <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                            {usage.limit === 'unlimited'
                                ? '✨ Unlimited generations (Pro)'
                                : `${usage.remaining} of ${usage.limit} free generations remaining today`
                            }
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
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
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Generating...' : 'Generate Sequence'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}
                </div>

                {result && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Your Content Sequence
                            </h2>
                            <div className="flex gap-2">
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
        </div>
    );
}
