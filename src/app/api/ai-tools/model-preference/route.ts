import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's model preference from user settings or metadata
    const { data: settings } = await supabase
      .from('user_settings')
      .select('ai_model')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      model: settings?.ai_model || 'anthropic/claude-3-5-haiku'
    })
  } catch (error) {
    console.error('Error loading model preference:', error)
    // Return default model if table doesn't exist
    return NextResponse.json({
      model: 'anthropic/claude-3-5-haiku'
    })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { model } = await request.json()

    if (!model) {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 })
    }

    // Upsert user settings
    const { error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: user.id,
          ai_model: model,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id'
        }
      )

    if (error) {
      console.error('Error saving model preference:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, model })
  } catch (error) {
    console.error('Error in POST /api/ai-tools/model-preference:', error)
    return NextResponse.json(
      { error: 'Failed to save model preference' },
      { status: 500 }
    )
  }
}
