import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RecordProgressRequest {
  sew_flow_id: string
  employee_id: string
  quantity_completed: number
  quality_passed?: number
  quality_defect?: number
  time_spent_minutes: number
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
    const progressData: RecordProgressRequest = await req.json()

    // Validate required fields
    if (!progressData.sew_flow_id || !progressData.employee_id || !progressData.quantity_completed || !progressData.time_spent_minutes) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get sew flow operation details
    const { data: sewFlow, error: sewFlowError } = await supabaseClient
      .from('sew_flow')
      .select(`
        *,
        production_lots!inner (
          factory_id,
          order_id
        )
      `)
      .eq('id', progressData.sew_flow_id)
      .single()

    if (sewFlowError || !sewFlow) {
      return new Response(
        JSON.stringify({ error: 'Sew flow operation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify factory access
    if (sewFlow.production_lots.factory_id !== profile.factory_id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get employee details for rate calculation
    const { data: employee, error: employeeError } = await supabaseClient
      .from('profiles')
      .select('salary')
      .eq('id', progressData.employee_id)
      .single()

    if (employeeError || !employee) {
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate earnings (rate per unit * quantity)
    const ratePerUnit = sewFlow.rate || 0
    const totalEarned = progressData.quantity_completed * ratePerUnit

    // 1. Create production log entry
    const { data: productionLog, error: logError } = await supabaseClient
      .from('production_log')
      .insert({
        factory_id: profile.factory_id,
        sew_flow_id: progressData.sew_flow_id,
        employee_id: progressData.employee_id,
        quantity_completed: progressData.quantity_completed,
        quality_passed: progressData.quality_passed || progressData.quantity_completed,
        quality_defect: progressData.quality_defect || 0,
        time_spent_minutes: progressData.time_spent_minutes,
        rate_per_unit: ratePerUnit,
        total_earned: totalEarned,
        notes: progressData.notes || '',
        completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (logError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create production log', details: logError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Create financial transaction for salary expense
    if (totalEarned > 0) {
      const { error: financeError } = await supabaseClient
        .from('financial_transactions')
        .insert({
          factory_id: profile.factory_id,
          amount: totalEarned,
          currency: 'KGS',
          type: 'expense_salary',
          status: 'accrued',
          order_id: sewFlow.production_lots.order_id,
          employee_id: progressData.employee_id,
          description: `Зарплата за ${sewFlow.operation_name}: ${progressData.quantity_completed} шт.`,
          transaction_date: new Date().toISOString()
        })

      if (financeError) {
        console.error('Failed to create financial transaction:', financeError)
        // Don't fail the whole operation, just log the error
      }
    }

    // 3. Update sew flow operation status
    const newStatus = progressData.quantity_completed >= (sewFlow.estimated_time_minutes || 0) ? 'completed' : 'in_progress'
    
    await supabaseClient
      .from('sew_flow')
      .update({
        status: newStatus,
        actual_time_minutes: (sewFlow.actual_time_minutes || 0) + progressData.time_spent_minutes,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', progressData.sew_flow_id)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Production progress recorded successfully',
        production_log_id: productionLog.id,
        total_earned: totalEarned,
        operation_status: newStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in record-production-progress:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})