import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const kstDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })

    const { data: items, error } = await supabase
      .from('short_signals')
      .select('code,name,grade,total_score,entry_price,stop_loss,target_price,holding_days,momentum_regime,created_at')
      .eq('signal_type', 'NUGGET')
      .eq('date', kstDate)
      .order('total_score', { ascending: false })

    if (error) {
      console.error('[API /value-hunter] Supabase error:', error.message)
      return NextResponse.json({ error: '밸류 헌터 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ items: items ?? [], date: kstDate })
  } catch (err) {
    console.error('[API /value-hunter] error:', err)
    return NextResponse.json({ error: '밸류 헌터 데이터 조회 오류' }, { status: 500 })
  }
}
