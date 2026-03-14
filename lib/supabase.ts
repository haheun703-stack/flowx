import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _admin: SupabaseClient | null = null
let _client: SupabaseClient | null = null

// 서버사이드 (API Route에서 사용) — service_role 키로 RLS 우회
export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    if (!url || !key) throw new Error('Supabase 환경변수가 설정되지 않았습니다')
    _admin = createClient(url, key)
  }
  return _admin
}

// 클라이언트사이드 (필요 시) — anon 키로 RLS 적용
export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase 환경변수가 설정되지 않았습니다')
    _client = createClient(url, key)
  }
  return _client
}
