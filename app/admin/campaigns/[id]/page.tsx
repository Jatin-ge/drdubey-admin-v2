'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface CampaignLog {
  id: string
  patientName: string
  phone: string
  status: string
  error: string | null
  sentAt: string | null
}

interface Campaign {
  id: string
  name: string
  templateId: string
  language: string
  city: string | null
  patientCount: number
  status: string
  scheduledAt: string
  sentAt: string | null
  sentCount: number
  failedCount: number
  logs: CampaignLog[]
}

export default function CampaignDetailPage() {
  const params = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [logFilter, setLogFilter] = useState<'all' | 'SENT' | 'FAILED'>('all')

  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    const load = () => {
      fetch(`/api/campaigns/${params.id}`)
        .then(r => r.json())
        .then(d => {
          if (cancelled) return
          setCampaign(d)
          setLoading(false)
          if (d?.status !== 'SENDING' && intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
        })
        .catch(() => { if (!cancelled) setLoading(false) })
    }

    load()
    intervalId = setInterval(load, 5000)

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }, [params.id])

  if (loading) {
    return <div style={{ padding: '24px', color: '#94a3b8' }}>Loading campaign...</div>
  }

  if (!campaign) {
    return <div style={{ padding: '24px', color: '#dc2626' }}>Campaign not found</div>
  }

  const filteredLogs = logFilter === 'all'
    ? campaign.logs
    : campaign.logs.filter(l => l.status === logFilter)

  const successRate = campaign.sentCount + campaign.failedCount > 0
    ? Math.round((campaign.sentCount / (campaign.sentCount + campaign.failedCount)) * 100)
    : 0

  const statusColors: Record<string, { bg: string; color: string }> = {
    SCHEDULED: { bg: '#eff6ff', color: '#2563eb' },
    SENDING: { bg: '#fffbeb', color: '#d97706' },
    SENT: { bg: '#f0fdf4', color: '#16a34a' },
    FAILED: { bg: '#fef2f2', color: '#dc2626' },
  }

  const sc = statusColors[campaign.status] || statusColors.SENT

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0',
      }}>
        <div>
          <Link href="/admin/campaigns" style={{
            fontSize: '13px', color: '#2563eb', textDecoration: 'none', marginBottom: '8px',
            display: 'inline-block',
          }}>
            ← All Campaigns
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
            {campaign.name || 'Campaign'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {campaign.city || 'All cities'} · {campaign.language === 'hi' ? 'Hindi' : 'English'}
          </p>
        </div>
        <span style={{
          padding: '6px 14px', borderRadius: '99px', fontSize: '13px',
          fontWeight: '600', backgroundColor: sc.bg, color: sc.color,
        }}>
          {campaign.status}
        </span>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '24px',
      }}>
        {[
          { label: 'Total Patients', value: campaign.patientCount, color: '#2563eb' },
          { label: 'Sent', value: campaign.sentCount, color: '#16a34a' },
          { label: 'Failed', value: campaign.failedCount, color: '#dc2626' },
          { label: 'Success Rate', value: `${successRate}%`, color: '#9333ea' },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0',
            padding: '16px', borderLeft: `4px solid ${s.color}`,
          }}>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{s.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Timing */}
      <div style={{
        display: 'flex', gap: '24px', marginBottom: '24px', fontSize: '13px', color: '#64748b',
      }}>
        <span>Scheduled: {new Date(campaign.scheduledAt).toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })}</span>
        {campaign.sentAt && (
          <span>Completed: {new Date(campaign.sentAt).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}</span>
        )}
      </div>

      {/* Log Filters */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { key: 'all' as const, label: `All (${campaign.logs.length})` },
            { key: 'SENT' as const, label: `Sent (${campaign.sentCount})` },
            { key: 'FAILED' as const, label: `Failed (${campaign.failedCount})` },
          ].map(f => (
            <button key={f.key} onClick={() => setLogFilter(f.key)}
              style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '13px',
                fontWeight: logFilter === f.key ? '600' : '400', cursor: 'pointer',
                border: `1px solid ${logFilter === f.key ? '#2563eb' : '#e2e8f0'}`,
                backgroundColor: logFilter === f.key ? '#eff6ff' : 'white',
                color: logFilter === f.key ? '#2563eb' : '#64748b',
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          {filteredLogs.length} recipients
        </span>
      </div>

      {/* Log Table */}
      {filteredLogs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '40px', backgroundColor: 'white',
          borderRadius: '10px', border: '1px solid #e2e8f0',
        }}>
          <p style={{ color: '#94a3b8' }}>
            {campaign.status === 'SCHEDULED' ? 'Campaign has not been sent yet' : 'No results to show'}
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['#', 'Patient', 'Phone', 'Status', 'Sent At', 'Error'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left', fontSize: '11px',
                    fontWeight: '600', color: '#64748b', textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, i) => (
                <tr key={log.id} style={{
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: i % 2 === 0 ? 'white' : '#fafafa',
                }}>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: '#94a3b8' }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                    {log.patientName || '—'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: '#64748b' }}>
                    {log.phone}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '600', padding: '2px 10px',
                      borderRadius: '99px',
                      backgroundColor: log.status === 'SENT' ? '#f0fdf4' : '#fef2f2',
                      color: log.status === 'SENT' ? '#16a34a' : '#dc2626',
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: '#94a3b8' }}>
                    {log.sentAt ? new Date(log.sentAt).toLocaleString('en-IN', {
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    }) : '—'}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '12px', color: '#dc2626', maxWidth: '200px' }}>
                    {log.error || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
