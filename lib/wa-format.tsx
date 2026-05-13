import React from 'react'

// Renders text containing WhatsApp markdown into React nodes for the preview.
// Mirrors WhatsApp's own renderer:
//   *bold*      → <strong>
//   _italic_    → <em>
//   ~strike~    → <del>
//   `mono` or ```mono``` → <code>
//
// We process bold/italic/strike/mono in one pass over the string. The DB
// still stores the raw text with markers — that's what Meta wants. Only
// the preview component uses this helper.

interface Token {
  start: number
  end: number
  marker: '*' | '_' | '~' | '`'
  content: string
}

const MARKERS = ['*', '_', '~', '`'] as const

// Find a matching closing marker on the same character class, ensuring the
// content between has no newline (WhatsApp rule) and is non-empty.
function findToken(
  text: string,
  start: number,
  marker: '*' | '_' | '~' | '`',
): Token | null {
  // Skip ``` (triple backtick) — treat as single backtick for our purposes;
  // the inner content rendering is identical.
  let probeStart = start + 1
  if (marker === '`' && text.slice(start, start + 3) === '```') {
    probeStart = start + 3
  }

  for (let i = probeStart; i < text.length; i++) {
    const ch = text[i]
    if (ch === '\n') return null
    if (ch === marker) {
      // For triple backtick close, require ```
      if (marker === '`' && text.slice(start, start + 3) === '```') {
        if (text.slice(i, i + 3) !== '```') continue
        const content = text.slice(probeStart, i)
        if (!content) return null
        return { start, end: i + 3, marker, content }
      }
      const content = text.slice(probeStart, i)
      if (!content) return null
      return { start, end: i + 1, marker, content }
    }
  }
  return null
}

function wrap(
  marker: '*' | '_' | '~' | '`',
  children: React.ReactNode,
  key: string | number,
): React.ReactNode {
  switch (marker) {
    case '*':
      return <strong key={key}>{children}</strong>
    case '_':
      return <em key={key}>{children}</em>
    case '~':
      return <del key={key}>{children}</del>
    case '`':
      return (
        <code
          key={key}
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            backgroundColor: 'rgba(0,0,0,0.06)',
            padding: '0 4px',
            borderRadius: '3px',
            fontSize: '0.92em',
          }}
        >
          {children}
        </code>
      )
  }
}

// Recursive renderer. Splits the string at the first valid marker pair
// and recurses on the inner + remaining text. Nesting works because the
// inner string is recursed.
export function formatWhatsAppText(text: string): React.ReactNode[] {
  if (!text) return []
  const out: React.ReactNode[] = []
  let cursor = 0
  let keyCounter = 0

  while (cursor < text.length) {
    // Find the nearest opening marker from `cursor`
    let nearest: Token | null = null
    for (const m of MARKERS) {
      const pos = text.indexOf(m, cursor)
      if (pos === -1) continue
      if (nearest && pos >= nearest.start) continue
      const candidate = findToken(text, pos, m)
      if (candidate) {
        if (!nearest || candidate.start < nearest.start) {
          nearest = candidate
        }
      }
    }

    if (!nearest) {
      out.push(text.slice(cursor))
      break
    }

    if (nearest.start > cursor) {
      out.push(text.slice(cursor, nearest.start))
    }
    out.push(
      wrap(nearest.marker, formatWhatsAppText(nearest.content), keyCounter++),
    )
    cursor = nearest.end
  }

  return out
}
