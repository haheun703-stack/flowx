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

/** daily_snapshots/ 에서 최신 날짜 폴더의 특정 파일 읽기 */
export function readLatestSnapshot<T>(fileName: string): T {
  const snapshotsDir = getDataPath('daily_snapshots')
  const dates = readdirSync(snapshotsDir)
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
  const latest = dates[dates.length - 1]
  if (!latest) throw new Error('No daily snapshots found')
  return readJsonFile<T>(path.join('daily_snapshots', latest, fileName))
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

/** china_money/history/ 에서 최신 날짜 파일 읽기 */
export function readLatestChinaMoney<T>(): T {
  const dir = getDataPath('china_money', 'history')
  const files = readdirSync(dir)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
  const latest = files[files.length - 1]
  if (!latest) throw new Error('No china money data found')
  return readJsonFile<T>(path.join('china_money', 'history', latest))
}
