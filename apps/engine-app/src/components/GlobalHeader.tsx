
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function GlobalHeader() {
    return (
        <div className="bg-zinc-950 text-zinc-400 border-b border-zinc-900 text-xs py-2 px-6 flex items-center justify-between z-[60] fixed top-0 w-full">
            <div className="flex items-center gap-4">
                <Link
                    href="https://hub.signalengines.com"
                    className="flex items-center hover:text-white transition-colors gap-2"
                >
                    <ArrowLeft className="w-3 h-3" />
                    <span className="font-medium">Signal Engines</span>
                </Link>
                <div className="h-3 w-px bg-zinc-800" />
                {/* We can dynamically set this or just keep it generic since this app runs multiple engines */}
                <span className="opacity-60">Engine Runner</span>
            </div>

            <div className="hidden sm:flex items-center gap-4">
                <a href="https://hub.signalengines.com/engines" className="hover:text-white transition-colors">Directory</a>
                <a href="https://hub.signalengines.com/account" className="hover:text-white transition-colors">My Suite Account</a>
            </div>
        </div>
    );
}
