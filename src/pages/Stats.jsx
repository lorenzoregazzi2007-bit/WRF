import { useRef, useEffect, useState } from 'react';

/* ── Simple SVG sparkline ── */
function Sparkline({ data, color = '#00D4FF', height = 60 }) {
  if (!data || data.length < 2) return <div style={{ height, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }} />;
  const max = Math.max(...data, 1);
  const w = 300, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  const fill = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ') + ` ${w},${h} 0,${h}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', borderRadius: 8 }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

/* ── Circular Progress ── */
function CircularProgress({ value, max, size = 80, strokeWidth = 6, color }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill="white"
        fontSize="13" fontFamily="Orbitron, monospace" fontWeight="700">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

function formatTime(ms) {
  if (!ms) return '00:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default function Stats({ sessionStats }) {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wrf_ride_history') || '[]'); } catch { return []; }
  });

  const { maxSpeed = 0, totalDist = 0, startTime = null, track = [] } = sessionStats;
  const duration = startTime ? Date.now() - startTime : 0;
  const avgSpeed = duration > 0 ? (totalDist / (duration / 3600000)) : 0;

  // Build speed sparkline from track
  const speedData = track.map(p => p.speed || 0);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div className="hud-label" style={{ color: 'var(--cyan)', marginBottom: 4 }}>Yamaha WR450F</div>
        <h1 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.6rem', color: 'var(--text-primary)', lineHeight: 1 }}>
          Statistiche
        </h1>
      </div>

      {/* Session summary */}
      <div className="section-title">Sessione Corrente</div>
      <div className="grid-2" style={{ marginBottom: 12 }}>
        <div className="stat-cell">
          <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--cyan)' }}>{Math.round(maxSpeed)}</div>
          <div className="stat-unit">KM/H</div>
          <div className="stat-label">Velocità Max</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value" style={{ fontSize: '1.8rem' }}>{totalDist < 1 ? `${Math.round(totalDist*1000)}` : totalDist.toFixed(2)}</div>
          <div className="stat-unit">{totalDist < 1 ? 'M' : 'KM'}</div>
          <div className="stat-label">Distanza</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>{Math.round(avgSpeed)}</div>
          <div className="stat-unit">KM/H</div>
          <div className="stat-label">Media</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>{formatTime(duration)}</div>
          <div className="stat-label">Durata</div>
        </div>
      </div>

      {/* Speed chart */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="section-title" style={{ marginBottom: 8 }}>Grafico Velocità</div>
        <Sparkline data={speedData.length > 1 ? speedData : [0, 5, 20, 40, 35, 60, 80, 65, 90, 75, 50, 30, 20, 0]} color="#00D4FF" height={80} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Start</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Now</span>
        </div>
      </div>

      {/* Gauges row */}
      <div className="section-title">Performance</div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
        {[
          { label: 'Velocità', v: maxSpeed, max: 180, color: '#00D4FF' },
          { label: 'Distanza', v: totalDist, max: 50, color: '#00e676' },
          { label: 'Durata', v: duration / 60000, max: 120, color: '#ffb300' },
        ].map(({ label, v, max, color }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <CircularProgress value={v} max={max} size={72} color={color} />
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Ride history */}
      <div className="section-title">Storico Sessioni</div>
      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📍</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nessuna sessione salvata</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: 4 }}>Le sessioni vengono salvate automaticamente</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.slice(0, 10).map((r, i) => (
            <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.date}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.dist?.toFixed(1) ?? '0'} km</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-hud)', color: 'var(--cyan)', fontSize: '1rem' }}>{r.maxSpeed ?? 0} km/h</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTime(r.duration ?? 0)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export */}
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" style={{ height: 48 }}
          onClick={() => {
            const data = JSON.stringify({ session: sessionStats, history }, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url;
            a.download = `wrf_stats_${new Date().toISOString().split('T')[0]}.json`; a.click();
          }}>
          ⬇ Esporta JSON
        </button>
      </div>
    </div>
  );
}
