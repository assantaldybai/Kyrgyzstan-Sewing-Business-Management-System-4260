import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateOrderRequest {
  customer_name: string
  customer_email?: string
  customer_phone?: string
  product_model_id: string
  quantity: number
  price_per_unit: number
  delivery_date: string
  advance_payment?: number
  color?: string
  size?: string
  notes?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's factory
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('factory_id')
      .eq('id', user.id)
      .single()

    if (!profile?.factory_id) {
      return new Response(
        JSON.stringify({ error: 'User has no factory' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const orderData: CreateOrderRequest = await req.json()

    // Validate required fields
    if (!orderData.customer_name || !orderData.product_model_id || !orderData.quantity || !orderData.price_per_unit) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Start transaction
    const { data: transactionResult, error: transactionError } = await supabaseClient
      .rpc('create_order_and_initiate_production', {
        p_factory_id: profile.factory_id,
        p_customer_name: orderData.customer_name,
        p_customer_email: orderData.customer_email || null,
        p_customer_phone: orderData.customer_phone || null,
        p_product_model_id: orderData.product_model_id,
        p_quantity: orderData.quantity,
        p_price_per_unit: orderData.price_per_unit,
        p_delivery_date: orderData.delivery_date,
        p_advance_payment: orderData.advance_payment || 0,
        p_color: orderData.color || null,
        p_size: orderData.size || null,
        p_notes: orderData.notes || null
      })

    if (transactionError) {
      console.error('Transaction error:', transactionError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create order', 
          details: transactionError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Order created and production initiated',
        order_id: transactionResult.order_id,
        order_number: transactionResult.order_number,
        lot_id: transactionResult.lot_id,
        lot_number: transactionResult.lot_number,
        operations_created: transactionResult.operations_created,
        materials_reserved: transactionResult.materials_reserved
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in create-order-and-initiate-production:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})