
import { NextRequest, NextResponse } from 'next/server';
import { gumroadProvider } from '../../../../billing/gumroad';
import { prisma } from '../../../../lib/db';
import { sendWelcomeEmail, sendUpgradeEmail, addOrUpdateContact, updateContactTier } from '../../../../lib/brevo';



export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let payload: any = {};

        if (contentType.includes('application/json')) {
            payload = await req.json();
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await req.formData();
            payload = Object.fromEntries(formData.entries());
        } else {
            return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
        }

        const event = await gumroadProvider.verifyWebhook(payload, req.headers);

        if (!event.isVerified) {
            return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
        }

        if (event.eventType === 'test') {
            return NextResponse.json({ test: true });
        }

        const entitlement = await gumroadProvider.getUserEntitlement(event);

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { email: entitlement.userEmail }
        });

        if (user) {
            // Check if this is an upgrade
            const isUpgrade = user.tier === 'free' && (entitlement.tier === 'pro' || entitlement.tier === 'agency');

            // Update existing user
            await prisma.user.update({
                where: { email: entitlement.userEmail },
                data: {
                    tier: entitlement.tier,
                    billingProvider: 'gumroad',
                    billingSubscriptionId: entitlement.externalSubId
                }
            });

            // Send upgrade email if tier changed
            if (isUpgrade) {
                await sendUpgradeEmail(entitlement.userEmail, entitlement.tier);
                // Update contact tier in Brevo
                await updateContactTier(entitlement.userEmail, entitlement.tier).catch(err => {
                    console.error('Failed to update Brevo contact:', err);
                });
            }

            console.log(`Updated user ${user.id} tier to ${entitlement.tier}`);
        } else {
            // Create new user with auto-login token
            const autoLoginToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
            const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            user = await prisma.user.create({
                data: {
                    email: entitlement.userEmail,
                    tier: entitlement.tier,
                    billingProvider: 'gumroad',
                    billingSubscriptionId: entitlement.externalSubId,
                    magicLinkToken: autoLoginToken,
                    tokenExpiresAt
                }
            });

            // Generate auto-login URL
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.signalengines.com';
            const autoLoginUrl = `${baseUrl}/api/auth/auto-login?token=${autoLoginToken}&redirect=/tools/sequence-generator`;

            // Send welcome email
            await sendWelcomeEmail(entitlement.userEmail, autoLoginUrl);

            // Add to Brevo contact list
            await addOrUpdateContact(entitlement.userEmail, entitlement.tier).catch(err => {
                console.error('Failed to add Brevo contact:', err);
            });

            console.log(`Created new user ${user.id} with tier ${entitlement.tier}`);
            console.log(`Auto-login URL: ${autoLoginUrl}`);
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
