import { NextRequest, NextResponse } from 'next/server'
import { supabaseAnon, supabaseAdmin } from '@/lib/supabase'

const requireAdmin = (req: NextRequest) => {
  const token = req.headers.get('x-admin-token')?.trim()
  const admin = process.env.ADMIN_TOKEN?.trim()
  if (!admin || token !== admin) {
    return false
  }
  return true
}

export async function GET() {
  const sb = supabaseAnon()
  const { data, error } = await sb
    .from('teams')
    .select('*')
    .order('rating', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ teams: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { name, members, rating, event_id = null } = body as {
    name?: string
    members?: string[]
    rating?: number
    event_id?: string | null
  }

  if (!name || !Array.isArray(members) || members.length !== 4 || typeof rating !== 'number') {
    return NextResponse.json({ error: 'name, members[4], rating are required' }, { status: 400 })
  }

  const cleanMembers = members.map((m) => `${m ?? ''}`.trim())
  if (cleanMembers.some((m) => m.length === 0)) {
    return NextResponse.json({ error: 'All 4 member names are required' }, { status: 400 })
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('teams')
    .insert({ name, members: cleanMembers, rating, event_id })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ team: data }, { status: 201 })
}
