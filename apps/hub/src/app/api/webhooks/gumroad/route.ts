
import { NextRequest, NextResponse } from 'next/server';
import { gumroadProvider } from '../../../../billing/gumroad';
import { prisma } from '../../../../lib/db';

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

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: entitlement.userEmail }
        });

        if (user) {
            await prisma.user.update({
                where: { email: entitlement.userEmail },
                data: {
                    tier: entitlement.tier,
                    billingProvider: 'gumroad',
                    billingSubscriptionId: entitlement.externalSubId
                }
            });
            console.log(`Updated user ${user.id} tier to ${entitlement.tier}`);
        } else {
            console.warn(`Webhook received for unknown email: ${entitlement.userEmail}`);
            // Logic to create stub user if needed, but usually account exists.
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Webhook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
