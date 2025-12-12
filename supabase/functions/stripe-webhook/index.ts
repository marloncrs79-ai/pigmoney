
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
        // Use async version for Deno runtime
        event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        let coupleId = session.metadata?.couple_id;
        const planType = session.metadata?.plan_type;
        const userId = session.metadata?.user_id;

        console.log('Webhook received:', { coupleId, planType, userId, sessionId: session.id });

        // If couple_id is missing or empty, try to find via user_id
        if ((!coupleId || coupleId === '') && userId) {
            console.log('couple_id missing, looking up via user_id:', userId);
            const { data: memberData, error: memberError } = await supabaseClient
                .from('couple_members')
                .select('couple_id')
                .eq('user_id', userId)
                .maybeSingle();

            if (memberError) {
                console.error('Error looking up couple:', memberError);
            } else if (memberData?.couple_id) {
                coupleId = memberData.couple_id;
                console.log('Found couple_id:', coupleId);
            }
        }

        if (coupleId && planType) {
            console.log('Updating plan for couple:', coupleId, 'to:', planType);
            const { error } = await supabaseClient
                .from('couples')
                .update({
                    plan: planType,
                    plan_updated_at: new Date().toISOString()
                })
                .eq('id', coupleId);

            if (error) {
                console.error('Error updating plan:', error);
                return new Response(`Error updating plan: ${error.message}`, { status: 500 });
            }
            console.log('Plan updated successfully!');
        } else {
            console.error('Missing required metadata:', { coupleId, planType, userId });
            return new Response('Missing metadata: couple_id or plan_type', { status: 400 });
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
    });
});
