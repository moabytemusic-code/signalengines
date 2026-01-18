
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { decrypt } from '@/utils/encryption';
import { supabase } from '@/lib/supabase';
import { generateReplyContent } from '@/lib/openai';
import { sendEmail } from './sender';

// Check inbox, move spam to inbox, mark read, and reply
export async function processInbox(accountId: string) {
    // 1. Fetch Credentials
    const { data: account, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

    if (error || !account) throw new Error('Account not found');

    const password = decrypt(account.encrypted_password, account.iv);

    // 2. Connect IMAP
    const config = {
        imap: {
            user: account.email_address,
            password: password,
            host: account.imap_host,
            port: account.imap_port,
            tls: account.imap_port === 993,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 10000
        }
    };

    let connection;
    try {
        connection = await imaps.connect(config);

        // A. CHECK SPAM FOLDER (Rescue)
        // Note: Folder names vary (Spam, Junk, Junk Email). We try common ones.
        const boxes = await connection.getBoxes();
        let spamBoxName = null;

        // Simple heuristic for box detection
        const findBox = (root: any, names: string[]): string | null => {
            for (const key in root) {
                if (names.includes(key) || names.some(n => key.toLowerCase().includes(n))) return key;
                if (root[key].children) {
                    const child = findBox(root[key].children, names);
                    if (child) return child;
                }
            }
            return null;
        };

        // Heuristic: Looking for 'Junk', 'Spam'
        // If we can't find it easily, we might skip or need sophisticated folder traversal.
        // For MVP, lets try to open "Spam" or "Junk" explicitly if we can guess.
        // Or assume user uses Gmail/Outlook standards.

        // Let's try to list all boxes and find one that looks like spam.
        // For now, let's just create a list of candidates.
        const candidates = ['Spam', 'Junk', 'Junk Email', '[Gmail]/Spam'];

        for (const box of candidates) {
            try {
                await connection.openBox(box);
                spamBoxName = box;
                break;
            } catch (e) {
                // Box likely doesn't exist
            }
        }

        if (spamBoxName) {
            // Fetch unread messages in Spam
            const searchCriteria = ['UNSEEN'];
            const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: false };
            const messages = await connection.search(searchCriteria, fetchOptions);

            for (const message of messages) {
                // We only rescue emails that look like they are from our network (or all, if we are aggressive)
                // For MVP: Rescue ALL unread spam to be safe? No, that's dangerous.
                // We need a header 'X-Warmup-Hero' or similar, but spammers could fake it.
                // Better: We check if the sender is in our 'email_accounts' table.

                // Parse header
                const header = message.parts.find(p => p.which === 'HEADER');
                const fromHeader = header?.body?.from?.[0] || ''; // simplistic

                // We need to parse 'From: "Name" <email@ex.com>' to just email
                const fromEmailMatch = fromHeader.match(/<(.+)>/) || [null, fromHeader];
                const fromEmail = fromEmailMatch[1] || fromHeader;

                if (!fromEmail) continue;

                // Check if from a known warmup peer
                // Optimization: We could cache strict list of peers.
                const { data: peer } = await supabase.from('email_accounts').select('id').eq('email_address', fromEmail).single();

                if (peer) {
                    // IT IS ONE OF OURS! RESCUE IT.
                    console.log(`Rescuing email from ${fromEmail} in ${spamBoxName}`);

                    // Move to Inbox
                    await connection.moveMessage(message.attributes.uid, 'INBOX');

                    // Log Rescue
                    await supabase.from('email_logs').insert({
                        account_id: accountId,
                        type: 'RECEIVED',
                        status: 'RESCUED',
                        details: { from: fromEmail, folder: spamBoxName }
                    });
                }
            }
        }

        // B. CHECK INBOX (Reply)
        await connection.openBox('INBOX');
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true }; // Mark seen immediately
        // IMPORTANT: Limit processing to avoid timeout
        const messages = await connection.search(searchCriteria, fetchOptions);

        // Process max 3 messages per run to keep it light
        const toProcess = messages.slice(0, 3);

        for (const message of messages) {
            const header = message.parts.find(p => p.which === 'HEADER');
            const fromHeader = header?.body?.from?.[0] || '';
            const subject = header?.body?.subject?.[0] || 'No Subject';

            const fromEmailMatch = fromHeader.match(/<(.+)>/) || [null, fromHeader];
            const fromEmail = fromEmailMatch[1]?.replace(/'/g, "").trim() || fromHeader; // clean up

            // Check if from peer
            const { data: peer } = await supabase.from('email_accounts').select('id').eq('email_address', fromEmail).single();

            if (peer) {
                console.log(`Replying to peer: ${fromEmail}`);

                // Get Body for context
                const part = message.parts.find((p) => p.which === 'TEXT');
                const body = part?.body || '';

                // Generate Reply
                const replyBody = await generateReplyContent(body);

                // Send Reply
                await sendEmail({
                    accountId,
                    to: fromEmail,
                    subject: `Re: ${subject}`,
                    text: replyBody
                });

                // Mark as Important (Star) - IMAP flag
                await connection.addFlags(message.attributes.uid, ['\\Flagged']);

                // Log Interaction
                await supabase.from('email_logs').insert({
                    account_id: accountId,
                    type: 'RECEIVED',
                    status: 'REPLIED',
                    details: { from: fromEmail, subject }
                });
            }
        }

    } catch (e) {
        console.error('IMAP Error:', e);
        throw e;
    } finally {
        if (connection) connection.end();
    }
}
