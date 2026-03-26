'use client'
import { useState, useEffect } from 'react'

interface ReferralDoctor {
  id: string
  name: string
  phone: string | null
  specialty: string | null
  hospital: string | null
  city: string | null
  email: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  _count: { leads: number }
}

export default function ReferralsPage() {
  const [doctors, setDoctors] = useState<ReferralDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', specialty: '', hospital: '',
    city: '', email: '', notes: '',
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = () => {
    setLoading(true)
    fetch('/api/referral-doctors')
      .then(r => r.json())
      .then(data => {
        setDoctors(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const resetForm = () => {
    setForm({ name: '', phone: '', specialty: '', hospital: '', city: '', email: '', notes: '' })
    setShowForm(false)
    setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/referral-doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setMessage('Referral doctor added successfully')
        resetForm()
        fetchDoctors()
      } else {
        const err = await res.json()
        setMessage(`Error: ${err.error || 'Failed to save'}`)
      }
    } catch {
      setMessage('Failed to save')
    }
    setSaving(false)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '24px',
        paddingBottom: '20px', borderBottom: '1px solid #e2e8f0',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
            Referral Doctors
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Track your referral network
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          style={{
            backgroundColor: '#2563eb', color: 'white',
            padding: '10px 20px', borderRadius: '8px',
            border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: '500',
          }}
        >
          + Add Doctor
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
          backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
          color: message.includes('Error') ? '#dc2626' : '#16a34a',
          border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}`,
          fontSize: '14px',
        }}>
          {message}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div style={{
          backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: '10px', padding: '24px', marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            Add Referral Doctor
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[
                { label: 'Doctor Name *', key: 'name', required: true },
                { label: 'Phone', key: 'phone' },
                { label: 'Specialty', key: 'specialty', placeholder: 'e.g. Orthopaedics' },
                { label: 'Hospital', key: 'hospital' },
                { label: 'City', key: 'city' },
                { label: 'Email', key: 'email', type: 'email' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    required={field.required}
                    placeholder={field.placeholder || ''}
                    value={(form as any)[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '6px',
                      border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '6px',
                  border: '1px solid #d1d5db', fontSize: '14px',
                  boxSizing: 'border-box', resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={saving} style={{
                backgroundColor: '#2563eb', color: 'white',
                padding: '10px 24px', borderRadius: '8px',
                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '500', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Saving...' : 'Save Doctor'}
              </button>
              <button type="button" onClick={resetForm} style={{
                backgroundColor: 'white', color: '#374151',
                padding: '10px 24px', borderRadius: '8px',
                border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '14px',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : doctors.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          backgroundColor: 'white', borderRadius: '10px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{
            width: '56px', height: '56px', backgroundColor: '#f1f5f9',
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8',
            fontSize: '24px',
          }}>
            +
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            No referral doctors yet
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '300px', margin: '0 auto' }}>
            Add referring doctors to track which patients come from each referral source.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Doctor Name', 'Specialty', 'Hospital', 'City', 'Phone', 'Patients', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '12px', fontWeight: '600', color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doctors.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                    {d.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                    {d.specialty || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                    {d.hospital || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                    {d.city || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                    {d.phone ? (
                      <a href={`tel:${d.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        {d.phone}
                      </a>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '600',
                      padding: '2px 10px', borderRadius: '99px',
                      backgroundColor: d._count.leads > 0 ? '#eff6ff' : '#f1f5f9',
                      color: d._count.leads > 0 ? '#2563eb' : '#94a3b8',
                    }}>
                      {d._count.leads}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '500',
                      color: d.isActive ? '#16a34a' : '#94a3b8',
                    }}>
                      {d.isActive ? 'Active' : 'Inactive'}
                    </span>
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
