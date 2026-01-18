
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { processInbox } from '@/lib/email/processor';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    console.log('📥 Inbox Processor Cron Started');

    try {
        // 1. Fetch All Accounts
        const { data: accounts, error } = await supabase
            .from('email_accounts')
            .select('id, email_address');

        if (error || !accounts) return NextResponse.json({ error: 'DB Error' }, { status: 500 });

        const results = [];

        // 2. Process each inbox
        // In a real high-scale app, we'd use a queue (Redis/Bull).
        // For MVP, we loop. If it times out, Vercel kills it, but some work might get done.
        // We can use Promise.all to do them in parallel to save time.

        const promises = accounts.map(async (account) => {
            try {
                await processInbox(account.id);
                return { account: account.email_address, status: 'PROCESSED' };
            } catch (e: any) {
                console.error(`Failed to process inbox for ${account.email_address}:`, e);
                return { account: account.email_address, status: 'ERROR', error: e.message };
            }
        });

        const outcome = await Promise.all(promises);

        return NextResponse.json({ success: true, results: outcome });

    } catch (e: any) {
        console.error('Cron Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
