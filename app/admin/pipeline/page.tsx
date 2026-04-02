'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STAGE_COLORS: Record<string, string> = {
  'Enquiry': '#6366f1',
  'Consultation Scheduled': '#f59e0b',
  'Consultation Done': '#3b82f6',
  'Surgery Scheduled': '#8b5cf6',
  'Surgery Done': '#10b981',
  'Recovery': '#06b6d4',
  'Follow-Up Complete': '#84cc16',
  'Discharged': '#64748b',
}

interface Patient {
  id: string
  name: string
  phone: string
  cities: string
  surgery: string
  pipelineStage: string
}

export default function PipelinePage() {
  const router = useRouter()
  const [data, setData] = useState<{
    stages: string[]
    grouped: Record<string, Patient[]>
  }>({ stages: [], grouped: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pipeline')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const movePatient = async (patientId: string, newStage: string) => {
    await fetch(`/api/patients/${patientId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    })
    const res = await fetch('/api/pipeline')
    const d = await res.json()
    setData(d)
  }

  const totalPatients = Object.values(data.grouped)
    .reduce((acc, arr) => acc + arr.length, 0)

  return (
    <div style={{ padding: '24px' }}>
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
            Patient Pipeline
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {totalPatients} patients tracked across {data.stages.length} stages
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/patients')}
          style={{
            padding: '9px 18px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: 'white',
            fontSize: '13px',
            cursor: 'pointer',
            color: '#374151',
          }}
        >
          ← Back to Patients
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
          Loading pipeline...
        </p>
      ) : (
        <div style={{
          display: 'flex',
          gap: '14px',
          overflowX: 'auto',
          paddingBottom: '16px',
          alignItems: 'flex-start',
        }}>
          {data.stages.map(stage => {
            const patients = data.grouped[stage] || []
            const color = STAGE_COLORS[stage] || '#64748b'
            return (
              <div key={stage} style={{
                minWidth: '220px',
                maxWidth: '220px',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                borderTop: `3px solid ${color}`,
                flexShrink: 0,
              }}>
                <div style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                    {stage}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    backgroundColor: color + '22',
                    color: color,
                    padding: '1px 7px',
                    borderRadius: '99px',
                    fontWeight: '600',
                  }}>
                    {patients.length}
                  </span>
                </div>
                <div style={{
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                }}>
                  {patients.length === 0 ? (
                    <p style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      textAlign: 'center',
                      padding: '20px 8px',
                    }}>
                      No patients
                    </p>
                  ) : patients.map(p => (
                    <div
                      key={p.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        padding: '10px 12px',
                        cursor: 'pointer',
                      }}
                      onClick={() => router.push(`/admin/patients/${p.id}`)}
                    >
                      <p style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#1e293b',
                        marginBottom: '4px',
                      }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                        {p.phone}{p.cities ? ` · ${p.cities}` : ''}
                      </p>
                      {p.surgery && (
                        <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>
                          {p.surgery}
                        </p>
                      )}
                      <select
                        onClick={e => e.stopPropagation()}
                        onChange={e => movePatient(p.id, e.target.value)}
                        value={p.pipelineStage}
                        style={{
                          width: '100%',
                          fontSize: '11px',
                          padding: '3px 6px',
                          borderRadius: '5px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          color: '#374151',
                          cursor: 'pointer',
                        }}
                      >
                        {data.stages.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
