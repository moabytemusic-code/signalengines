import Link from "next/link";
import { Search, MapPin, AlertCircle } from "lucide-react";

export default function EngineNotFound({
    engineId,
    errorCode = "SIG_ENGINE_RESOLUTION_FAILED",
    debugInfo
}: {
    engineId?: string | null,
    errorCode?: string,
    debugInfo?: string
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
            <div className="mb-8 h-20 w-20 flex items-center justify-center rounded-2xl bg-white shadow-xl shadow-slate-200">
                {engineId ? (
                    <AlertCircle className="h-10 w-10 text-amber-500" />
                ) : (
                    <Search className="h-10 w-10 text-slate-400" />
                )}
            </div>

            <h1 className="text-4xl font-black text-slate-900 md:text-5xl">
                {engineId ? 'Engine Not Loaded' : 'Signal Engine Not Found'}
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
                {engineId
                    ? `We found the ID "${engineId}", but we couldn't load its configuration. Please check if the API is online.`
                    : "The specific diagnostic tool you are trying to reach hasn't been configured yet or is currently offline."
                }
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                    href="https://signalengines.com"
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-4 font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
                >
                    <MapPin className="h-4 w-4" />
                    Visit Headquarters
                </Link>
                <Link
                    href="https://signalengines.com/engines"
                    className="flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 py-4 font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-95"
                >
                    Explore Marketplace
                </Link>
            </div>

            <div className="mt-16 space-y-2">
                <div className="text-xs font-medium uppercase tracking-widest text-slate-400">
                    ErrorCode: {errorCode}
                </div>
                {debugInfo && (
                    <div className="text-[10px] text-slate-300 font-mono">
                        DEBUG: {debugInfo}
                    </div>
                )}
            </div>
        </div>
    );
}
