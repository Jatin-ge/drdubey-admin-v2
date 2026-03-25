'use client';

import { useState, useEffect, useCallback } from 'react';

interface Token {
  id: string;
  tokenNumber: number;
  patientName: string;
  phone: string;
  city: string;
  status: 'WAITING' | 'CALLED' | 'COMPLETED';
  createdAt: string;
}

export default function TokenDisplayPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const today = new Date().toISOString().split('T')[0];

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch(`/api/tokens?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || data || []);
      }
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
    }
  }, [today]);

  useEffect(() => {
    fetchTokens();
    const tokenInterval = setInterval(fetchTokens, 5000);
    return () => clearInterval(tokenInterval);
  }, [fetchTokens]);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = '#0a0a1a';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.background = '';
      document.body.style.overflow = '';
    };
  }, []);

  const calledToken = tokens.find((t) => t.status === 'CALLED');
  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');
  const nextFiveWaiting = waitingTokens.slice(0, 5);

  const nowServing = calledToken?.tokenNumber ?? '--';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 100%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Clinic Name */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: '700',
            margin: 0,
            letterSpacing: '2px',
            color: '#e0e0ff',
          }}
        >
          Dr. Dubay Hip &amp; Knee Clinic
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.5)',
            margin: '8px 0 0 0',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          OPD Token System
        </p>
      </div>

      {/* NOW SERVING Section */}
      <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p
          style={{
            fontSize: '32px',
            fontWeight: '600',
            margin: '0 0 16px 0',
            textTransform: 'uppercase',
            letterSpacing: '10px',
            color: '#ffd700',
          }}
        >
          Now Serving
        </p>
        <div
          style={{
            fontSize: '220px',
            fontWeight: '900',
            lineHeight: 1,
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 60px rgba(102, 126, 234, 0.4))',
          }}
        >
          {nowServing}
        </div>
        {calledToken && (
          <p style={{ fontSize: '28px', color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: '400' }}>
            {calledToken.patientName}
          </p>
        )}
      </div>

      {/* Next Waiting Tokens */}
      {nextFiveWaiting.length > 0 && (
        <div style={{ width: '100%', maxWidth: '900px', marginBottom: '20px' }}>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              margin: '0 0 16px 0',
              textTransform: 'uppercase',
              letterSpacing: '4px',
            }}
          >
            Up Next
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {nextFiveWaiting.map((token, index) => (
              <div
                key={token.id}
                style={{
                  background: index === 0 ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.05)',
                  border: index === 0 ? '2px solid rgba(102, 126, 234, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px 28px',
                  textAlign: 'center',
                  minWidth: '120px',
                }}
              >
                <p style={{ fontSize: '42px', fontWeight: '800', margin: 0, color: index === 0 ? '#667eea' : 'rgba(255,255,255,0.7)' }}>
                  {token.tokenNumber}
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                  {token.patientName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: Date & Time */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          {formatDate(currentTime)}
        </p>
        <p style={{ fontSize: '32px', fontWeight: '300', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0 0', letterSpacing: '4px' }}>
          {formatTime(currentTime)}
        </p>
      </div>
    </div>
  );
}
