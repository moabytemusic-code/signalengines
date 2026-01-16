import Link from 'next/link';
import { Check } from 'lucide-react';

export default function Pricing() {
    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Plans for every scale</p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
                    Start with a free diagnosis. Upgrade to fix it. Join the club to prevent it.
                </p>

                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {/* Free */}
                    <div className="rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10">
                        <h3 className="text-lg font-semibold leading-8 text-gray-900">Free</h3>
                        <p className="mt-4 text-sm leading-6 text-gray-600">Diagnostic scans.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-gray-900">$0</span>
                        </p>
                        <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                            <li className="flex gap-x-3"><Check className="text-blue-600 h-5 w-5" /> 3 Scans / Day</li>
                            <li className="flex gap-x-3"><Check className="text-blue-600 h-5 w-5" /> Basic Findings</li>
                            <li className="flex gap-x-3"><Check className="text-blue-600 h-5 w-5" /> Limited Access</li>
                        </ul>
                        <Link href="/engines" className="mt-8 block rounded-md bg-blue-50 px-3 py-2 text-center text-sm font-semibold leading-6 text-blue-600 hover:bg-blue-100 ring-1 ring-inset ring-blue-200">
                            Browse Engines
                        </Link>
                    </div>

                    {/* Club */}
                    <div className="rounded-3xl p-8 ring-1 ring-blue-600 bg-gray-900 xl:p-10 relative">
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
                        <h3 className="text-lg font-semibold leading-8 text-white">Prevention Club</h3>
                        <p className="mt-4 text-sm leading-6 text-gray-300">All access pass.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-white">$29</span>
                            <span className="text-sm font-semibold leading-6 text-gray-300">/month</span>
                        </p>
                        <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                            <li className="flex gap-x-3"><Check className="text-blue-400 h-5 w-5" /> 50 Scans / Day</li>
                            <li className="flex gap-x-3"><Check className="text-blue-400 h-5 w-5" /> Access ALL Engines</li>
                            <li className="flex gap-x-3"><Check className="text-blue-400 h-5 w-5" /> Templates & Fixes</li>
                            <li className="flex gap-x-3"><Check className="text-blue-400 h-5 w-5" /> Priority Support</li>
                        </ul>
                        <a href="#" className="mt-8 block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                            Join Club
                        </a>
                    </div>

                    {/* Agency */}
                    <div className="rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10">
                        <h3 className="text-lg font-semibold leading-8 text-gray-900">Agency</h3>
                        <p className="mt-4 text-sm leading-6 text-gray-600">For your clients.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-gray-900">Contact</span>
                        </p>
                        <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                            <li className="flex gap-x-3"><Check className="text-blue-600 h-5 w-5" /> Unlimited Scans</li>
                            <li className="flex gap-x-3"><Check className="text-blue-600 h-5 w-5" /> White Label Reports</li>
                            <li className="flex gap-x-3"><Check className="text-blue-600 h-5 w-5" /> API Access</li>
                        </ul>
                        <a href="mailto:sales@signalengines.com" className="mt-8 block rounded-md bg-white px-3 py-2 text-center text-sm font-semibold leading-6 text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                            Contact Sales
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
