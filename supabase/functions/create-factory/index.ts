import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateFactoryRequest {
  factory_name: string
  user_id?: string
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
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { factory_name }: CreateFactoryRequest = await req.json()

    if (!factory_name || factory_name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Factory name is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already has a factory
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('factory_id')
      .eq('id', user.id)
      .single()

    if (existingProfile?.factory_id) {
      return new Response(
        JSON.stringify({ error: 'User already has a factory' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create factory using the database function
    const { data: factoryResult, error: factoryError } = await supabaseClient
      .rpc('create_factory_for_user', {
        user_id: user.id,
        factory_name: factory_name.trim()
      })

    if (factoryError) {
      console.error('Error creating factory:', factoryError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create factory', 
          details: factoryError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the created factory details
    const { data: factory, error: fetchError } = await supabaseClient
      .from('factories')
      .select('*')
      .eq('id', factoryResult)
      .single()

    if (fetchError) {
      console.error('Error fetching factory:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Factory created but failed to fetch details' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Factory created successfully',
        factory: {
          id: factory.id,
          name: factory.name,
          owner_id: factory.owner_id,
          created_at: factory.created_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in create-factory function:', error)
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