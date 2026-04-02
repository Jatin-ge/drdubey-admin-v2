'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Patient {
  id: string
  name: string
  phone: string
  cities: string
  surgery: string
  patientStatus: string
  age: number
  gender: string
}

interface PatientSuggestProps {
  value: string
  onChange: (value: string) => void
  field: 'name' | 'phone'
  placeholder: string
  onSelectExisting?: (patient: Patient) => void
}

export default function PatientSuggest({
  value,
  onChange,
  field,
  placeholder,
  onSelectExisting,
}: PatientSuggestProps) {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<Patient[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef<NodeJS.Timeout>()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener(
      'mousedown', handleClick
    )
  }, [])

  const search = (query: string) => {
    clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/patients/suggest?q=${encodeURIComponent(query)}&field=${field}`
        )
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data : [])
        setShowDropdown(data.length > 0)
        setSelectedIndex(-1)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 280)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    search(val)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i =>
        Math.min(i + 1, suggestions.length - 1)
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const handleSelect = (patient: Patient) => {
    setShowDropdown(false)
    setSuggestions([])
    if (onSelectExisting) {
      onSelectExisting(patient)
    } else {
      router.push(`/admin/patients/${patient.id}`)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true)
        }}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '8px',
          border: '1.5px solid #e2e8f0',
          fontSize: '14px',
          color: '#1e293b',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
          backgroundColor: 'white',
          height: '44px',
        }}
        onFocusCapture={e => {
          e.target.style.borderColor = '#2563eb'
        }}
        onBlurCapture={e => {
          e.target.style.borderColor = '#e2e8f0'
        }}
        autoComplete="off"
      />

      {/* Loading indicator */}
      {loading && (
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '14px',
          height: '14px',
          border: '2px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }}/>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          zIndex: 1000,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '8px 14px',
            backgroundColor: '#fef9c3',
            borderBottom: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{ fontSize: '13px', color: '#92400e' }}>
              ⚠ Patient already exists — select to view or update
            </span>
          </div>

          {suggestions.map((patient, index) => (
            <div
              key={patient.id}
              onClick={() => handleSelect(patient)}
              style={{
                padding: '12px 14px',
                cursor: 'pointer',
                backgroundColor: index === selectedIndex
                  ? '#eff6ff'
                  : 'white',
                borderBottom: index < suggestions.length - 1
                  ? '1px solid #f1f5f9'
                  : 'none',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => {
                if (index !== selectedIndex) {
                  (e.currentTarget as HTMLElement)
                    .style.backgroundColor = '#f8fafc'
                }
                setSelectedIndex(index)
              }}
              onMouseLeave={e => {
                if (index !== selectedIndex) {
                  (e.currentTarget as HTMLElement)
                    .style.backgroundColor = 'white'
                }
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '3px',
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e293b',
                    }}>
                      {patient.name}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '1px 7px',
                      borderRadius: '99px',
                      backgroundColor:
                        patient.patientStatus === 'IPD'
                          ? '#eff6ff' : '#f0fdf4',
                      color:
                        patient.patientStatus === 'IPD'
                          ? '#1d4ed8' : '#15803d',
                      fontWeight: '500',
                    }}>
                      {patient.patientStatus || 'OPD'}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    gap: '12px',
                  }}>
                    <span>📞 {patient.phone}</span>
                    {patient.cities && (
                      <span>📍 {patient.cities}</span>
                    )}
                    {patient.surgery && (
                      <span>🏥 {patient.surgery}</span>
                    )}
                    {patient.age && (
                      <span>Age {patient.age}</span>
                    )}
                  </div>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: '#2563eb',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  marginLeft: '12px',
                }}>
                  View record →
                </span>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{
            padding: '8px 14px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
          }}>
            <span style={{
              fontSize: '11px',
              color: '#94a3b8',
            }}>
              Press ↑↓ to navigate • Enter to select •
              Esc to dismiss • Continue typing to add new
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
