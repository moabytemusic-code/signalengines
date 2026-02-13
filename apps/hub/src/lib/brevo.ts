import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

const contactsApi = new brevo.ContactsApi();
contactsApi.setApiKey(brevo.ContactsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

const SENDER_EMAIL = 'support@signalengines.com';
const SENDER_NAME = 'SignalEngines Support';

// Contact List Management
export async function addOrUpdateContact(email: string, tier: string = 'free') {
    if (!process.env.BREVO_API_KEY) {
        console.warn('[BREVO] API key not configured, skipping contact sync');
        return;
    }

    try {
        const createContact = new brevo.CreateContact();
        createContact.email = email;
        createContact.attributes = {
            TIER: tier.toUpperCase(),
            SIGNUP_DATE: new Date().toISOString()
        };
        createContact.listIds = [2]; // Main SignalEngines list (you'll need to create this in Brevo)
        createContact.updateEnabled = true; // Update if contact already exists

        await contactsApi.createContact(createContact);
        console.log(`[BREVO] Contact added/updated: ${email} (${tier})`);
    } catch (error: any) {
        // Ignore duplicate contact errors
        if (error.response?.body?.code !== 'duplicate_parameter') {
            console.error('[BREVO] Error adding contact:', error);
        }
    }
}

export async function updateContactTier(email: string, tier: string) {
    if (!process.env.BREVO_API_KEY) {
        console.warn('[BREVO] API key not configured, skipping contact update');
        return;
    }

    try {
        const updateContact = new brevo.UpdateContact();
        updateContact.attributes = {
            TIER: tier.toUpperCase(),
            LAST_UPGRADE: new Date().toISOString()
        };

        await contactsApi.updateContact(email, updateContact);
        console.log(`[BREVO] Contact tier updated: ${email} -> ${tier}`);
    } catch (error) {
        console.error('[BREVO] Error updating contact:', error);
    }
}


interface SendEmailParams {
    to: string;
    subject: string;
    htmlContent: string;
}

async function sendEmail({ to, subject, htmlContent }: SendEmailParams) {
    if (!process.env.BREVO_API_KEY) {
        console.warn('[BREVO] API key not configured, skipping email send');
        console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
        return;
    }

    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.sender = { email: SENDER_EMAIL, name: SENDER_NAME };
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;

        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`[BREVO] Email sent to ${to}: ${result.response.statusCode}`);
        return result;
    } catch (error) {
        console.error('[BREVO] Error sending email:', error);
        throw error;
    }
}

export async function sendWelcomeEmail(email: string, autoLoginUrl: string) {
    const subject = 'Welcome to SignalEngines!';
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">Welcome to SignalEngines! 🚀</h1>
        </div>
        <div class="content">
            <p>Hi there,</p>
            <p>Thanks for joining SignalEngines! We're excited to help you generate high-converting content sequences.</p>
            <p>Click the button below to access your account and start generating:</p>
            <p style="text-align: center;">
                <a href="${autoLoginUrl}" class="button">Access Your Account</a>
            </p>
            <p><strong>What you can do now:</strong></p>
            <ul>
                <li>Generate unlimited email sequences</li>
                <li>Create viral social media content</li>
                <li>Export to CSV, JSON, or TXT</li>
            </ul>
            <p>If you have any questions, just reply to this email. We typically respond within 24–48 hours.</p>
            <p>Best,<br>The SignalEngines Team</p>
        </div>
        <div class="footer">
            <p>SignalEngines | support@signalengines.com</p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({ to: email, subject, htmlContent });
}

export async function sendUpgradeEmail(email: string, tier: string) {
    const tierName = tier === 'pro' ? 'Pro' : 'Agency';
    const subject = `Welcome to SignalEngines ${tierName}!`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🎉 You're now ${tierName}!</h1>
        </div>
        <div class="content">
            <p>Hi there,</p>
            <p>Your upgrade to <span class="badge">${tierName}</span> is confirmed!</p>
            <p><strong>You now have access to:</strong></p>
            <ul>
                <li>✨ Unlimited sequence generations</li>
                <li>📧 Full 7-email cold outreach sequences</li>
                <li>💡 Personalization tips for each email</li>
                <li>📊 Advanced export options</li>
                <li>⚡ Priority support</li>
            </ul>
            <p>Start generating at: <a href="https://www.signalengines.com/tools">www.signalengines.com/tools</a></p>
            <p>Thanks for upgrading!</p>
            <p>Best,<br>The SignalEngines Team</p>
        </div>
        <div class="footer">
            <p>SignalEngines | support@signalengines.com</p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({ to: email, subject, htmlContent });
}

export async function sendLimitReachedEmail(email: string, toolName: string) {
    const subject = 'Daily Limit Reached';
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">Daily Limit Reached</h1>
        </div>
        <div class="content">
            <p>Hi there,</p>
            <p>You've reached your daily limit of 3 generations for the ${toolName}.</p>
            <p>Your limit will reset in 24 hours, or you can upgrade to Pro for unlimited access.</p>
            <p><strong>Pro benefits:</strong></p>
            <ul>
                <li>✨ Unlimited generations</li>
                <li>📧 Full 7-email sequences (vs 3 on free)</li>
                <li>💡 Personalization tips</li>
                <li>⚡ Priority support</li>
            </ul>
            <p style="text-align: center;">
                <a href="https://www.signalengines.com/pricing" class="button">Upgrade to Pro</a>
            </p>
            <p>Questions? Just reply to this email.</p>
            <p>Best,<br>The SignalEngines Team</p>
        </div>
        <div class="footer">
            <p>SignalEngines | support@signalengines.com</p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({ to: email, subject, htmlContent });
}

export async function sendCancellationEmail(email: string) {
    const subject = 'Subscription Cancelled';
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">Subscription Cancelled</h1>
        </div>
        <div class="content">
            <p>Hi there,</p>
            <p>We've confirmed the cancellation of your SignalEngines subscription.</p>
            <p>You'll continue to have access to Pro features until the end of your current billing period.</p>
            <p>We're sorry to see you go! If you have a moment, we'd love to hear your feedback on what we could improve.</p>
            <p>Just reply to this email and let us know.</p>
            <p>If you change your mind, you can always resubscribe at: <a href="https://www.signalengines.com/pricing">www.signalengines.com/pricing</a></p>
            <p>Best,<br>The SignalEngines Team</p>
        </div>
        <div class="footer">
            <p>SignalEngines | support@signalengines.com</p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({ to: email, subject, htmlContent });
}
