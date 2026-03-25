import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'code parameter required' }, { status: 400 })

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('nationality_flows')
      .select('*')
      .eq('code', code)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'No nationality data' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Nationality data unavailable' }, { status: 503 })
  }
}
