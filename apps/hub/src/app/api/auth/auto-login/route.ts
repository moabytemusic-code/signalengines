import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiClient } from '@/lib/api';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');
        const redirect = searchParams.get('redirect') || '/tools/sequence-generator';

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 400 });
        }

        // Find user with valid auto-login token
        const user = await prisma.user.findFirst({
            where: {
                magicLinkToken: token,
                tokenExpiresAt: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.redirect(new URL('/account?error=invalid-token', req.url));
        }

        // Create session via API
        const sessionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/create-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
        });

        if (!sessionResponse.ok) {
            throw new Error('Failed to create session');
        }

        const { sessionToken } = await sessionResponse.json();

        // Clear the token (one-time use)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                magicLinkToken: null,
                tokenExpiresAt: null
            }
        });

        // Set session cookie and redirect
        const response = NextResponse.redirect(new URL(redirect, req.url));
        response.cookies.set('signal_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });

        return response;

    } catch (error: any) {
        console.error('Auto-login error:', error);
        return NextResponse.redirect(new URL('/account?error=login-failed', req.url));
    }
}
