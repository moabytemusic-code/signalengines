"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl text-slate-900">
                            SignalEngines
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/engines" className="border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Directory
                            </Link>
                            <Link href="/articles" className="border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Knowledge Base
                            </Link>
                            <Link href="/pricing" className="border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Pricing
                            </Link>
                            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="border-transparent text-slate-500 hover:text-orange-600 hover:border-orange-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Warmup Hero
                            </a>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        <Link href="/account" className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 flex items-center">
                            <User size={16} className="mr-2" />
                            {user ? 'Account' : 'Sign In'}
                        </Link>
                    </div>
                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/engines" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">Directory</Link>
                        <Link href="/articles" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">Knowledge Base</Link>
                        <Link href="/pricing" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">Pricing</Link>
                        <Link href="/account" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800">Account</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

export function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
                <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
                    <div className="px-5 py-2">
                        <Link href="https://www.smarthustlermarketing.com" className="text-base text-slate-500 hover:text-slate-900">
                            Smart Hustler Marketing
                        </Link>
                    </div>
                    <div className="px-5 py-2">
                        <Link href="/privacy" className="text-base text-slate-500 hover:text-slate-900">
                            Privacy Policy
                        </Link>
                    </div>
                    <div className="px-5 py-2">
                        <Link href="/terms" className="text-base text-slate-500 hover:text-slate-900">
                            Terms of Service
                        </Link>
                    </div>
                </nav>
                <div className="mt-8 text-center text-base text-slate-400">
                    &copy; 2026 Signal Engines. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
