-- ============================================
-- FLOWX Phase D: User profiles + Auth
-- Supabase Dashboard → SQL Editor에서 실행
-- ============================================

-- 0. updated_at 자동 갱신 범용 함수 (없으면 생성)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. profiles 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  phone text,
  tier text NOT NULL DEFAULT 'FREE'
    CHECK (tier IN ('FREE', 'SIGNAL', 'PRO', 'VIP')),
  marketing_agreed boolean DEFAULT false,
  subscription_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- phone 컬럼이 없으면 추가 (이미 테이블이 있는 경우)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_agreed boolean DEFAULT false;

-- 2. 회원가입 시 자동 프로필 생성 트리거 (에러에 강하게)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    'FREE'
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- 에러 나도 회원가입은 진행 (프론트에서 폴백 INSERT)
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. updated_at 자동 갱신
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성 (중복 방지)
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "service_all_profiles" ON profiles;

-- 본인 프로필만 읽기
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 본인 프로필만 수정
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- service_role 전체 권한 (결제 webhook / cron)
CREATE POLICY "service_all_profiles" ON profiles
  FOR ALL TO service_role USING (true);
