
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmailContent } from '@/lib/openai';
import { sendEmail } from '@/lib/email/sender';

export const maxDuration = 60; // Allow 60s for Vercel Function (Pro can do more)
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    console.log('🚀 Sending Cron Started');

    try {
        // 1. Fetch Active Accounts
        const { data: accounts, error } = await supabase
            .from('email_accounts')
            .select('id, email_address, daily_limit');

        if (error || !accounts) return NextResponse.json({ error: 'DB Error' }, { status: 500 });

        const results = [];

        for (const account of accounts) {
            // Check Daily Limit (Simulated check - real one needs today's Sent count)
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const { count } = await supabase
                .from('email_logs')
                .select('*', { count: 'exact', head: true })
                .eq('account_id', account.id)
                .eq('type', 'SENT')
                .gte('timestamp', startOfDay.toISOString());

            if ((count || 0) >= (account.daily_limit || 5)) {
                results.push({ account: account.email_address, status: 'LIMIT_REACHED' });
                continue;
            }

            // Decide Action: Send
            // Simple MVP: 20% chance to send every time cron runs (assuming cron runs every 10-15 mins)
            if (Math.random() > 0.2) {
                results.push({ account: account.email_address, status: 'SKIPPED_RNG' });
                continue;
            }

            // FIND A PEER TO SEND TO
            const peers = accounts.filter(a => a.id !== account.id);
            if (peers.length === 0) {
                results.push({ account: account.email_address, status: 'NO_PEERS' });
                continue;
            }
            const target = peers[Math.floor(Math.random() * peers.length)];

            // GENERATE CONTENT
            const content = await generateEmailContent();

            // SEND
            try {
                await sendEmail({
                    accountId: account.id,
                    to: target.email_address,
                    subject: content.subject,
                    text: content.body
                });
                results.push({ account: account.email_address, action: 'SENT', to: target.email_address });
            } catch (e: any) {
                console.error(`Failed to send for ${account.email_address}:`, e);
                results.push({ account: account.email_address, status: 'ERROR', error: e.message });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (e: any) {
        console.error('Cron Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
