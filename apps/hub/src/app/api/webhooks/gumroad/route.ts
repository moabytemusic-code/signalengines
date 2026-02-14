
import { NextRequest, NextResponse } from 'next/server';
import { gumroadProvider } from '../../../../billing/gumroad';
import { prisma } from '../../../../lib/db';
import { sendWelcomeEmail, sendUpgradeEmail, addOrUpdateContact, updateContactTier } from '../../../../lib/brevo';



export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';
        const rawBody = await req.text();
        let payload: any = {};

        if (contentType.includes('application/json')) {
            payload = JSON.parse(rawBody);
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const params = new URLSearchParams(rawBody);
            payload = Object.fromEntries(params.entries());
        } else {
            // Fallback or error on unsupported types for webhook
            // Gumroad strictly sends x-www-form-urlencoded
            return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
        }

        const event = await gumroadProvider.verifyWebhook(payload, req.headers, rawBody);

        if (!event.isVerified) {
            return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
        }

        if (event.eventType === 'test') {
            return NextResponse.json({ test: true });
        }

        const entitlement = await gumroadProvider.getUserEntitlement(event);

        // 1. Ensure User Exists
        let user = await prisma.user.findUnique({
            where: { email: entitlement.userEmail }
        });

        let isNewUser = false;
        let autoLoginUrl = '';

        if (!user) {
            isNewUser = true;
            // Create new user
            const autoLoginToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
            const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            user = await prisma.user.create({
                data: {
                    email: entitlement.userEmail,
                    tier: 'free', // Default, entitlements determine access
                    billingProvider: 'gumroad',
                    magicLinkToken: autoLoginToken,
                    tokenExpiresAt
                }
            });

            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.signalengines.com';
            autoLoginUrl = `${baseUrl}/api/auth/auto-login?token=${autoLoginToken}&redirect=/tools/sequence-generator`;
        }

        // 2. Grant Entitlement
        if (entitlement.engineId) {
            const hasAccess = entitlement.tier === 'pro' || entitlement.tier === 'agency';

            console.log(`Granting access to engine ${entitlement.engineId} for user ${user.id} (${hasAccess})`);

            await prisma.engineEntitlement.upsert({
                where: {
                    userId_engineId: {
                        userId: user.id,
                        engineId: entitlement.engineId
                    }
                },
                update: { hasAccess },
                create: {
                    userId: user.id,
                    engineId: entitlement.engineId,
                    hasAccess
                }
            });

            // Update Global Tier if gaining access
            if (hasAccess && user.tier === 'free') {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { tier: 'pro' }
                });

                // Brevo Sync
                await updateContactTier(user.email, 'pro').catch(console.error);
                if (!isNewUser) {
                    await sendUpgradeEmail(user.email, 'Pro Tool Access');
                }
            }
        } else {
            // Fallback: Global Tier Update (Unmapped Product)
            if (entitlement.tier === 'pro' || entitlement.tier === 'agency') {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { tier: entitlement.tier }
                });
            }
        }

        // 3. New User Onboarding
        if (isNewUser) {
            await sendWelcomeEmail(entitlement.userEmail, autoLoginUrl);
            await addOrUpdateContact(entitlement.userEmail, 'free').catch(console.error);
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
