'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ background: '#f8f9fb', color: '#111827', fontFamily: 'monospace', padding: 40 }}>
        <h1 style={{ color: '#dc2626' }}>FLOWX Error</h1>
        <pre style={{ background: '#f3f4f6', padding: 20, borderRadius: 8, overflow: 'auto', fontSize: 13, lineHeight: 1.6 }}>
          {error.message}
          {'\n\n'}
          {error.stack}
        </pre>
        <button
          onClick={reset}
          style={{ marginTop: 20, padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
        >
          다시 시도
        </button>
      </body>
    </html>
  )
}
