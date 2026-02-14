import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: 'apps/hub/.env.local' });
dotenv.config({ path: '.env' });

const SECRET = process.env.GUMROAD_WEBHOOK_SECRET;
const URL = 'https://hub.signalengines.com/api/webhooks/gumroad';

if (!SECRET) {
    console.error('❌ GUMROAD_WEBHOOK_SECRET is missing from environment!');
    process.exit(1);
}

async function testGumroad() {
    const email = `test.gumroad.${Date.now()}@signalengines.com`;
    console.log(`🚀 Testing Gumroad Webhook for: ${email}`);

    // Simulate Gumroad Payload (application/x-www-form-urlencoded)
    const payload = new URLSearchParams({
        resource_id: 'sale_' + Date.now(),
        seller_id: 'user_' + Date.now(),
        product_id: 'prod_test_123',
        product_permalink: 'signalengines-pro',
        short_product_id: 'test',
        email: email,
        price: '4900', // $49.00
        currency: 'usd',
        quantity: '1',
        recurrence: 'monthly',
        verification_token: 'deprecated', // We use signature instead
        tier: 'pro', // Our custom parsing logic handles product names, but here we mock fields
        // Wait, our logic inspects logic?
        // Let's check `gumroad.ts` logic later. Assuming product name maps to tier.
        product_name: 'Signal Engines Pro',
        sale_id: 'sale_' + Date.now(),
        sale_timestamp: new Date().toISOString(),
        order_number: '1001',
        ip_country: 'US',
        test: 'false' // Ensure it's treated as real sale
    });

    // Calculate Signature (HMAC SHA256 of payload string?)
    // Gumroad signs the raw body? No, x-www-form-urlencoded body.
    // Wait, Gumroad sends webhook as POST body.
    // Signature is check against body?
    // usually signature is unrelated to body content parsing?
    // Gumroad documentation: "X-Gumroad-Signature: The signature of the request body"
    // Does it sign the JSON or the form string?
    // It sends form-data usually.
    // Let's assume standard form-urlencoded string.

    // However, our `gumroad.ts` provider `verifyWebhook` implementation?
    // It takes `payload` object. Is it verifying based on object or raw body?
    // If it verifies strictly against RAW BODY, we must ensure our mock sends exactly that.

    // Let's check `apps/hub/src/billing/gumroad.ts` first?
    // Step 490: `gumroadProvider.verifyWebhook(payload, req.headers)`.

    // So I need to verify how `gumroadProvider` works. 
    // IF I don't check, the test might fail due to signature mismatch.

    // Assuming standard HMAC SHA256 hex digest of the raw body.

    const bodyString = payload.toString();
    const signature = crypto.createHmac('sha256', SECRET!).update(bodyString).digest('hex');

    try {
        const response = await axios.post(URL, bodyString, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Gumroad uses X-Gumroad-Signature? Or verify via token?
                // Our code might use verify signature logic.
                // Let's check `verifyWebhook` uses what header.
                // Assuming standard `x-gumroad-signature`?
                // Or maybe the SECRET is just used as a shared secret in verify?
                // Actually `gumroadProvider` in Step 490 implies we call it.
                // If I don't know the header name, I might fail.
            }
        });

        console.log(`✅ Success: ${response.status}`);
        console.log(response.data);
    } catch (e: any) {
        // If 403, verify failed.
        // If 500, server error.
        console.error(`❌ Error: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
    }
}

// Check `billing/gumroad.ts` first?
// I'll skip running this until I confirm the header name.
// Just writing it for now.
