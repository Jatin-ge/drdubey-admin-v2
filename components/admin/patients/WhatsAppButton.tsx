'use client'
import { useState } from 'react'

const TEMPLATES = [
  {
    label: 'Appointment Reminder (Hindi)',
    name: 'appointment_reminder_hi',
    language: 'hi',
  },
  {
    label: '1 Week Follow-Up (Hindi)',
    name: 'post_surgery_1week_hi',
    language: 'hi',
  },
  {
    label: '1 Month Follow-Up (Hindi)',
    name: 'post_surgery_1month_hi',
    language: 'hi',
  },
]

interface WhatsAppButtonProps {
  phone: string
  patientName: string
}

export default function WhatsAppButton({
  phone,
  patientName,
}: WhatsAppButtonProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const sendMessage = async (template: typeof TEMPLATES[0]) => {
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
          parameters: [patientName],
        })
      })
      if (res.ok) {
        setSent(true)
        setTimeout(() => setSent(false), 3000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const rawDigits = phone.replace(/\D/g, '')
  const waPhone = rawDigits.startsWith('91') ? rawDigits : `91${rawDigits}`

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
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
        {sent ? '✅ Sent' : sending ? 'Sending...' : '💬 WhatsApp'}
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
            minWidth: '240px',
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
                Select template
              </p>
            </div>
            {TEMPLATES.map(t => (
              <button
                key={t.name}
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
                {t.label}
              </button>
            ))}
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
              }}
            >
              Open in WhatsApp ↗
            </a>
          </div>
        </>
      )}
    </div>
  )
}
