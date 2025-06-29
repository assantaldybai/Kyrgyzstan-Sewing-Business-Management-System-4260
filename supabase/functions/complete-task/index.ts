import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CompleteTaskRequest {
  task_id: string
  completion_data: any
  completion_notes?: string
  actual_hours?: number
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
    const { task_id, completion_data, completion_notes, actual_hours }: CompleteTaskRequest = await req.json()

    if (!task_id || !completion_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get task details
    const { data: task, error: taskError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('id', task_id)
      .eq('factory_id', profile.factory_id)
      .single()

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: 'Task not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (task.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Task already completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Complete the task
    const { error: updateError } = await supabaseClient
      .from('tasks')
      .update({
        status: 'completed',
        completion_data: completion_data,
        completion_notes: completion_notes || '',
        actual_hours: actual_hours || task.estimated_hours,
        completed_at: new Date().toISOString()
      })
      .eq('id', task_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to complete task', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle task-specific completion logic and create next tasks
    let nextTasksCreated = []

    switch (task.type) {
      case 'tech_spec':
        // Технолог завершил - создаем задачу для снабжения
        if (completion_data.required_materials) {
          const { data: procurementTaskResult } = await supabaseClient
            .rpc('create_procurement_task', {
              p_order_id: task.order_id,
              p_lot_id: task.lot_id,
              p_factory_id: profile.factory_id,
              p_required_materials: completion_data.required_materials
            })
          
          if (procurementTaskResult) {
            nextTasksCreated.push({ type: 'procurement', id: procurementTaskResult })
          }
        }
        break

      case 'procurement':
        // Снабжение завершено - создаем задачу для кройщика
        const { data: cuttingTaskResult } = await supabaseClient
          .rpc('create_cutting_task', {
            p_order_id: task.order_id,
            p_lot_id: task.lot_id,
            p_factory_id: profile.factory_id,
            p_quantity: task.task_data.target_quantity || 1
          })
        
        if (cuttingTaskResult) {
          nextTasksCreated.push({ type: 'cutting', id: cuttingTaskResult })
        }
        break

      case 'cutting':
        // Раскрой завершен - создаем задачу для бригадира
        const actualQuantity = completion_data.actual_quantity || task.task_data.target_quantity
        
        const { data: sewingTaskResult } = await supabaseClient
          .rpc('create_sewing_task', {
            p_order_id: task.order_id,
            p_lot_id: task.lot_id,
            p_factory_id: profile.factory_id,
            p_quantity: actualQuantity
          })
        
        if (sewingTaskResult) {
          nextTasksCreated.push({ type: 'sewing', id: sewingTaskResult })
        }
        break

      case 'sewing':
        // Пошив завершен - создаем задачу для ОТК
        const sewingQuantity = completion_data.completed_quantity || task.task_data.target_quantity
        
        const { data: qcTaskResult } = await supabaseClient
          .rpc('create_qc_task', {
            p_order_id: task.order_id,
            p_lot_id: task.lot_id,
            p_factory_id: profile.factory_id,
            p_quantity: sewingQuantity
          })
        
        if (qcTaskResult) {
          nextTasksCreated.push({ type: 'qc', id: qcTaskResult })
        }
        break

      case 'qc':
        // ОТК завершен
        const qualityPassed = completion_data.quality_passed || 0
        const qualityDefect = completion_data.quality_defect || 0
        
        // Если есть годные изделия - создаем задачу для упаковщика
        if (qualityPassed > 0) {
          const { data: packagingTaskResult } = await supabaseClient
            .rpc('create_packaging_task', {
              p_order_id: task.order_id,
              p_lot_id: task.lot_id,
              p_factory_id: profile.factory_id,
              p_quantity: qualityPassed
            })
          
          if (packagingTaskResult) {
            nextTasksCreated.push({ type: 'packaging', id: packagingTaskResult })
          }
        }
        
        // Если есть брак - создаем задачу на исправление
        if (qualityDefect > 0) {
          const { data: reworkTaskResult } = await supabaseClient
            .rpc('create_rework_task', {
              p_order_id: task.order_id,
              p_lot_id: task.lot_id,
              p_factory_id: profile.factory_id,
              p_defect_quantity: qualityDefect,
              p_defect_description: completion_data.defect_description || 'Требует исправления'
            })
          
          if (reworkTaskResult) {
            nextTasksCreated.push({ type: 'rework', id: reworkTaskResult })
          }
        }
        break

      case 'packaging':
        // Упаковка завершена - заказ готов к отгрузке
        await supabaseClient
          .from('orders')
          .update({ status: 'ready_for_delivery' })
          .eq('id', task.order_id)
        break

      case 'rework':
        // Исправление завершено - создаем повторную задачу для ОТК
        const reworkedQuantity = completion_data.reworked_quantity || task.task_data.defect_quantity
        
        const { data: reQcTaskResult } = await supabaseClient
          .rpc('create_qc_task', {
            p_order_id: task.order_id,
            p_lot_id: task.lot_id,
            p_factory_id: profile.factory_id,
            p_quantity: reworkedQuantity
          })
        
        if (reQcTaskResult) {
          nextTasksCreated.push({ type: 'qc_rework', id: reQcTaskResult })
        }
        break
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Task completed successfully',
        task_id: task_id,
        task_type: task.type,
        next_tasks_created: nextTasksCreated
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in complete-task:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})