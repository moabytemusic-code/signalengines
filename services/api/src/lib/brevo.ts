import * as brevo from '@getbrevo/brevo';

// Contact List Management
export async function addOrUpdateContact(email: string, tier: string = 'free') {
    if (!process.env.BREVO_API_KEY) {
        console.warn('[BREVO] API key not configured, skipping contact sync');
        return;
    }

    const contactsApi = new brevo.ContactsApi();
    contactsApi.setApiKey(brevo.ContactsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
            const createContact = new brevo.CreateContact();
            createContact.email = email;
            createContact.attributes = {
                TIER: tier.toUpperCase(),
                SIGNUP_DATE: new Date().toISOString(),
                SOURCE: 'api_auth_verify'
            };
            createContact.listIds = [63]; // SignalEngines Users list
            createContact.updateEnabled = true; // Update if contact already exists

            await contactsApi.createContact(createContact);
            console.log(`[BREVO] Contact added/updated: ${email} (${tier})`);
            return; // Success
        } catch (error: any) {
            // Ignore duplicate contact errors immediately
            if (error.response?.body?.code === 'duplicate_parameter') return;

            attempt++;
            console.error(`[BREVO] Attempt ${attempt} failed:`, error.message);

            if (attempt >= MAX_RETRIES) {
                console.error('[BREVO] All attempts failed. Last error:', error);
            } else {
                // Wait 1s before retry
                await new Promise(res => setTimeout(res, 1000));
            }
        }
    }
}
