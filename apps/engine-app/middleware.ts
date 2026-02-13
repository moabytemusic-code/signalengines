import { NextRequest, NextResponse } from "next/server";
import { getEngineIdFromHost } from "@/lib/engineHost";

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || "";

    // Check for engine query parameter first (e.g., ?engine=accountrecovery)
    const engineQueryParam = url.searchParams.get("engine");

    // Get Engine ID from query param or hostname
    const engineId = engineQueryParam || getEngineIdFromHost(hostname);

    if (!engineId && url.pathname !== '/engine-not-found') {
        url.pathname = `/engine-not-found`;
        return NextResponse.rewrite(url);
    }

    // Rewrite to /_engine/[id]/[path]
    // This allows us to have dynamic engine context in the page
    // url.pathname = `/_engine/${engineId}${url.pathname}`;

    // Actually, simplified approach:
    // Just set a header 'x-engine-id' so Server Components can read it easily
    // Rewriting the URL structure is good for caching but 'x-engine-id' is easier for step B3/B4
    // Let's stick to Header injection for now, as re-writing path requires folder structure changes

    const response = NextResponse.next();
    if (engineId) {
        response.headers.set("x-engine-id", engineId);
    }
    return response;
}
