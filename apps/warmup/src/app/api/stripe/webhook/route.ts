
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error(`Webhook signature verification failed: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Retrieve custom metadata
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan; // 'starter' or 'agency'

        console.log(`💰 Payment success for User: ${userId}, Plan: ${plan}`);

        if (userId && plan) {
            // Update User Subscription
            const { error: userError } = await supabase
                .from('users')
                .update({ subscription_status: plan })
                .eq('id', userId);

            if (userError) {
                console.error('Error updating user subscription:', userError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }

            // Update Account Daily Limits based on new plan
            const dailyLimits: Record<string, number> = {
                'starter': 50,
                'agency': 200
            };
            const newLimit = dailyLimits[plan] || 5;

            const { error: accError } = await supabase
                .from('email_accounts')
                .update({ daily_limit: newLimit })
                .eq('user_id', userId);

            if (accError) {
                console.error('Error updating account limits:', accError);
            }
        }
    }

    // Handle Subscription Cancellation / Deletion
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        // Lookup user by customer ID is best, but we don't store it yet.
        // We MUST fetch the customer to get the email to find the user.
        const customerId = subscription.customer as string;
        try {
            const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
            if (customer.email) {
                console.log(`📉 Subscription deleted for ${customer.email}. Downgrading...`);

                const { error } = await supabase
                    .from('users')
                    .update({ subscription_status: 'free' })
                    .eq('email', customer.email);

                if (error) console.error('Error downgrading user:', error);

                // Fetch User ID to update related email accounts
                const { data: user } = await supabase.from('users').select('id').eq('email', customer.email).single();

                if (user) {
                    // Reset limits to Free tier
                    await supabase
                        .from('email_accounts')
                        .update({ daily_limit: 5 })
                        .eq('user_id', user.id);
                }
            }
        } catch (e) {
            console.error('Error handling subscription deletion:', e);
        }
    }

    // Handle Subscription Update (Upgrades/Downgrades via Portal)
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;

        // Map Price ID back to Plan Name
        let newPlan = 'free';
        if (priceId === process.env.STRIPE_PRICE_ID_STARTER) newPlan = 'starter';
        if (priceId === process.env.STRIPE_PRICE_ID_AGENCY) newPlan = 'agency';

        // Only update if we matched a valid paid plan (otherwise it might be some other state)
        if (newPlan !== 'free') {
            const customerId = subscription.customer as string;
            try {
                const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
                if (customer.email) {
                    console.log(`🔄 Subscription updated for ${customer.email} to ${newPlan}`);

                    // Update User
                    await supabase
                        .from('users')
                        .update({ subscription_status: newPlan })
                        .eq('email', customer.email);

                    // Map limits
                    const dailyLimits: Record<string, number> = { 'starter': 50, 'agency': 200 };
                    const newLimit = dailyLimits[newPlan] || 5;

                    // We need the User ID to update accounts
                    const { data: user } = await supabase.from('users').select('id').eq('email', customer.email).single();
                    if (user) {
                        await supabase
                            .from('email_accounts')
                            .update({ daily_limit: newLimit })
                            .eq('user_id', user.id);
                    }
                }
            } catch (e) {
                console.error('Error handling subscription update:', e);
            }
        }
    }

    return NextResponse.json({ received: true });
}
