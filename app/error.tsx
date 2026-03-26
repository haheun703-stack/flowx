'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ background: '#0a0c10', color: '#e2e8f0', fontFamily: 'monospace', padding: 40, minHeight: '100vh' }}>
      <h1 style={{ color: '#ff4d6d', fontSize: 24 }}>페이지 에러</h1>
      <pre style={{ background: '#131722', padding: 20, borderRadius: 8, overflow: 'auto', fontSize: 13, lineHeight: 1.6, maxWidth: '100%', whiteSpace: 'pre-wrap' }}>
        {error.message}
        {'\n\n'}
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: 20, padding: '10px 24px', background: '#00ff88', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
      >
        다시 시도
      </button>
    </div>
  )
}
