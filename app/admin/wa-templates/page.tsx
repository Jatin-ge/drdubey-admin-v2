'use client'
import { useState, useEffect } from 'react'

interface WaTemplate {
  id: string
  name: string
  nameHi: string | null
  category: string
  language: string
  bodyEn: string
  bodyHi: string
  variables: string[]
  metaName: string | null
  isApproved: boolean
  isActive: boolean
  createdAt: string
}

const EMPTY_FORM = {
  name: '',
  nameHi: '',
  category: 'UTILITY',
  language: 'hi',
  bodyEn: '',
  bodyHi: '',
  variables: '',
  metaName: '',
  isApproved: false,
}

export default function WaTemplatesPage() {
  const [templates, setTemplates] = useState<WaTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [previewLang, setPreviewLang] = useState<'hi' | 'en'>('hi')

  const fetchTemplates = () => {
    fetch('/api/wa-templates')
      .then(r => r.json())
      .then(data => {
        setTemplates(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchTemplates() }, [])

  const handleSave = async () => {
    if (!form.name || !form.bodyEn || !form.bodyHi) {
      alert('Name, English body, and Hindi body are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/wa-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          variables: form.variables
            ? form.variables.split(',').map(v => v.trim()).filter(Boolean)
            : [],
        })
      })
      if (res.ok) {
        setForm(EMPTY_FORM)
        setShowForm(false)
        fetchTemplates()
      }
    } catch (e) {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const previewBody = previewLang === 'hi' ? form.bodyHi : form.bodyEn

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
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
            WhatsApp Templates
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Manage Hindi/English message templates for campaigns
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Add Template'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '20px' }}>
            New Template
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Name (English) *
              </label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '7px',
                  border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box',
                }}
                placeholder="e.g. OPD Camp Announcement"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Name (Hindi)
              </label>
              <input
                value={form.nameHi}
                onChange={e => setForm(f => ({ ...f, nameHi: e.target.value }))}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '7px',
                  border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box',
                }}
                placeholder="e.g. OPD कैंप सूचना"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '7px',
                  border: '1px solid #e2e8f0', fontSize: '14px',
                }}
              >
                <option value="UTILITY">UTILITY</option>
                <option value="MARKETING">MARKETING</option>
                <option value="AUTHENTICATION">AUTHENTICATION</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Meta Template Name
              </label>
              <input
                value={form.metaName}
                onChange={e => setForm(f => ({ ...f, metaName: e.target.value }))}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '7px',
                  border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box',
                }}
                placeholder="e.g. opd_camp_hi"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Variables (comma separated)
              </label>
              <input
                value={form.variables}
                onChange={e => setForm(f => ({ ...f, variables: e.target.value }))}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '7px',
                  border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box',
                }}
                placeholder="e.g. patient_name, city, date"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.isApproved}
                  onChange={e => setForm(f => ({ ...f, isApproved: e.target.checked }))}
                />
                <span style={{ fontSize: '13px', color: '#374151' }}>Meta Approved</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Body (English) *
              </label>
              <textarea
                value={form.bodyEn}
                onChange={e => setForm(f => ({ ...f, bodyEn: e.target.value }))}
                rows={6}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '7px',
                  border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box',
                  fontFamily: 'inherit', resize: 'vertical',
                }}
                placeholder="Hello {{1}}, ..."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Body (Hindi) *
              </label>
              <textarea
                value={form.bodyHi}
                onChange={e => setForm(f => ({ ...f, bodyHi: e.target.value }))}
                rows={6}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '7px',
                  border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box',
                  fontFamily: 'inherit', resize: 'vertical',
                }}
                placeholder="नमस्ते {{1}}, ..."
              />
            </div>
          </div>

          {/* WhatsApp Preview */}
          {(form.bodyHi || form.bodyEn) && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>Preview:</span>
                <button
                  onClick={() => setPreviewLang('hi')}
                  style={{
                    padding: '4px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
                    backgroundColor: previewLang === 'hi' ? '#25D366' : '#f1f5f9',
                    color: previewLang === 'hi' ? 'white' : '#374151',
                    border: 'none',
                  }}
                >
                  Hindi
                </button>
                <button
                  onClick={() => setPreviewLang('en')}
                  style={{
                    padding: '4px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
                    backgroundColor: previewLang === 'en' ? '#25D366' : '#f1f5f9',
                    color: previewLang === 'en' ? 'white' : '#374151',
                    border: 'none',
                  }}
                >
                  English
                </button>
              </div>
              <div style={{
                backgroundColor: '#e5ddd5',
                borderRadius: '12px',
                padding: '20px',
                maxWidth: '340px',
              }}>
                <div style={{
                  backgroundColor: '#dcf8c6',
                  borderRadius: '8px 8px 2px 8px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: '#1a1a1a',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                }}>
                  {previewBody || '(enter body text)'}
                </div>
                <div style={{ textAlign: 'right', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#666' }}>✓✓ 12:00 PM</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '7px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
            <button
              onClick={() => { setForm(EMPTY_FORM); setShowForm(false) }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#374151',
                border: '1px solid #e2e8f0',
                borderRadius: '7px',
                padding: '10px 24px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Templates Table */}
      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading templates...</p>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 3fr',
            backgroundColor: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
            padding: '10px 16px',
          }}>
            {['Name', 'Category', 'Language', 'Status', 'Body Preview'].map(h => (
              <span key={h} style={{
                fontSize: '11px', fontWeight: '600', color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {h}
              </span>
            ))}
          </div>

          {templates.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No templates yet. Add your first template above.
            </p>
          ) : templates.map((t, i) => (
            <div key={t.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 3fr',
              padding: '12px 16px',
              borderBottom: i < templates.length - 1 ? '1px solid #f1f5f9' : 'none',
              alignItems: 'center',
              backgroundColor: i % 2 === 0 ? 'white' : '#fafafa',
            }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>{t.name}</p>
                {t.nameHi && (
                  <p style={{ fontSize: '11px', color: '#64748b' }}>{t.nameHi}</p>
                )}
              </div>
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '99px', fontWeight: '500',
                backgroundColor: t.category === 'MARKETING' ? '#fef9c3' : '#f0f9ff',
                color: t.category === 'MARKETING' ? '#92400e' : '#0369a1',
              }}>
                {t.category}
              </span>
              <span style={{ fontSize: '12px', color: '#374151' }}>
                {t.language === 'hi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
              </span>
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '99px', fontWeight: '500',
                backgroundColor: t.isApproved ? '#f0fdf4' : '#fef2f2',
                color: t.isApproved ? '#15803d' : '#dc2626',
              }}>
                {t.isApproved ? '✓ Approved' : '⏳ Pending'}
              </span>
              <p style={{
                fontSize: '12px', color: '#64748b',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {t.bodyHi?.slice(0, 80)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
