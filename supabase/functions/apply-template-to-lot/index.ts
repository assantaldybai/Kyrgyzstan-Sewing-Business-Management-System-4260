import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ApplyTemplateRequest {
  template_id: string
  lot_id: string
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

    // Parse request body
    const { template_id, lot_id }: ApplyTemplateRequest = await req.json()

    if (!template_id || !lot_id) {
      return new Response(
        JSON.stringify({ error: 'template_id and lot_id are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 1. Проверяем существование шаблона и партии
    const { data: template, error: templateError } = await supabaseClient
      .from('tech_map_templates')
      .select('*')
      .eq('id', template_id)
      .single()

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: 'Template not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { data: lot, error: lotError } = await supabaseClient
      .from('production_lots')
      .select('*')
      .eq('id', lot_id)
      .single()

    if (lotError || !lot) {
      return new Response(
        JSON.stringify({ error: 'Production lot not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 2. Получаем все операции из шаблона
    const { data: templateOperations, error: operationsError } = await supabaseClient
      .from('tech_map_template_operations')
      .select(`
        *,
        equipment_types (
          id,
          name,
          description
        )
      `)
      .eq('template_id', template_id)
      .order('sequence_order')

    if (operationsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch template operations' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 3. Удаляем существующие операции для этой партии (если есть)
    await supabaseClient
      .from('sew_flow')
      .delete()
      .eq('lot_id', lot_id)

    // 4. Копируем операции из шаблона в sew_flow
    const sewFlowOperations = templateOperations.map(op => ({
      lot_id: lot_id,
      operation_name: op.operation_name,
      sequence_order: op.sequence_order,
      equipment_type_id: op.equipment_type_id,
      rate: op.base_rate || 0,
      estimated_time_minutes: op.estimated_time_minutes || 0,
      status: 'pending',
      notes: op.description || ''
    }))

    const { data: insertedOperations, error: insertError } = await supabaseClient
      .from('sew_flow')
      .insert(sewFlowOperations)
      .select()

    if (insertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to insert operations', details: insertError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 5. Обновляем статус партии
    await supabaseClient
      .from('production_lots')
      .update({ 
        tech_map_applied: true,
        applied_template_id: template_id,
        status: 'ready_for_production',
        updated_at: new Date().toISOString()
      })
      .eq('id', lot_id)

    // 6. Возвращаем результат
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Template applied successfully',
        applied_operations: insertedOperations.length,
        template_name: template.name,
        lot_number: lot.lot_number
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error applying template:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})