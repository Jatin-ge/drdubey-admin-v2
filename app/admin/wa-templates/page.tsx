'use client'
import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface WATemplate {
  id: string
  name: string
  nameHi?: string
  category: string
  language: string
  bodyEn: string
  bodyHi: string
  metaName?: string
  isApproved: boolean
  isActive: boolean
  metaStatus?: string
  metaError?: string
  metaSubmittedAt?: string
  source?: 'new' | 'legacy'
}

interface LegacyTemplate {
  id: string
  name: string
  displayName?: string
  bodyContent?: string
  content?: string
  body?: string
  language?: string
  category?: string
}

const CATEGORIES = [
  'MARKETING',
  'UTILITY',
  'AUTHENTICATION',
]

function WhatsAppBubble({ text }: { text: string }) {
  if (!text) return (
    <div style={{
      backgroundColor: '#f0f0f0',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '13px',
    }}>
      Preview will appear here as you type
    </div>
  )

  return (
    <div style={{
      backgroundColor: '#e5ddd5',
      borderRadius: '12px',
      padding: '16px',
      minHeight: '120px',
    }}>
      <div style={{
        maxWidth: '85%',
        backgroundColor: '#dcf8c6',
        borderRadius: '0 8px 8px 8px',
        padding: '10px 14px',
        position: 'relative',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}>
        <p style={{
          fontSize: '13.5px',
          color: '#111b21',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
          margin: 0,
          fontFamily: '-apple-system, sans-serif',
        }}>
          {text
            .replace('{{1}}', 'रमेश कुमार')
            .replace('{{2}}', 'बीकानेर')
            .replace('{{3}}', '15 अप्रैल 2026')
            .replace('{{4}}', 'सिटी हॉल, बीकानेर')
            .replace('{{5}}', 'सुबह 10 बजे')
          }
        </p>
        <p style={{
          fontSize: '11px',
          color: '#667781',
          textAlign: 'right',
          margin: '4px 0 0',
        }}>
          9:41 AM ✓✓
        </p>
      </div>
    </div>
  )
}

function TemplateCard({
  template,
  language,
  onEdit,
  onDelete,
  onSubmitToMeta,
}: {
  template: WATemplate
  language: 'hi' | 'en'
  onEdit: (t: WATemplate) => void
  onDelete: (id: string) => void
  onSubmitToMeta: (id: string) => void
}) {
  const body = language === 'hi'
    ? template.bodyHi
    : template.bodyEn
  const preview = body?.slice(0, 100) +
    (body?.length > 100 ? '...' : '')

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '6px',
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1e293b',
          }}>
            {language === 'hi' && template.nameHi
              ? template.nameHi
              : template.name}
          </span>
          <span style={{
            fontSize: '10px',
            padding: '2px 8px',
            borderRadius: '99px',
            backgroundColor:
              template.category === 'MARKETING'
                ? '#faf5ff' : '#eff6ff',
            color:
              template.category === 'MARKETING'
                ? '#7c3aed' : '#1d4ed8',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}>
            {template.category}
          </span>
          {(() => {
            const s = template.metaStatus || 'DRAFT'
            const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
              DRAFT: { bg: '#f1f5f9', color: '#64748b', label: 'Draft' },
              PENDING: { bg: '#fef9c3', color: '#92400e', label: 'Under Review' },
              APPROVED: { bg: '#f0fdf4', color: '#15803d', label: 'Approved' },
              REJECTED: { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
            }
            const cfg = statusConfig[s] || statusConfig.DRAFT
            return (
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '99px',
                backgroundColor: cfg.bg,
                color: cfg.color,
                fontWeight: '500',
              }}>
                {s === 'APPROVED' ? '✓ ' : s === 'REJECTED' ? '✗ ' : s === 'PENDING' ? '⏳ ' : ''}{cfg.label}
              </span>
            )
          })()}
          {template.source === 'legacy' && (
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              borderRadius: '99px',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              fontWeight: '500',
            }}>
              Legacy
            </span>
          )}
        </div>
        <p style={{
          fontSize: '13px',
          color: '#64748b',
          lineHeight: 1.5,
          margin: 0,
          fontFamily: language === 'hi'
            ? 'sans-serif' : 'inherit',
        }}>
          {preview || 'No content'}
        </p>
        {template.metaName && (
          <p style={{
            fontSize: '11px',
            color: '#94a3b8',
            marginTop: '6px',
            fontFamily: 'monospace',
          }}>
            {template.metaName}
          </p>
        )}
        {template.metaStatus === 'REJECTED' && template.metaError && (
          <p style={{
            fontSize: '11px',
            color: '#dc2626',
            marginTop: '4px',
            backgroundColor: '#fef2f2',
            padding: '4px 8px',
            borderRadius: '4px',
          }}>
            Error: {template.metaError}
          </p>
        )}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flexShrink: 0,
      }}>
        {template.source !== 'legacy' && (!template.metaStatus || template.metaStatus === 'DRAFT' || template.metaStatus === 'REJECTED') && (
          <button
            onClick={() => onSubmitToMeta(template.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563eb',
              fontSize: '12px',
              cursor: 'pointer',
              color: 'white',
              fontWeight: '600',
            }}
          >
            Submit to Meta
          </button>
        )}
        <button
          onClick={() => onEdit(template)}
          disabled={template.source === 'legacy'}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: template.source === 'legacy' ? '#f8fafc' : 'white',
            fontSize: '12px',
            cursor: template.source === 'legacy' ? 'not-allowed' : 'pointer',
            color: template.source === 'legacy' ? '#94a3b8' : '#374151',
            fontWeight: '500',
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(template.id)}
          disabled={template.source === 'legacy'}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: template.source === 'legacy' ? '1px solid #e2e8f0' : '1px solid #fecaca',
            backgroundColor: template.source === 'legacy' ? '#f8fafc' : '#fef2f2',
            fontSize: '12px',
            cursor: template.source === 'legacy' ? 'not-allowed' : 'pointer',
            color: template.source === 'legacy' ? '#94a3b8' : '#dc2626',
            fontWeight: '500',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

function TemplateForm({
  language,
  initial,
  onSave,
  onCancel,
}: {
  language: 'hi' | 'en'
  initial?: WATemplate | null
  onSave: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(
    initial?.name || ''
  )
  const [nameHi, setNameHi] = useState(
    initial?.nameHi || ''
  )
  const [category, setCategory] = useState(
    initial?.category || 'UTILITY'
  )
  const [bodyHi, setBodyHi] = useState(
    initial?.bodyHi || ''
  )
  const [bodyEn, setBodyEn] = useState(
    initial?.bodyEn || ''
  )
  const [metaName, setMetaName] = useState(
    initial?.metaName || ''
  )
  const [isApproved, setIsApproved] = useState(
    initial?.isApproved || false
  )
  const [saving, setSaving] = useState(false)

  const previewText = language === 'hi'
    ? bodyHi : bodyEn

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      name,
      nameHi,
      category,
      language,
      bodyHi,
      bodyEn,
      metaName,
      isApproved,
      isActive: true,
    })
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e2e8f0',
    fontSize: '14px',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: language === 'hi' ? 'sans-serif' : 'inherit',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '2px solid #2563eb',
      padding: '24px',
      marginBottom: '20px',
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: '20px',
      }}>
        {initial ? 'Edit template' : `New ${language === 'hi' ? 'Hindi 🇮🇳' : 'English 🇬🇧'} template`}
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
      }}>
        {/* Left column — form fields */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div>
            <label style={labelStyle}>
              Template name (English)
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. OPD Camp Announcement"
              style={inputStyle}
            />
          </div>

          {language === 'hi' && (
            <div>
              <label style={labelStyle}>
                Template name (Hindi)
              </label>
              <input
                value={nameHi}
                onChange={e => setNameHi(e.target.value)}
                placeholder="e.g. OPD कैंप सूचना"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                ...inputStyle,
                cursor: 'pointer',
              }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Meta template name{' '}
              <span style={{
                color: '#94a3b8',
                fontWeight: '400',
                textTransform: 'none',
                letterSpacing: '0',
                marginLeft: '6px',
              }}>
                (API name submitted to Meta)
              </span>
            </label>
            <input
              value={metaName}
              onChange={e => setMetaName(e.target.value)}
              placeholder="e.g. opd_camp_hi"
              style={{
                ...inputStyle,
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>
              {language === 'hi'
                ? 'Message body (Hindi 🇮🇳)'
                : 'Message body (English 🇬🇧)'}
            </label>
            <textarea
              value={language === 'hi' ? bodyHi : bodyEn}
              onChange={e => {
                if (language === 'hi') {
                  setBodyHi(e.target.value)
                } else {
                  setBodyEn(e.target.value)
                }
              }}
              placeholder={language === 'hi'
                ? 'नमस्ते {{1}}, ...'
                : 'Hello {{1}}, ...'}
              rows={7}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.6,
              }}
            />
            <p style={{
              fontSize: '11px',
              color: '#94a3b8',
              marginTop: '4px',
            }}>
              Use {'{{1}}'} {'{{2}}'} {'{{3}}'} for dynamic variables
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <input
              type="checkbox"
              id="approved"
              checked={isApproved}
              onChange={e => setIsApproved(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="approved" style={{
              fontSize: '13px',
              color: '#374151',
              cursor: 'pointer',
            }}>
              Mark as approved by Meta
            </label>
          </div>
        </div>

        {/* Right column — preview */}
        <div>
          <label style={labelStyle}>
            Live preview
          </label>
          <WhatsAppBubble text={previewText} />
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}>
            <p style={{
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: 1.6,
            }}>
              Variables filled with sample values:{' '}
              {`{{1}}`} → रमेश कुमार,{' '}
              {`{{2}}`} → बीकानेर,{' '}
              {`{{3}}`} → 15 अप्रैल 2026
            </p>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #e2e8f0',
      }}>
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          style={{
            padding: '10px 28px',
            backgroundColor: saving ? '#93c5fd' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save template'}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function WATemplatesPage() {
  const [language, setLanguage] = useState<'hi' | 'en'>('hi')
  const [templates, setTemplates] = useState<WATemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] =
    useState<WATemplate | null>(null)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const [newRes, legacyRes] = await Promise.all([
        fetch('/api/wa-templates'),
        fetch('/api/templates'),
      ])
      const newTemplates = await newRes.json()
      let legacyTemplates: WATemplate[] = []

      if (legacyRes.ok) {
        const legacy = await legacyRes.json()
        legacyTemplates = (
          Array.isArray(legacy) ? legacy : []
        ).map((t: LegacyTemplate) => ({
          id: t.id,
          name: t.name || 'Unnamed',
          nameHi: undefined,
          category: t.category || 'UTILITY',
          language: t.language || 'hi',
          bodyHi: t.bodyContent || t.content || t.body || '',
          bodyEn: t.bodyContent || t.content || t.body || '',
          metaName: undefined,
          isApproved: false,
          isActive: true,
          source: 'legacy' as const,
        }))
      }

      const all: WATemplate[] = [
        ...(Array.isArray(newTemplates)
          ? newTemplates.map((t: WATemplate) => ({
            ...t, source: 'new' as const,
          }))
          : []
        ),
        ...legacyTemplates,
      ]
      setTemplates(all)
    } catch {
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // Auto-poll PENDING templates every 60 seconds for 5 minutes
  useEffect(() => {
    const pendingTemplates = templates.filter(
      t => t.source === 'new' && t.metaStatus === 'PENDING'
    )
    if (pendingTemplates.length === 0) return

    const interval = setInterval(async () => {
      let anyChanged = false
      for (const t of pendingTemplates) {
        try {
          const res = await fetch(`/api/wa-templates/${t.id}/status`)
          const data = await res.json()
          if (data.changed) {
            anyChanged = true
            if (data.metaStatus === 'APPROVED') {
              toast.success(`"${t.name}" approved by Meta!`)
            } else if (data.metaStatus === 'REJECTED') {
              toast.error(`"${t.name}" was rejected by Meta`)
            }
          }
        } catch {}
      }
      if (anyChanged) fetchTemplates()
    }, 60000) // Check every 60 seconds

    // Stop after 5 minutes
    const timeout = setTimeout(() => clearInterval(interval), 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [templates.filter(t => t.metaStatus === 'PENDING').map(t => t.id).join(',')])

  const filtered = templates.filter(t => {
    if (t.source === 'legacy') {
      return t.language === language || !t.language
    }
    return language === 'hi' ? !!t.bodyHi : !!t.bodyEn
  })

  const handleSave = async (data: Record<string, unknown>) => {
    const url = editingTemplate
      ? `/api/wa-templates/${editingTemplate.id}`
      : '/api/wa-templates'
    const method = editingTemplate ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (!res.ok) {
      alert(result.error || 'Failed to save template')
      return
    }

    toast.success('Template saved successfully')
    setShowForm(false)
    setEditingTemplate(null)
    await fetchTemplates()
  }

  const handleEdit = (t: WATemplate) => {
    if (t.source === 'legacy') return
    setEditingTemplate(t)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return
    await fetch(`/api/wa-templates/${id}`, { method: 'DELETE' })
    toast.success('Template deleted')
    await fetchTemplates()
  }

  const handleSubmitToMeta = async (id: string) => {
    toast.loading('Submitting to Meta...', { id: 'submit-meta' })
    try {
      const res = await fetch(`/api/wa-templates/${id}/submit`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success('Submitted to Meta! Status will update after review.', { id: 'submit-meta' })
        await fetchTemplates()
      } else {
        toast.error(`Failed: ${data.error || 'Unknown error'}`, { id: 'submit-meta', duration: 5000 })
        await fetchTemplates()
      }
    } catch {
      toast.error('Failed to submit', { id: 'submit-meta' })
    }
  }

  const handleSyncStatus = async () => {
    toast.loading('Syncing with Meta...', { id: 'sync-meta' })
    try {
      const res = await fetch('/api/wa-templates/sync', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        const parts: string[] = []
        if (data.updated) parts.push(`${data.updated} updated`)
        if (data.imported) parts.push(`${data.imported} imported from Meta`)
        const msg = parts.length ? `Synced! ${parts.join(', ')}.` : 'Synced! No changes.'
        toast.success(msg, { id: 'sync-meta' })
        await fetchTemplates()
      } else {
        toast.error('Sync failed', { id: 'sync-meta' })
      }
    } catch {
      toast.error('Sync failed', { id: 'sync-meta' })
    }
  }

  const hiCount = templates.filter(t => t.source === 'new' && !!t.bodyHi).length
  const enCount = templates.filter(t => t.source === 'new' && !!t.bodyEn).length
  const legacyCount = templates.filter(t => t.source === 'legacy').length

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      <Toaster position="top-right" />
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '4px',
          }}>
            WhatsApp Templates
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {hiCount} Hindi · {enCount} English · {legacyCount} Legacy
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingTemplate(null)
              setShowForm(true)
            }}
            style={{
              backgroundColor: '#25D366',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            + New {language === 'hi' ? 'Hindi 🇮🇳' : 'English 🇬🇧'} Template
          </button>
        )}
        <button
          onClick={handleSyncStatus}
          style={{
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Sync from Meta
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <>
          <TemplateForm
            language={language}
            initial={editingTemplate}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditingTemplate(null)
            }}
          />
          {/* Best Practices */}
          <div style={{
            backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0',
            padding: '16px 20px', marginBottom: '24px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '10px' }}>
              Template Best Practices
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', color: '#64748b', lineHeight: 1.7 }}>
              <div>
                <p style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Naming</p>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>Use lowercase with underscores: <code style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>opd_camp_jaipur</code></li>
                  <li>Keep names unique and descriptive</li>
                  <li>Don&apos;t reuse deleted template names (Meta remembers for 30 days)</li>
                </ul>
              </div>
              <div>
                <p style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Category</p>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li><strong>UTILITY</strong>: reminders, follow-ups, OPD (approved faster)</li>
                  <li><strong>MARKETING</strong>: promotions, campaigns (takes 24-48h)</li>
                  <li>Avoid promotional language in UTILITY templates</li>
                </ul>
              </div>
              <div>
                <p style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Body Content</p>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>Keep under 1024 characters</li>
                  <li>Use {'{{1}}'}, {'{{2}}'} for variables</li>
                  <li>Hindi: use <code style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '1px 4px', borderRadius: '3px' }}>hi</code> language code</li>
                </ul>
              </div>
              <div>
                <p style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Approval</p>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>UTILITY templates: usually approved in minutes</li>
                  <li>MARKETING templates: 24-48 hours</li>
                  <li>Auto-check runs every 60s for 5 minutes after submission</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Language Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
      }}>
        <span style={{
          fontSize: '13px',
          color: '#64748b',
          fontWeight: '500',
        }}>
          Showing:
        </span>
        <div style={{
          display: 'flex',
          backgroundColor: '#f1f5f9',
          borderRadius: '8px',
          padding: '3px',
          gap: '2px',
        }}>
          {([
            { key: 'hi' as const, label: '🇮🇳 Hindi' },
            { key: 'en' as const, label: '🇬🇧 English' },
          ]).map(lang => (
            <button
              key={lang.key}
              onClick={() => {
                setLanguage(lang.key)
                setShowForm(false)
                setEditingTemplate(null)
              }}
              style={{
                padding: '7px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: language === lang.key ? '600' : '400',
                backgroundColor: language === lang.key ? 'white' : 'transparent',
                color: language === lang.key ? '#1e293b' : '#64748b',
                boxShadow: language === lang.key
                  ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          {filtered.length} templates
        </span>
      </div>

      {/* Template list */}
      {loading ? (
        <p style={{
          color: '#94a3b8',
          textAlign: 'center',
          padding: '40px',
        }}>
          Loading templates...
        </p>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px dashed #e2e8f0',
        }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>
            {language === 'hi' ? '🇮🇳' : '🇬🇧'}
          </p>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '8px',
          }}>
            No {language === 'hi' ? 'Hindi' : 'English'} templates yet
          </p>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '20px',
          }}>
            Click the button above to create your first{' '}
            {language === 'hi' ? 'Hindi' : 'English'} template
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              language={language}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSubmitToMeta={handleSubmitToMeta}
            />
          ))}
        </div>
      )}
    </div>
  )
}
