import Link from "next/link";
import { ArrowRight, Zap, Target, Lock } from "lucide-react";

async function getEngines() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4005'}/public/engines`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const engines = await getEngines();
  const topEngines = engines.slice(0, 3);

  return (
    <main className="bg-white">
      {/* Hero */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Urgent problem? <br />
            <span className="text-blue-600">Run a free scan.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            SignalEngines is a network of specialist diagnostic tools. Find the exact engine for your traffic or account issue and get an instant fix plan.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/engines" className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              Browse Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Engines */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Popular Engines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topEngines.map((engine: any) => (
            <div key={engine.engine_id} className="border rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{engine.engine_name}</h3>
              <p className="text-gray-600 mb-6 text-sm line-clamp-2">{engine.seo.description}</p>
              <a
                href={engine.url || engine.launchUrl || `https://${engine.subdomain}.signalengines.com`}
                target="_blank"
                className="inline-flex items-center text-blue-600 font-bold hover:underline"
              >
                Open Engine <ArrowRight size={16} className="ml-1" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
