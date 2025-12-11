
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
    console.log('=== STRIPE WEBHOOK CALLED ===');

    const signature = req.headers.get('stripe-signature');
    const hasEndpointSecret = !!endpointSecret;
    const hasSignature = !!signature;

    console.log('Has signature:', hasSignature);
    console.log('Has endpointSecret:', hasEndpointSecret);
    console.log('EndpointSecret length:', endpointSecret?.length || 0);

    if (!signature || !endpointSecret) {
        console.error('Missing signature or secret!', { hasSignature, hasEndpointSecret });
        return new Response('Webhook signature or secret missing.', { status: 400 });
    }

    let event;
    try {
        const body = await req.text();
        console.log('Body length:', body.length);
        // Use async version for Deno runtime
        event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
        console.log('Signature verification SUCCESS');
    } catch (err: any) {
        console.error('Signature verification FAILED:', err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('Received Stripe Event:', event.type);

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const coupleId = session.metadata?.couple_id;
        const planType = session.metadata?.plan_type; // 'pro' or 'annual'

        console.log('Checkout Session Completed. Metadata:', { userId, coupleId, planType });

        if (coupleId && planType) {
            // Update user plan in Supabase
            console.log(`Updating plan for couple ${coupleId} to ${planType}`);

            const { data, error } = await supabaseClient
                .from('couples')
                .update({
                    plan: planType,
                    plan_updated_at: new Date().toISOString()
                })
                .eq('id', coupleId)
                .select();

            if (error) {
                console.error('Error updating couple plan:', error);
                return new Response(`Error updating couple plan: ${error.message}`, { status: 500 });
            }

            console.log('Update successful. Exiting data:', data);
        } else {
            console.warn('Missing metadata in checkout session:', { coupleId, planType });
            return new Response('Missing metadata', { status: 400 });
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
});
