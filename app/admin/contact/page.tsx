'use client'
import { useState, useEffect } from 'react'

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  message: string
  createdAt: string
}

export default function ContactPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/contact')
      .then(r => r.json())
      .then(data => {
        setContacts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
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
            Contact Forms
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Patient enquiries from the website
          </p>
        </div>
        <span style={{
          fontSize: '13px', color: '#64748b',
          backgroundColor: '#f1f5f9',
          padding: '4px 12px', borderRadius: '99px',
        }}>
          {contacts.length} submissions
        </span>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
          Loading...
        </p>
      ) : contacts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>
            No contact submissions yet
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contacts.map(c => (
            <div key={c.id} style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px',
              }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '15px', color: '#1e293b', marginBottom: '2px' }}>
                    {c.name}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <a href={`mailto:${c.email}`}
                      style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>
                      {c.email}
                    </a>
                    {c.phone && (
                      <>
                        <span style={{ color: '#cbd5e1' }}>|</span>
                        <a href={`tel:${c.phone}`}
                          style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>
                          {c.phone}
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })
                    : 'Unknown date'}
                </span>
              </div>
              <p style={{
                fontSize: '14px', color: '#475569', lineHeight: '1.6',
                backgroundColor: '#f8fafc', padding: '10px 14px',
                borderRadius: '6px', margin: 0,
              }}>
                {c.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
