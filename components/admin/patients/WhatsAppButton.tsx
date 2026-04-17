'use client'
import { useState, useEffect } from 'react'

interface Template {
  name: string
  language: string
  category: string
}

interface WhatsAppButtonProps {
  phone: string
  patientName: string
  leadId?: string
}

export default function WhatsAppButton({
  phone,
  patientName,
  leadId,
}: WhatsAppButtonProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const fetchTemplates = () => {
    if (templates.length > 0) return
    setLoadingTemplates(true)
    fetch('/api/whatsapp/templates')
      .then(r => r.json())
      .then(d => {
        setTemplates(Array.isArray(d) ? d : [])
        setLoadingTemplates(false)
      })
      .catch(() => setLoadingTemplates(false))
  }

  const sendMessage = async (template: Template) => {
    setSending(true)
    setShowMenu(false)
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          templateName: template.name,
          language: template.language,
          parameters: [],
          leadId,
        })
      })
      if (res.ok) {
        setSent(true)
        setTimeout(() => setSent(false), 3000)
      } else {
        const err = await res.json()
        alert(`Failed: ${err.error || 'Unknown error'}`)
      }
    } catch (e) {
      console.error('[WhatsAppButton]', e)
    } finally {
      setSending(false)
    }
  }

  const rawDigits = phone.replace(/\D/g, '')
  const waPhone = rawDigits.startsWith('91') ? rawDigits : `91${rawDigits}`

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => {
          setShowMenu(!showMenu)
          if (!showMenu) fetchTemplates()
        }}
        disabled={sending}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 14px',
          backgroundColor: sent ? '#f0fdf4' : sending ? '#dcfce7' : '#25D366',
          color: sent || sending ? '#15803d' : 'white',
          border: sent || sending ? '1px solid #bbf7d0' : 'none',
          borderRadius: '7px',
          fontSize: '13px',
          fontWeight: '500',
          cursor: sending ? 'not-allowed' : 'pointer',
        }}
      >
        {sent ? 'Sent' : sending ? 'Sending...' : 'WhatsApp'}
      </button>

      {showMenu && !sending && (
        <>
          <div
            onClick={() => setShowMenu(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            zIndex: 50,
            minWidth: '260px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Send template message
              </p>
            </div>

            {loadingTemplates ? (
              <div style={{ padding: '14px', fontSize: '13px', color: '#94a3b8' }}>
                Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div style={{ padding: '14px', fontSize: '13px', color: '#94a3b8' }}>
                No approved templates yet.
                <br />
                <span style={{ fontSize: '11px' }}>Create templates in WhatsApp Manager first.</span>
              </div>
            ) : (
              templates.map(t => (
                <button
                  key={`${t.name}-${t.language}`}
                  onClick={() => sendMessage(t)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '11px 14px',
                    border: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#1e293b',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'white'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{t.name}</span>
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '99px',
                    backgroundColor: '#f1f5f9',
                    color: '#94a3b8',
                  }}>
                    {t.language}
                  </span>
                </button>
              ))
            )}

            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                padding: '11px 14px',
                fontSize: '13px',
                color: '#25D366',
                fontWeight: '500',
                textDecoration: 'none',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              Open in WhatsApp
            </a>
          </div>
        </>
      )}
    </div>
  )
}
