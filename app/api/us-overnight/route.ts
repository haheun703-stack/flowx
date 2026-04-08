import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('daytrading_us_overnight')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: '데이터 없음' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[us-overnight]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
