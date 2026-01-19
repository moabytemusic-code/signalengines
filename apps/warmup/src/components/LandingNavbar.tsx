
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LandingNavbar() {
    return (
        <header className="fixed top-8 w-full z-50 border-b border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-xl transition-all">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-red-600" />
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">W</div>
                    </div>
                    <Link href="/" className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity">
                        WarmUpHero
                    </Link>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <Link href="/#features" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Features</Link>
                    <Link href="/#pricing" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Pricing</Link>
                    <Link href="/#how-it-works" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">How it works</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 shadow-lg shadow-orange-600/20">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
