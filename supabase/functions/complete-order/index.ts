import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CompleteOrderRequest {
  order_id: string
  quality_passed: number
  quality_defect: number
  final_notes?: string
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
    const completionData: CompleteOrderRequest = await req.json()

    // Validate required fields
    if (!completionData.order_id || completionData.quality_passed === undefined || completionData.quality_defect === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get order details with items
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_model_id,
          quantity,
          price_per_unit,
          product_models (
            name,
            article_number
          )
        )
      `)
      .eq('id', completionData.order_id)
      .eq('factory_id', profile.factory_id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (order.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Order already completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate financial impact
    const totalQuantity = completionData.quality_passed + completionData.quality_defect
    const defectLossAmount = completionData.quality_defect * (order.order_items[0]?.price_per_unit || 0)

    // Start transaction-like operations
    try {
      // 1. Update order status
      await supabaseClient
        .from('orders')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
          notes: completionData.final_notes || order.notes
        })
        .eq('id', completionData.order_id)

      // 2. Create finished products for quality passed items
      if (completionData.quality_passed > 0) {
        const products = Array.from({ length: completionData.quality_passed }, () => ({
          factory_id: profile.factory_id,
          order_id: completionData.order_id,
          product_model_id: order.order_items[0]?.product_model_id,
          status: 'ready',
          quality_grade: 'A',
          produced_at: new Date().toISOString()
        }))

        await supabaseClient
          .from('products')
          .insert(products)
      }

      // 3. Update financial transaction for income (confirm it)
      await supabaseClient
        .from('financial_transactions')
        .update({
          status: 'confirmed',
          amount: completionData.quality_passed * (order.order_items[0]?.price_per_unit || 0),
          description: `Доход от заказа ${order.order_number} (${completionData.quality_passed} шт.)`
        })
        .eq('order_id', completionData.order_id)
        .eq('type', 'income')

      // 4. Create defect expense if there are defective items
      if (completionData.quality_defect > 0 && defectLossAmount > 0) {
        await supabaseClient
          .from('financial_transactions')
          .insert({
            factory_id: profile.factory_id,
            amount: defectLossAmount,
            currency: 'KGS',
            type: 'expense_defect',
            status: 'confirmed',
            order_id: completionData.order_id,
            description: `Убыток от брака: ${completionData.quality_defect} шт. из заказа ${order.order_number}`,
            transaction_date: new Date().toISOString()
          })
      }

      // 5. Update material transactions from reserved to used
      await supabaseClient
        .from('material_transactions')
        .update({
          status: 'confirmed',
          notes: 'Материалы использованы при завершении заказа'
        })
        .eq('order_id', completionData.order_id)
        .eq('status', 'pending')

      // 6. Update production lot status
      await supabaseClient
        .from('production_lots')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', completionData.order_id)

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Order completed successfully',
          order_id: completionData.order_id,
          order_number: order.order_number,
          quality_passed: completionData.quality_passed,
          quality_defect: completionData.quality_defect,
          defect_loss_amount: defectLossAmount,
          products_created: completionData.quality_passed
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (transactionError) {
      console.error('Transaction error:', transactionError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to complete order', 
          details: transactionError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in complete-order:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})