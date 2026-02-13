import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ engineId: string }> }) {
    const { engineId } = await params;

    if (!engineId) {
        return NextResponse.redirect(new URL('/engines', request.url));
    }

    // Redirect to ideas.signalengines.com with engine query parameter
    return NextResponse.redirect(`https://ideas.signalengines.com?engine=${engineId}`);
}
