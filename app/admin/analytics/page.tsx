'use client'
import { useState, useEffect } from 'react'

interface AnalyticsData {
  totalPatients: number
  thisMonthPatients: number
  last90DaysPatients: number
  ipdCount: number
  opdCount: number
  maleCount: number
  femaleCount: number
  topCities: { city: string; count: number }[]
  topSurgeries: { surgery: string; count: number }[]
  trend: { month: string; count: number }[]
  totalBlogs: number
  totalAchievements: number
  totalEvents: number
  totalContacts: number
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '100px', backgroundColor: '#f1f5f9', borderRadius: '10px' }} />
          ))}
        </div>
        <div style={{ height: '300px', backgroundColor: '#f1f5f9', borderRadius: '10px' }} />
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
        Failed to load analytics data
      </div>
    )
  }

  const maxTrend = Math.max(...data.trend.map(t => t.count), 1)
  const maxCity = Math.max(...data.topCities.map(c => c.count), 1)
  const maxSurgery = Math.max(...data.topSurgeries.map(s => s.count), 1)

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px', paddingBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
          Analytics
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Patient data insights and trends
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        {[
          { label: 'Total Patients', value: data.totalPatients.toLocaleString(), color: '#2563eb', bg: '#eff6ff' },
          { label: 'This Month', value: data.thisMonthPatients.toLocaleString(), color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Last 90 Days', value: data.last90DaysPatients.toLocaleString(), color: '#9333ea', bg: '#faf5ff' },
          { label: 'IPD Patients', value: data.ipdCount.toLocaleString(), color: '#0891b2', bg: '#ecfeff' },
          { label: 'OPD Patients', value: data.opdCount.toLocaleString(), color: '#d97706', bg: '#fffbeb' },
          { label: 'Contact Enquiries', value: data.totalContacts.toString(), color: '#dc2626', bg: '#fef2f2' },
        ].map(card => (
          <div key={card.label} style={{
            backgroundColor: 'white', borderRadius: '10px',
            border: '1px solid #e2e8f0', borderLeft: `4px solid ${card.color}`,
            padding: '16px 18px',
          }}>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '6px' }}>
              {card.label}
            </p>
            <p style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a', lineHeight: 1 }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Gender Split */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '24px', marginBottom: '32px',
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '10px',
          border: '1px solid #e2e8f0', padding: '20px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            Gender Distribution
          </h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                height: '12px', borderRadius: '99px', backgroundColor: '#e2e8f0',
                overflow: 'hidden', marginBottom: '12px',
              }}>
                <div style={{
                  height: '100%', borderRadius: '99px', backgroundColor: '#2563eb',
                  width: `${(data.maleCount / (data.maleCount + data.femaleCount || 1)) * 100}%`,
                  transition: 'width 0.5s',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '500' }}>
                  Male: {data.maleCount.toLocaleString()}
                </span>
                <span style={{ fontSize: '13px', color: '#ec4899', fontWeight: '500' }}>
                  Female: {data.femaleCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white', borderRadius: '10px',
          border: '1px solid #e2e8f0', padding: '20px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            Patient Status
          </h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                height: '12px', borderRadius: '99px', backgroundColor: '#e2e8f0',
                overflow: 'hidden', marginBottom: '12px',
              }}>
                <div style={{
                  height: '100%', borderRadius: '99px', backgroundColor: '#16a34a',
                  width: `${(data.ipdCount / (data.ipdCount + data.opdCount || 1)) * 100}%`,
                  transition: 'width 0.5s',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '500' }}>
                  IPD: {data.ipdCount.toLocaleString()}
                </span>
                <span style={{ fontSize: '13px', color: '#d97706', fontWeight: '500' }}>
                  OPD: {data.opdCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div style={{
        backgroundColor: 'white', borderRadius: '10px',
        border: '1px solid #e2e8f0', padding: '20px', marginBottom: '32px',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>
          Monthly Patient Trend (Last 12 Months)
        </h3>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '6px', height: '200px',
          paddingBottom: '28px', position: 'relative',
        }}>
          {data.trend.map(t => {
            const height = (t.count / maxTrend) * 170
            const [year, month] = t.month.split('-')
            return (
              <div key={t.month} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '4px',
              }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                  {t.count}
                </span>
                <div style={{
                  width: '100%', maxWidth: '40px',
                  height: `${Math.max(height, 4)}px`,
                  backgroundColor: '#2563eb',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s',
                }} />
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                  {MONTH_NAMES[month]} {year.slice(2)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two Column: Cities + Surgeries */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '24px', marginBottom: '32px',
      }}>
        {/* Top Cities */}
        <div style={{
          backgroundColor: 'white', borderRadius: '10px',
          border: '1px solid #e2e8f0', padding: '20px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            Top 15 Cities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.topCities.map((c, i) => (
              <div key={c.city} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px', color: '#94a3b8', fontWeight: '500',
                  minWidth: '18px', textAlign: 'right',
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: '3px',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                      {c.city}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {c.count.toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    height: '6px', borderRadius: '99px',
                    backgroundColor: '#f1f5f9', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '99px',
                      backgroundColor: '#2563eb',
                      width: `${(c.count / maxCity) * 100}%`,
                      transition: 'width 0.4s',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Surgeries */}
        <div style={{
          backgroundColor: 'white', borderRadius: '10px',
          border: '1px solid #e2e8f0', padding: '20px',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            Surgery Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.topSurgeries.map((s, i) => (
              <div key={s.surgery} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px', color: '#94a3b8', fontWeight: '500',
                  minWidth: '18px', textAlign: 'right',
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: '3px',
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                      {s.surgery}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {s.count.toLocaleString()}
                    </span>
                  </div>
                  <div style={{
                    height: '6px', borderRadius: '99px',
                    backgroundColor: '#f1f5f9', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '99px',
                      backgroundColor: '#16a34a',
                      width: `${(s.count / maxSurgery) * 100}%`,
                      transition: 'width 0.4s',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div style={{
        backgroundColor: 'white', borderRadius: '10px',
        border: '1px solid #e2e8f0', padding: '20px',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
          Website Content
        </h3>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'Blog Posts', value: data.totalBlogs, color: '#9333ea' },
            { label: 'Achievements', value: data.totalAchievements, color: '#d97706' },
            { label: 'Events', value: data.totalEvents, color: '#0891b2' },
            { label: 'Contact Enquiries', value: data.totalContacts, color: '#dc2626' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: item.color,
              }} />
              <span style={{ fontSize: '14px', color: '#64748b' }}>{item.label}:</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
