import { existsSync, readFileSync, readdirSync } from 'fs'
import path from 'path'

/**
 * _SPECS/data/ 폴더의 JSON/CSV 파일을 읽는 서버사이드 유틸리티.
 * Next.js API Route에서만 사용 (클라이언트 X).
 *
 * 경로 우선순위:
 *   1) 로컬 개발: _SPECS/data/ (프로젝트 바깥, 파이썬 자동화 데이터)
 *   2) Vercel 배포: public/data/ (번들링된 스냅샷)
 */

function resolveDataRoot(): string {
  const devRoot = path.resolve(process.cwd(), '..', '_SPECS', 'data')
  if (existsSync(devRoot)) return devRoot
  const prodRoot = path.join(process.cwd(), 'public', 'data')
  if (existsSync(prodRoot)) return prodRoot
  return devRoot
}

const DATA_ROOT = resolveDataRoot()

export function getDataPath(...segments: string[]): string {
  return path.join(DATA_ROOT, ...segments)
}

export function readJsonFile<T>(subpath: string): T {
  const filePath = getDataPath(subpath)
  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

/** supply_snapshots/ 에서 최신 스냅샷 파일 읽기 */
export function readLatestSupplySnapshot<T>(): T {
  const dir = getDataPath('supply_snapshots')
  const files = readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .sort()
  const latest = files[files.length - 1]
  if (!latest) throw new Error('No supply snapshots found')
  return readJsonFile<T>(path.join('supply_snapshots', latest))
}
