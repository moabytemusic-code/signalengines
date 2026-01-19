
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function GlobalHeader() {
    return (
        <div className="bg-zinc-950 text-zinc-400 border-b border-zinc-900 text-xs py-2 px-6 flex items-center justify-between z-[60] fixed top-0 w-full">
            <div className="flex items-center gap-4">
                <Link
                    href="https://signalengines.com"
                    className="flex items-center hover:text-white transition-colors gap-2"
                >
                    <ArrowLeft className="w-3 h-3" />
                    <span className="font-medium">Signal Engines</span>
                </Link>
                <div className="h-3 w-px bg-zinc-800" />
                <Link href="/" className="opacity-60 hover:opacity-100 hover:text-white transition-all">Warmup Hero</Link>
            </div>

            <div className="hidden sm:flex items-center gap-4">
                <a href="https://signalengines.com/engines" className="hover:text-white transition-colors">Directory</a>
                <a href="https://signalengines.com/account" className="hover:text-white transition-colors">My Suite Account</a>
            </div>
        </div>
    );
}
