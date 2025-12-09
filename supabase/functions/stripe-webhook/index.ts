
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
    const signature = req.headers.get('stripe-signature');

    if (!signature || !endpointSecret) {
        return new Response('Webhook signature or secret missing.', { status: 400 });
    }

    let event;
    try {
        const body = await req.text();
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const coupleId = session.metadata?.couple_id;
        const planType = session.metadata?.plan_type; // 'pro' or 'annual'

        if (coupleId && planType) {
            // Update user plan in Supabase
            const { error } = await supabaseClient
                .from('couples')
                .update({
                    plan: planType,
                    plan_updated_at: new Date().toISOString()
                })
                .eq('id', coupleId);

            if (error) {
                console.error('Error updating couple plan:', error);
                return new Response('Error updating couple plan', { status: 500 });
            }
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
});
