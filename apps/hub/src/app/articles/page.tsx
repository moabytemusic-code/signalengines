"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, FileText, Loader2, Search } from 'lucide-react';

export default function ArticlesIndex() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.signalengines.com'}/public/articles`;
        fetch(url)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setArticles(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-12 px-4 shadow-sm">
                <div className="max-w-5xl mx-auto">
                    <Link href="/engines" className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center mb-6">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Engines
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Knowledge Base</h1>
                    <p className="text-xl text-gray-500 max-w-2xl">
                        Expert guides, troubleshooting steps, and recovery templates for platform issues.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600 w-8 h-8"/></div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        No articles published yet. Check back soon.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {articles.map((a, i) => (
                            <Link key={i} href={`/articles/${a.slug}`} className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition group">
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                                    {a.engineId}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 leading-snug">
                                    {a.title}
                                </h2>
                                <p className="text-gray-500 line-clamp-2 mb-4 text-sm leading-relaxed">
                                    {a.description}
                                </p>
                                <div className="flex items-center text-sm font-bold text-gray-900">
                                    Read Guide <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
