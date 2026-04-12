#!/usr/bin/env node
/**
 * 등급/액션 리터럴 가드 스크립트
 *
 * 배경: 2026-04-05 표현 변경 당시 JarvisControlTower.tsx가 `\uXXXX` 유니코드
 * 이스케이프 형태로 등급을 저장하고 있어 일반 grep에 잡히지 않아 누락되는
 * 사고 발생. 이 스크립트가 재발을 막는 최후 방어선.
 *
 * 검사 대상:
 *   - 문자열 리터럴 내부의 등급 단어 (`"강력 포착"`, `'포착'`, `` `관심` ``)
 *   - 유니코드 이스케이프 버전 (`"\uAC15\uB825 \uD3EC\uCC29"` 등)
 *   - 객체 키의 대괄호 접근 (`X["강력 포착"]`, `X[\uXXXX]`)
 *
 * 허용(allowlist):
 *   - shared/constants/grades.ts (SSoT 정의)
 *   - scripts/guard-grades.mjs (이 파일)
 *   - app/policies/**, app/terms/**, features/landing/** (마케팅/약관 문구)
 *
 * 사용법:
 *   node scripts/guard-grades.mjs                   # 전체 스캔
 *   node scripts/guard-grades.mjs --file a.ts b.tsx # 지정 파일만 (lint-staged 연동)
 *
 * 종료 코드: 0 = 통과, 1 = 위반 발견
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()

/* ── 허용 파일/디렉토리 (glob 패턴, 정확 매칭 + prefix 매칭) ── */
const ALLOWED_EXACT = new Set([
  'shared/constants/grades.ts',
  'scripts/guard-grades.mjs',
])

const ALLOWED_PREFIXES = [
  'app/policies/',
  'app/terms/',
  'features/landing/',
  // 봇 내부 로직 파일(읽기 전용). 실 데이터는 봇이 생성하며 웹봇은 수동으로 동기화.
  // 가드는 웹봇 렌더링 경로를 보호하는 게 목적이라 여기는 화이트리스트.
  'features/bots/',
]

/* ── 금지 리터럴 (정확 일치만) ── */
const FORBIDDEN = [
  '강력 포착',
  '포착',
  '관심매수',
  '관찰',
  '보류',
  '적극매수',
  '매수',
  '매도',
  '경계',
  // '관심'은 일반 단어와 충돌이 커서 제외 (CrashBounceView.GRADE_CONFIG는 SSoT 이관 대상)
]

function toUnicodeEscape(str) {
  return Array.from(str).map(ch => {
    const cp = ch.codePointAt(0)
    if (cp === undefined || cp < 128) return ch
    return `\\u${cp.toString(16).toUpperCase().padStart(4, '0')}`
  }).join('')
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 각 금지 단어에 대해 3가지 패턴 생성:
 *  1) 평문 리터럴 따옴표 감싼 것: "강력 포착" / '강력 포착' / `강력 포착`
 *  2) 유니코드 이스케이프 감싼 것: "\uAC15\uB825 \uD3EC\uCC29"
 *  3) 혼합 (한글이 아닌 공백 포함): "\uAC15\uB825 \uD3EC\uCC29" (공백은 그대로)
 * 오직 "열기 따옴표 + 토큰 + 닫기 따옴표"만 잡아서 마케팅 문구 내부는 제외.
 */
const patterns = []
for (const lit of FORBIDDEN) {
  const esc = toUnicodeEscape(lit)
  const plain = escapeRegex(lit)
  const unicode = escapeRegex(esc)
  // 따옴표 안에 정확히 해당 리터럴만 있을 때만 매칭
  patterns.push({
    literal: lit,
    regex: new RegExp(`(['"\`])(${plain}|${unicode})\\1`, 'g'),
  })
}

/* ── 파일 스캔 (의존성 없는 재귀 순회) ── */
const SCAN_DIRS = ['features', 'app', 'shared', 'scripts', 'entities', 'lib', 'widgets']
const SCAN_EXTS = new Set(['.ts', '.tsx', '.mjs', '.js'])
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', '.git'])

function walk(dir, out) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.husky') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      walk(full, out)
    } else if (entry.isFile()) {
      if (SCAN_EXTS.has(path.extname(entry.name))) {
        out.push(path.relative(ROOT, full))
      }
    }
  }
}

/* ── CLI 파싱 ── */
const args = process.argv.slice(2)
let files = []

if (args[0] === '--file') {
  files = args.slice(1)
} else {
  for (const dir of SCAN_DIRS) {
    const abs = path.join(ROOT, dir)
    try {
      if (statSync(abs).isDirectory()) walk(abs, files)
    } catch {
      // 디렉토리 없음 — 스킵
    }
  }
}

function isAllowed(relPath) {
  const normalized = relPath.replaceAll('\\', '/')
  if (ALLOWED_EXACT.has(normalized)) return true
  return ALLOWED_PREFIXES.some(prefix => normalized.startsWith(prefix))
}

let violations = 0
const violationsByFile = new Map()

for (const inputPath of files) {
  // lint-staged 는 절대경로를 넘기므로 ROOT 기준 상대경로로 정규화
  const abs = path.isAbsolute(inputPath) ? inputPath : path.join(ROOT, inputPath)
  const relPath = path.relative(ROOT, abs)
  const normalized = relPath.replaceAll('\\', '/')
  if (isAllowed(normalized)) continue

  let content
  try {
    if (!statSync(abs).isFile()) continue
    content = readFileSync(abs, 'utf-8')
  } catch {
    continue
  }

  const fileViolations = []
  for (const { literal, regex } of patterns) {
    regex.lastIndex = 0
    const matches = [...content.matchAll(regex)]
    if (matches.length === 0) continue
    for (const m of matches) {
      const beforeText = content.slice(0, m.index)
      const line = beforeText.split('\n').length
      fileViolations.push({ line, literal, match: m[0] })
      violations++
    }
  }
  if (fileViolations.length > 0) {
    violationsByFile.set(normalized, fileViolations)
  }
}

if (violations > 0) {
  console.error('\n❌ 등급 리터럴 가드 위반 발견\n')
  console.error('금지된 리터럴이 문자열 상수로 발견되었습니다.')
  console.error('shared/constants/grades.ts의 상수를 import해서 사용하세요.\n')
  for (const [file, items] of violationsByFile) {
    console.error(`  ${file}`)
    for (const v of items) {
      console.error(`    L${v.line}  ${v.match}  (${v.literal})`)
    }
  }
  console.error(`\n총 ${violations}건 위반 (${violationsByFile.size}개 파일)\n`)
  console.error('해결: 해당 리터럴을 shared/constants/grades.ts에서 import하거나,')
  console.error('      디스플레이 전용 마케팅 문구라면 scripts/guard-grades.mjs의 ALLOWED_PREFIXES에 추가하세요.\n')
  process.exit(1)
}

console.log('✅ 등급 리터럴 가드 통과')
