/**
 * _SPECS/data/ 에서 대시보드에 필요한 핵심 파일만
 * signal-os/public/data/ 로 복사하는 번들링 스크립트.
 *
 * 사용법: node scripts/bundle-data.js
 *
 * Vercel 배포 전에 실행해서 데이터를 프로젝트 안에 포함시킨다.
 */

const fs = require('fs')
const path = require('path')

const SRC = path.resolve(__dirname, '..', '..', '_SPECS', 'data')
const DEST = path.resolve(__dirname, '..', 'public', 'data')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function copyFile(srcRelative, destRelative) {
  const src = path.join(SRC, srcRelative)
  const dest = path.join(DEST, destRelative || srcRelative)
  if (!fs.existsSync(src)) {
    console.warn(`  SKIP (not found): ${srcRelative}`)
    return false
  }
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
  console.log(`  OK: ${srcRelative} -> public/data/${destRelative || srcRelative}`)
  return true
}

function getLatestDateDir(dirPath) {
  if (!fs.existsSync(dirPath)) return null
  const dirs = fs.readdirSync(dirPath)
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
  return dirs[dirs.length - 1] || null
}

function getLatestFile(dirPath, ext = '.json') {
  if (!fs.existsSync(dirPath)) return null
  const files = fs.readdirSync(dirPath)
    .filter(f => f.endsWith(ext))
    .sort()
  return files[files.length - 1] || null
}

console.log('=== FLOWX Data Bundling ===')
console.log(`Source: ${SRC}`)
console.log(`Dest:   ${DEST}`)
console.log()

if (!fs.existsSync(SRC)) {
  console.error('ERROR: _SPECS/data/ not found!')
  process.exit(1)
}

// 기존 public/data 정리
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true })
}
ensureDir(DEST)

// 1. 단순 복사 파일
console.log('[1] Flat JSON files')
copyFile('tomorrow_picks.json')
copyFile('whale_detect.json')
copyFile('etf_master.json')

// 2. 중첩 경로 파일
console.log('\n[2] Nested path files')
copyFile('sector_rotation/sector_momentum.json')
copyFile('china_money/china_money_signal.json')
copyFile('sniper_watch/latest.json')

// 3. daily_snapshots → 최신 날짜의 report/news 복사
console.log('\n[3] Daily snapshots (latest)')
const snapshotsDir = path.join(SRC, 'daily_snapshots')
const latestDate = getLatestDateDir(snapshotsDir)
if (latestDate) {
  console.log(`  Latest date: ${latestDate}`)
  copyFile(
    `daily_snapshots/${latestDate}/integrated_report.json`,
    `daily_snapshots/${latestDate}/integrated_report.json`
  )
  copyFile(
    `daily_snapshots/${latestDate}/market_news.json`,
    `daily_snapshots/${latestDate}/market_news.json`
  )
} else {
  console.warn('  SKIP: no daily_snapshots date folders found')
}

// 4. supply_snapshots → 최신 파일 복사
console.log('\n[4] Supply snapshots (latest)')
const supplyDir = path.join(SRC, 'supply_snapshots')
const latestSupply = getLatestFile(supplyDir)
if (latestSupply) {
  copyFile(`supply_snapshots/${latestSupply}`)
} else {
  console.warn('  SKIP: no supply snapshots found')
}

// 5. china_money/history → 최신 날짜 파일 복사
console.log('\n[5] China money history (latest)')
const chinaDir = path.join(SRC, 'china_money', 'history')
const latestChina = getLatestFile(chinaDir)
if (latestChina) {
  copyFile(`china_money/history/${latestChina}`)
} else {
  console.warn('  SKIP: no china money history found')
}

// 6. universe CSV 파일
console.log('\n[6] Universe CSV')
copyFile('universe.csv')
copyFile('universe/all_tickers.csv')

console.log('\n=== Done! ===')
