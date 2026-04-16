'use client'
import { useState, useEffect } from 'react'

interface Article {
  id: string
  title: string
  journalName: string | null
  authors: string | null
  abstract: string | null
  doi: string | null
  externalUrl: string | null
  pdfUrl: string | null
  publishedDate: string | null
  tags: string[]
  isPublished: boolean
  createdAt: string
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    title: '', journalName: '', authors: '', abstract: '',
    doi: '', externalUrl: '', pdfUrl: '', publishedDate: '', tags: '',
  })

  useEffect(() => { fetchArticles() }, [])

  const fetchArticles = () => {
    setLoading(true)
    fetch('/api/articles')
      .then(r => r.json())
      .then(d => { setArticles(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const resetForm = () => {
    setForm({ title: '', journalName: '', authors: '', abstract: '', doi: '', externalUrl: '', pdfUrl: '', publishedDate: '', tags: '' })
    setEditingId(null)
    setShowForm(false)
    setMessage('')
  }

  const handleEdit = (a: Article) => {
    setForm({
      title: a.title,
      journalName: a.journalName || '',
      authors: a.authors || '',
      abstract: a.abstract || '',
      doi: a.doi || '',
      externalUrl: a.externalUrl || '',
      pdfUrl: a.pdfUrl || '',
      publishedDate: a.publishedDate ? a.publishedDate.split('T')[0] : '',
      tags: a.tags.join(', '),
    })
    setEditingId(a.id)
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    if (res.ok) { setMessage('Deleted'); fetchArticles() }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const body = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      publishedDate: form.publishedDate || null,
    }
    const url = editingId ? `/api/articles/${editingId}` : '/api/articles'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      setMessage(editingId ? 'Updated!' : 'Article added!')
      resetForm()
      fetchArticles()
    } else {
      const err = await res.json()
      setMessage(`Error: ${err.error || 'Save failed'}`)
    }
    setSaving(false)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
            Articles & Publications
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Manage published medical articles and research papers
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
          + Add Article
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
          backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
          color: message.includes('Error') ? '#dc2626' : '#16a34a',
          border: `1px solid ${message.includes('Error') ? '#fecaca' : '#bbf7d0'}`,
          fontSize: '14px',
        }}>{message}</div>
      )}

      {showForm && (
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            {editingId ? 'Edit Article' : 'Add New Article'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[
                { label: 'Title *', key: 'title', required: true },
                { label: 'Journal / Publication Name', key: 'journalName' },
                { label: 'Authors', key: 'authors', placeholder: 'Dr. Dheeraj Dubay, et al.' },
                { label: 'DOI', key: 'doi', placeholder: '10.xxxx/xxxxx' },
                { label: 'External URL', key: 'externalUrl', placeholder: 'https://...' },
                { label: 'PDF URL', key: 'pdfUrl', placeholder: 'https://...' },
                { label: 'Published Date', key: 'publishedDate', type: 'date' },
                { label: 'Tags (comma-separated)', key: 'tags', placeholder: 'knee, research, robotic' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>
                    {field.label}
                  </label>
                  <input
                    type={(field as any).type || 'text'}
                    required={(field as any).required}
                    placeholder={(field as any).placeholder || ''}
                    value={(form as any)[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '5px' }}>Abstract</label>
              <textarea
                value={form.abstract}
                onChange={e => setForm({ ...form, abstract: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={saving}
                style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save Article'}
              </button>
              <button type="button" onClick={resetForm}
                style={{ backgroundColor: 'white', color: '#374151', padding: '10px 24px', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '14px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>No articles yet. Add your first publication above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {articles.map(a => (
            <div key={a.id} style={{
              backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{a.title}</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                    {a.journalName && <span>{a.journalName}</span>}
                    {a.authors && <span>{a.authors}</span>}
                    {a.publishedDate && <span>{new Date(a.publishedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>}
                  </div>
                  {a.abstract && <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{a.abstract.slice(0, 200)}{a.abstract.length > 200 ? '...' : ''}</p>}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {a.doi && <span style={{ fontSize: '11px', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '99px' }}>DOI: {a.doi}</span>}
                    {a.externalUrl && <a href={a.externalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#2563eb', textDecoration: 'none' }}>View article</a>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '16px' }}>
                  <button onClick={() => handleEdit(a)}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(a.id)}
                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
