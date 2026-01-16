import { NextResponse } from 'next/server';

const SUBDOMAIN_MAP: Record<string, string> = {
    "emailwarmup": "warmup",
    "tiktok-idea-batch": "ideas",
    "tiktok-script-generator": "scripts"
};

export async function GET(request: Request, { params }: { params: Promise<{ engineId: string }> }) {
    const { engineId } = await params;

    if (!engineId) {
        return NextResponse.redirect(new URL('/engines', request.url));
    }

    const subdomain = SUBDOMAIN_MAP[engineId] || engineId;

    // Redirect to the Tool Subdomain
    return NextResponse.redirect(`https://${subdomain}.signalengines.com`);
}
