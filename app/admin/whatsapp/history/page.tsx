'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Message {
  id: string
  phone: string
  templateName: string | null
  language: string | null
  status: string
  messageId: string | null
  errorMsg: string | null
  source: string | null
  sentAt: string
  patientName: string | null
}

interface HistoryData {
  messages: Message[]
  total: number
  sentCount: number
  failedCount: number
  page: number
  totalPages: number
}

export default function MessageHistoryPage() {
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('status', filter)
    if (search) params.set('search', search)
    params.set('page', String(page))

    fetch(`/api/whatsapp/history?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter, search, page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const formatPhone = (phone: string) => {
    if (phone.length === 12 && phone.startsWith('91')) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 7)} ${phone.slice(7)}`
    }
    return phone
  }

  const formatDate = (d: string) => {
    return new Date(d).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const sourceLabel: Record<string, string> = {
    individual: 'Patient Profile',
    bulk: 'Bulk Send',
    campaign: 'Campaign',
    'template-send': 'Template Send',
    test: 'Test',
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
            Message History
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            All WhatsApp messages sent from the admin panel
          </p>
        </div>
        <Link href="/admin/whatsapp" style={{
          padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
          backgroundColor: 'white', textDecoration: 'none', color: '#374151',
          fontSize: '13px', fontWeight: '500',
        }}>
          ← WhatsApp Dashboard
        </Link>
      </div>

      {/* Stats */}
      {data && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px', marginBottom: '20px',
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0',
            padding: '16px', borderLeft: '4px solid #2563eb',
          }}>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Total Messages</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{data.total}</p>
          </div>
          <div style={{
            backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0',
            padding: '16px', borderLeft: '4px solid #16a34a',
          }}>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Sent Successfully</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>{data.sentCount}</p>
          </div>
          <div style={{
            backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0',
            padding: '16px', borderLeft: '4px solid #dc2626',
          }}>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Failed</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{data.failedCount}</p>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '16px', gap: '12px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'SENT', label: 'Sent' },
            { key: 'FAILED', label: 'Failed' },
          ].map(f => (
            <button key={f.key} onClick={() => { setFilter(f.key); setPage(1) }}
              style={{
                padding: '7px 16px', borderRadius: '6px', fontSize: '13px',
                fontWeight: filter === f.key ? '600' : '400', cursor: 'pointer',
                border: `1px solid ${filter === f.key ? '#2563eb' : '#e2e8f0'}`,
                backgroundColor: filter === f.key ? '#eff6ff' : 'white',
                color: filter === f.key ? '#2563eb' : '#64748b',
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input
            placeholder="Search by phone or template..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: '6px', border: '1px solid #e2e8f0',
              fontSize: '13px', width: '220px',
            }}
          />
          <button type="submit" style={{
            padding: '7px 14px', borderRadius: '6px', backgroundColor: '#2563eb',
            color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px',
          }}>
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : !data || data.messages.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px', backgroundColor: 'white',
          borderRadius: '10px', border: '1px solid #e2e8f0',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>
            {search ? 'No messages match your search' : 'No messages sent yet. Messages will appear here once you send your first WhatsApp message.'}
          </p>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Date', 'Recipient', 'Template', 'Source', 'Status', 'Details'].map(h => (
                    <th key={h} style={{
                      padding: '11px 14px', textAlign: 'left', fontSize: '11px',
                      fontWeight: '600', color: '#64748b', textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.messages.map((m, i) => (
                  <tr key={m.id} style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: i % 2 === 0 ? 'white' : '#fafafa',
                  }}>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {formatDate(m.sentAt)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b', marginBottom: '1px' }}>
                        {m.patientName || 'Unknown'}
                      </p>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>{formatPhone(m.phone)}</p>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#475569' }}>
                      {m.templateName || '—'}
                      {m.language && (
                        <span style={{
                          marginLeft: '6px', fontSize: '10px', padding: '1px 6px',
                          borderRadius: '99px', backgroundColor: '#f1f5f9', color: '#94a3b8',
                        }}>
                          {m.language}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
                        backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: '500',
                      }}>
                        {sourceLabel[m.source || ''] || m.source || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: '600', padding: '3px 10px',
                        borderRadius: '99px',
                        backgroundColor: m.status === 'SENT' ? '#f0fdf4' : '#fef2f2',
                        color: m.status === 'SENT' ? '#16a34a' : '#dc2626',
                      }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '12px', color: '#94a3b8', maxWidth: '200px' }}>
                      {m.status === 'SENT' ? (
                        <span title={m.messageId || ''} style={{ cursor: 'default' }}>
                          ID: {m.messageId?.slice(0, 16)}...
                        </span>
                      ) : (
                        <span style={{ color: '#dc2626' }} title={m.errorMsg || ''}>
                          {m.errorMsg?.slice(0, 50) || 'Unknown error'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: '8px', marginTop: '16px',
            }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e8f0',
                  backgroundColor: 'white', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '13px', opacity: page <= 1 ? 0.5 : 1,
                }}>
                Previous
              </button>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Page {data.page} of {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e8f0',
                  backgroundColor: 'white', cursor: page >= data.totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '13px', opacity: page >= data.totalPages ? 0.5 : 1,
                }}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
