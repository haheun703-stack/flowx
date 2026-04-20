import { readFileSync } from 'fs'

try {
  const envContent = readFileSync('.env.local', 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* ignore */ }

async function testModel(id) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: id, max_tokens: 16, messages: [{ role: 'user', content: 'Hi' }] }),
  })
  const json = await res.json()
  console.log(`${id}: ${res.ok ? 'OK' : res.status + ' ' + (json.error?.message || '')}`)
}

// Sonnet 계열
await testModel('claude-sonnet-4-6')

// Opus 계열 (Advisor용)
await testModel('claude-opus-4-7-20250506')
await testModel('claude-opus-4-6')
await testModel('claude-opus-4-7')
