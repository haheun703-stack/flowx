import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data: latest } = await supabase
      .from('china_flow')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) return NextResponse.json([])

    const { data, error } = await supabase
      .from('china_flow')
      .select('*')
      .eq('date', latest.date)
      .order('score', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([])
  }
}
