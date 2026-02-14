
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'apps/hub/.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const SECRET = process.env.GUMROAD_WEBHOOK_SECRET;
const URL = 'https://hub.signalengines.com/api/webhooks/gumroad';

if (!SECRET) {
    console.error('❌ GUMROAD_WEBHOOK_SECRET is missing from environment!');
    // Attempt to run anyway if user passed it as arg?
    // process.exit(1);
} else {
    console.log('✅ Found GUMROAD_WEBHOOK_SECRET');
}


async function testGumroad() {
    const email = `test.gumroad.${Date.now()}@signalengines.com`;
    console.log(`🚀 Testing Gumroad Webhook for: ${email}`);

    // Simulate Gumroad Payload (application/x-www-form-urlencoded)
    const payload = new URLSearchParams();
    payload.append('resource_id', 'sale_' + Date.now());
    payload.append('seller_id', 'user_' + Date.now());
    payload.append('product_id', 'prod_test_123'); // Ensure this ID is handled if needed
    payload.append('product_permalink', 'signalengines-pro');
    payload.append('short_product_id', 'test');
    payload.append('email', email);
    payload.append('price', '4900');
    payload.append('currency', 'usd');
    payload.append('quantity', '1');
    payload.append('recurrence', 'monthly');
    payload.append('verification_token', 'deprecated');
    payload.append('tier', 'pro');
    payload.append('product_name', 'Signal Engines Pro');
    payload.append('sale_id', 'sale_' + Date.now());
    payload.append('sale_timestamp', new Date().toISOString());
    payload.append('order_number', '1001');
    payload.append('ip_country', 'US');
    payload.append('test', 'false'); // Critical: Treat as real sale
    payload.append('resource_name', 'sale');

    // Calculate Signature (HMAC SHA256 of RAW BODY STRING)
    const bodyString = payload.toString();

    let signature = '';
    if (SECRET) {
        signature = crypto.createHmac('sha256', SECRET).update(bodyString).digest('hex');
    } else {
        console.warn('⚠️  Signing with empty/dummy secret due to missing env var.');
        signature = 'dummy';
    }

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Gumroad-Signature': signature
            },
            body: bodyString
        });

        const data = await response.text();

        if (response.ok) {
            console.log(`✅ Success: ${response.status}`);
            console.log('Response:', data);
        } else {
            console.error(`❌ Error: ${response.status}`);
            console.error('Response:', data);
        }
    } catch (e) {
        console.error(`❌ Request Failed:`, e.message);
    }
}

testGumroad();
