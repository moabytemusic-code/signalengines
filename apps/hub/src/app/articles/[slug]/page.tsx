import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

async function getArticle(slug: string) {
    try {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.signalengines.com'}/public/articles/${slug}`;
        const res = await fetch(url, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

function SimpleMarkdown({ text }: { text: string }) {
    if (!text) return null;
    
    // Naive splitter handles paragraphs but not inline styles well
    // Good enough for v1 "How to" guides
    const lines = text.split('\n');

    return (
        <div className="space-y-2 text-lg leading-relaxed text-gray-700">
            {lines.map((line, i) => {
                const clean = line.trim();
                if (!clean) return <div key={i} className="h-4"></div>;

                if (line.startsWith('# ')) 
                    return <h1 key={i} className="text-3xl md:text-4xl font-black mt-8 mb-6 text-gray-900">{line.replace('# ', '')}</h1>;
                
                if (line.startsWith('## ')) 
                    return <h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-gray-900 border-b border-gray-100 pb-2">{line.replace('## ', '')}</h2>;
                
                if (line.startsWith('### ')) 
                    return <h3 key={i} className="text-xl font-bold mt-8 mb-3 text-gray-900">{line.replace('### ', '')}</h3>;
                
                if (line.startsWith('- ')) {
                    return (
                        <div key={i} className="flex ml-4 mb-2">
                            <span className="text-blue-500 font-bold mr-3">•</span>
                            <span>{line.replace('- ', '')}</span>
                        </div>
                    );
                }

                // Basic link regex handling [text](url) -> just text for now to avoid hydration mismatch complexity
                // or just leave it raw ifcomplex
                if (line.includes('[') && line.includes('](')) {
                     // Very basic strip of md links for clean reading
                     const stripped = line.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1');
                     return <p key={i}>{stripped}</p>;
                }
                
                return <p key={i}>{line}</p>;
            })}
        </div>
    );
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) return notFound();

    return (
        <main className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                 <Link href="/articles" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Knowledge Base
                </Link>

                <div className="mb-10 text-center">
                    <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        {article.engineId} Guide
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                        {article.title}
                    </h1>
                     <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 font-medium">
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {new Date(article.updatedAt).toLocaleDateString()}</span>
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> 5 min read</span>
                    </div>
                </div>

                <div className="prose prose-lg prose-blue max-w-none">
                    {/* Inject Schema */}
                    {article.schemaJson && (
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: article.schemaJson }}
                        />
                    )}
                    
                    {/* Render Content */}
                    <SimpleMarkdown text={article.markdown} />
                </div>

                {/* Footer CTA */}
                <div className="mt-16 bg-slate-900 rounded-2xl p-8 text-center text-white shadow-xl">
                    <h3 className="text-2xl font-bold mb-4">Fix this issue now</h3>
                    <p className="text-slate-300 mb-8 max-w-lg mx-auto">Use our automated engine to diagnose and resolve <strong>{article.title}</strong> in minutes.</p>
                    <Link
                        href={`/go/${article.engineId}`}
                        className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:scale-105"
                    >
                        Launch Recovery Tool
                    </Link>
                </div>
            </div>
        </main>
    );
}
