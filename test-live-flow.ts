import axios from "axios";
// Force environment for safety (though script hardcodes URL for simplicity)
const API_URL = "https://api.signalengines.com";

async function testLiveFlow() {
    const testEmail = "test.live.flow@signalengines.com";
    console.log(`🚀 Testing Live Workflow on ${API_URL}...`);
    console.log(`Simulating Engine Run for 'emailwarmup' with email: ${testEmail}`);

    try {
        // We simulate calling an engine run (e.g. emailwarmup)
        // With an email input, to trigger the Brevo sync logic added to executeEngineRun.
        // This endpoint requires authentication usually... wait.
        // engines/:id/run is likely protected (authMiddleware).
        // Let's check if there is a public way?
        // Or I need to login first?

        // Step 1: Request Magic Link (to get user created) -> I can't verifying without email access.
        // Wait, executeEngineRun at the API level (POST /engines/:id/run) requires AuthRequest.
        // If I call it without token, I get 401.

        // Is there a public endpoint that triggers engine logic?
        // Maybe the 'engine-app' frontend uses a different flow?
        // The Engine App calls the API. Does it use an "anonymousId"?
        // src/auth.ts (services/api) handles anonymousId from cookies or headers?

        // Let's try sending x-anonymous-id header.
        const anonId = "test-anon-" + Date.now();

        const response = await axios.post(`${API_URL}/engines/emailwarmup/run`, {
            inputs: {
                domain: "signalengines.com",
                email: testEmail
            }
        }, {
            headers: {
                // Mocking an anonymous user session if API supports it
                // 'x-anonymous-id': anonId // If your API respects this
                // Or maybe just standard cookies?
            },
            validateStatus: () => true // Don't throw on error immediately
        });

        if (response.status === 200) {
            console.log("✅ Engine Run Successful!");
            console.log("Run ID:", response.data.run_id);
            console.log("Free Output:", response.data.free_output);
            console.log("👉 Check Brevo for:", testEmail);
        } else if (response.status === 401) {
            console.log("⚠️ API requires authentication for engine runs.");
            console.log("Cannot test full flow without a valid session token.");
            // Alternative: Is there a public scan endpoint?
        } else {
            console.error(`❌ Failed: ${response.status} - ${JSON.stringify(response.data)}`);
        }

    } catch (e: any) {
        console.error("❌ Network Error:", e.message);
    }
}

testLiveFlow();
