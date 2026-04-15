'use client'
import { useState, useEffect } from 'react'

interface WAStatus {
  status: string
  phoneNumberId: string
  wabaId: string
  phoneData: {
    displayPhone: string
    verifiedName: string
    qualityRating: string
    status: string
  } | null
  error: string | null
}

interface TestResult {
  phone: string
  status: 'sending' | 'sent' | 'failed'
  message?: string
}

export default function WhatsAppPage() {
  const [waStatus, setWaStatus] = useState<WAStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testPhone, setTestPhone] = useState('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/api/whatsapp/test')
      .then(r => r.json())
      .then(d => {
        setWaStatus(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const sendTestMessage = async () => {
    if (!testPhone.trim()) return
    setSending(true)
    setTestResult({ phone: testPhone, status: 'sending' })
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          templateName: 'hello_world',
          language: 'en',
          parameters: [],
        })
      })
      const data = await res.json()
      setTestResult({
        phone: testPhone,
        status: res.ok ? 'sent' : 'failed',
        message: res.ok ? `Message ID: ${data.messageId}` : data.error,
      })
    } catch (e: any) {
      setTestResult({ phone: testPhone, status: 'failed', message: e.message })
    } finally {
      setSending(false)
    }
  }

  const isConnected = waStatus?.status === 'connected'

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
            WhatsApp Integration
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Connection status and test tools
          </p>
        </div>
      </div>

      {/* Connection Status */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${isConnected ? '#16a34a' : '#dc2626'}`,
        padding: '20px 24px',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: loading ? '#f59e0b' : isConnected ? '#16a34a' : '#dc2626',
          }}/>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
            {loading ? 'Checking connection...' : isConnected ? 'WhatsApp Connected' : 'Connection Error'}
          </span>
        </div>

        {!loading && waStatus && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            {[
              { label: 'Phone Number', value: waStatus.phoneData?.displayPhone || '—' },
              { label: 'Verified Name', value: waStatus.phoneData?.verifiedName || '—' },
              { label: 'Quality Rating', value: waStatus.phoneData?.qualityRating || '—' },
              { label: 'Phone Number ID', value: waStatus.phoneNumberId },
            ].map(item => (
              <div key={item.label} style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '12px',
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px',
                }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', fontFamily: 'monospace' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && waStatus?.error && (
          <div style={{
            backgroundColor: '#fef2f2',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '12px',
          }}>
            <p style={{ fontSize: '13px', color: '#dc2626' }}>
              Error: {waStatus.error}
            </p>
          </div>
        )}
      </div>

      {/* Test Message */}
      {isConnected && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          marginBottom: '20px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
            Send Test Message
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Sends the WhatsApp hello_world template to verify the connection is working
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              placeholder="Enter phone number (e.g. 9876543210)"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #e2e8f0',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              onClick={sendTestMessage}
              disabled={sending || !testPhone.trim()}
              style={{
                padding: '10px 24px',
                backgroundColor: sending ? '#86efac' : '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: sending ? 'not-allowed' : 'pointer',
              }}
            >
              {sending ? 'Sending...' : 'Send Test'}
            </button>
          </div>

          {testResult && (
            <div style={{
              marginTop: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: testResult.status === 'sent'
                ? '#f0fdf4' : testResult.status === 'sending'
                ? '#fef9c3' : '#fef2f2',
              border: `1px solid ${testResult.status === 'sent'
                ? '#bbf7d0' : testResult.status === 'sending'
                ? '#fde68a' : '#fecaca'}`,
            }}>
              <p style={{
                fontSize: '13px',
                fontWeight: '500',
                color: testResult.status === 'sent' ? '#15803d'
                  : testResult.status === 'sending' ? '#92400e' : '#dc2626',
              }}>
                {testResult.status === 'sent' ? '✅ Message sent successfully'
                  : testResult.status === 'sending' ? '⏳ Sending...'
                  : '❌ Failed to send'}
              </p>
              {testResult.message && (
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                  {testResult.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message Stats */}
      <MessageStats />

      {/* Quick Links */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '20px 24px',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
          Quick links
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Message History', href: '/admin/whatsapp/history', desc: 'View all sent messages and delivery status' },
            { label: 'Manage Templates', href: '/admin/wa-templates', desc: 'Add and edit Hindi/English templates' },
            { label: 'View Campaigns', href: '/admin/campaigns', desc: 'See scheduled and sent campaigns' },
            { label: 'Schedule Campaign', href: '/admin/patients', desc: 'Select patients and schedule messages' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              textDecoration: 'none',
              border: '1px solid #e2e8f0',
            }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>{link.label}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>{link.desc}</p>
              </div>
              <span style={{ fontSize: '16px', color: '#94a3b8' }}>→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function MessageStats() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch('/api/whatsapp/history?limit=5')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
  }, [])

  if (!stats) return null

  const successRate = stats.sentCount + stats.failedCount > 0
    ? Math.round((stats.sentCount / (stats.sentCount + stats.failedCount)) * 100)
    : 0

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      padding: '20px 24px',
      marginBottom: '20px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
          Messaging Overview
        </h3>
        <a href="/admin/whatsapp/history" style={{
          fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: '500',
        }}>
          View all →
        </a>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px', marginBottom: '16px',
      }}>
        <div style={{
          backgroundColor: '#f8fafc', borderRadius: '8px', padding: '12px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{stats.total}</p>
          <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Total Sent</p>
        </div>
        <div style={{
          backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '12px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#16a34a' }}>{successRate}%</p>
          <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Success Rate</p>
        </div>
        <div style={{
          backgroundColor: '#fef2f2', borderRadius: '8px', padding: '12px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '22px', fontWeight: '700', color: '#dc2626' }}>{stats.failedCount}</p>
          <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Failed</p>
        </div>
      </div>

      {/* Recent Messages */}
      {stats.messages && stats.messages.length > 0 && (
        <div>
          <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', marginBottom: '8px' }}>
            RECENT MESSAGES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {stats.messages.map((m: any) => (
              <div key={m.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px',
                fontSize: '13px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: m.status === 'SENT' ? '#16a34a' : '#dc2626',
                    flexShrink: 0,
                  }} />
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>
                    {m.patientName || m.phone}
                  </span>
                  <span style={{ color: '#94a3b8' }}>
                    {m.templateName}
                  </span>
                </div>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                  {new Date(m.sentAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
