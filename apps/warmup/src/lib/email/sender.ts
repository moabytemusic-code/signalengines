
import { createTransport } from 'nodemailer';
import { decrypt } from '@/utils/encryption';
import { supabase } from '@/lib/supabase';

// Send an email from a specific account
export async function sendEmail({
    accountId,
    to,
    subject,
    text,
    html
}: {
    accountId: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
}) {
    // 1. Fetch Credentials
    const { data: account, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

    if (error || !account) throw new Error('Account not found');

    const password = decrypt(account.encrypted_password, account.iv);

    // 2. Configure Transporter
    const isSecure = account.smtp_port === 465;
    const transporter = createTransport({
        host: account.smtp_host,
        port: account.smtp_port,
        secure: isSecure,
        auth: {
            user: account.email_address,
            pass: password,
        },
        tls: { rejectUnauthorized: false }
    });

    // 3. Send
    try {
        const info = await transporter.sendMail({
            from: account.email_address,
            to,
            subject,
            text,
            html
        });

        // 4. Log Success
        await supabase.from('email_logs').insert({
            account_id: accountId,
            type: 'SENT',
            status: 'SUCCESS',
            details: { to, subject, messageId: info.messageId }
        });

        return { success: true, messageId: info.messageId };

    } catch (sendError: any) {
        console.error('Send Error:', sendError);
        // Log Failure
        await supabase.from('email_logs').insert({
            account_id: accountId,
            type: 'SENT',
            status: 'FAILED',
            details: { to, error: sendError.message }
        });
        throw sendError;
    }
}
