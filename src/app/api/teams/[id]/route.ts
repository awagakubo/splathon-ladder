import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const requireAdmin = (req: NextRequest) => {
  const token = req.headers.get('x-admin-token')
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return false
  }
  return true
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { rating } = body as { rating?: number }
  if (typeof rating !== 'number') return NextResponse.json({ error: 'rating is required' }, { status: 400 })

  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('teams')
    .update({ rating })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Append rating history with next round number
  const { data: maxRoundRows } = await sb
    .from('rating_history')
    .select('round')
    .eq('team_id', id)
    .order('round', { ascending: false })
    .limit(1)

  const nextRound = (maxRoundRows?.[0]?.round ?? 0) + 1
  await sb
    .from('rating_history')
    .insert({ team_id: id, round: nextRound, rating })

  return NextResponse.json({ team: data })
}
