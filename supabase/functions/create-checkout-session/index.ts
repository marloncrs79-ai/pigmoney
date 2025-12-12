
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { planType, priceId } = await req.json(); // Allow passing explicit priceId or deriving from planType

        // Replace with your actual Stripe Secret Key via environment variable
        // For local dev, make sure to set this in an .env file or Supabase secrets
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
            apiVersion: '2023-10-16',
        });

        // Get the user from the authorization header
        const authHeader = req.headers.get('Authorization')!;
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        // Initialize Admin Client for DB operations (Bypass RLS)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        );

        // Validate user is authenticated with context client
        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Fetch couple_id for the user using Admin Client
        let coupleId: string | null = null;
        const { data: memberData, error: memberError } = await supabaseAdmin
            .from('couple_members')
            .select('couple_id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (memberData?.couple_id) {
            coupleId = memberData.couple_id;
        } else {
            // User doesn't have a couple yet - create one automatically
            console.log('User has no couple, creating one...');

            // Create a new couple for the user
            const { data: newCouple, error: coupleCreateError } = await supabaseAdmin
                .from('couples')
                .insert({ name: user.email?.split('@')[0] || 'Minha Conta', plan: 'free' })
                .select('id')
                .single();

            if (coupleCreateError) {
                console.error('Error creating couple:', coupleCreateError);
                // Proceed without couple_id - webhook will handle association
            } else if (newCouple) {
                // Link user to the new couple
                const { error: memberCreateError } = await supabaseAdmin
                    .from('couple_members')
                    .insert({ couple_id: newCouple.id, user_id: user.id, role: 'owner' });

                if (memberCreateError) {
                    console.error('Error creating member:', memberCreateError);
                } else {
                    coupleId = newCouple.id;
                }
            }
        }

        // Define Price IDs (You should replace these with your actual Stripe Price IDs)
        const PRICES = {
            pro: 'price_1ScWNvRwlWferaV1KjQ2MrZz',
            annual: 'price_1ScWQTRwlWferaV1IcWqbmdi'
        };
        const price = priceId || PRICES[planType as keyof typeof PRICES];

        if (!price) {
            throw new Error('Invalid plan or price ID');
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/checkout?canceled=true`,
            customer_email: user.email,
            metadata: {
                user_id: user.id,
                couple_id: coupleId || '',
                plan_type: planType
            },
        });

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
