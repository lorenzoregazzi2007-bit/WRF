import { useState } from 'react';

function getStatus(pct) {
  if (pct >= 100) return { color: 'var(--danger)', glow: 'var(--glow-danger)', label: 'SCADUTO', cls: 'badge-danger' };
  if (pct >= 70)  return { color: 'var(--warn)',   glow: 'var(--glow-warn)',   label: 'IN SCADENZA', cls: 'badge-warn' };
  return           { color: 'var(--ok)',    glow: 'var(--glow-ok)',    label: 'OK', cls: 'badge-ok' };
}

function ComponentCard({ comp, currentHours, onMarkDone, onUpdateInterval }) {
  const [editing, setEditing] = useState(false);
  const [intVal,  setIntVal]  = useState(comp.interval);
  const hoursUsed = Math.max(0, currentHours - comp.hoursAtLastChange);
  const pct = Math.min((hoursUsed / comp.interval) * 100, 120);
  const hoursLeft = comp.interval - hoursUsed;
  const { color, glow, label, cls } = getStatus(pct);

  return (
    <div className="card" style={{ marginBottom: 10, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>{comp.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Intervallo: {comp.interval}h — Usate: {hoursUsed.toFixed(1)}h
          </div>
        </div>
        <span className={`badge ${cls}`}>{label}</span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 6 }}>
        <div className="progress-fill" style={{
          width: `${Math.min(pct, 100)}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: pct >= 70 ? glow : 'none',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: '0.7rem', color }}>
          {hoursLeft > 0 ? `Mancano ${hoursLeft.toFixed(1)}h` : `Scaduto da ${Math.abs(hoursLeft).toFixed(1)}h`}
        </span>
        <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.9rem', color }}>{Math.round(pct)}%</span>
      </div>

      {/* Interval editor */}
      {editing ? (
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input type="number" className="input-field" style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
            value={intVal} onChange={e => setIntVal(Number(e.target.value))} min="1" max="500" />
          <button className="btn btn-cyan" style={{ width: 80, height: 40 }} onClick={() => { onUpdateInterval(comp.id, intVal); setEditing(false); }}>Salva</button>
          <button className="btn btn-ghost" style={{ width: 60, height: 40 }} onClick={() => setEditing(false)}>✕</button>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" style={{ flex: 1, height: 42, fontSize: '0.85rem' }} onClick={() => onMarkDone(comp.id)}>
          ✓ Eseguito ora
        </button>
        <button className="btn btn-ghost" style={{ width: 42, height: 42, padding: 0, fontSize: '1rem' }} onClick={() => setEditing(e => !e)}>
          ✎
        </button>
      </div>
    </div>
  );
}

export default function Garage({ engineHours, setEngineHours, components, handleMarkDone, handleUpdateInterval, logs, setLogs }) {
  const [newHours, setNewHours] = useState(engineHours);
  const [tab, setTab] = useState('maint'); // 'maint' | 'hours' | 'log'

  const sorted = [...components].map(c => {
    const used = Math.max(0, engineHours - c.hoursAtLastChange);
    return { ...c, pct: (used / c.interval) * 100 };
  }).sort((a, b) => b.pct - a.pct);

  const critical = sorted.filter(c => c.pct >= 70).length;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div className="hud-label" style={{ color: 'var(--cyan)', marginBottom: 4 }}>YamahaWR450F 2017</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.6rem', color: 'var(--text-primary)', lineHeight: 1 }}>Garage</h1>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: '1.8rem', color: 'var(--ok)', lineHeight: 1 }}>{Number(engineHours).toFixed(1)}h</div>
            <div className="hud-label" style={{ fontSize: '0.6rem' }}>Contaore</div>
          </div>
        </div>
      </div>

      {/* Alert summary */}
      {critical > 0 && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.25)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--danger)' }}><strong>{critical}</strong> componenti in scadenza o scaduti</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--bg-card)', borderRadius: 'var(--r-md)', padding: 4 }}>
        {[['maint','🔧 Manutenzione'], ['hours','⏱ Contaore'], ['log','📋 Storico']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
            background: tab === k ? 'var(--yamaha-blue-mid)' : 'transparent',
            color: tab === k ? 'white' : 'var(--text-muted)',
            boxShadow: tab === k ? 'var(--glow-blue)' : 'none',
            transition: 'all 0.2s',
          }}>{l}</button>
        ))}
      </div>

      {/* Tab: Maintenance */}
      {tab === 'maint' && (
        <div>
          {sorted.map(comp => (
            <ComponentCard key={comp.id} comp={comp} currentHours={engineHours}
              onMarkDone={handleMarkDone} onUpdateInterval={handleUpdateInterval} />
          ))}
        </div>
      )}

      {/* Tab: Hours */}
      {tab === 'hours' && (
        <div>
          <div className="card card-glow" style={{ textAlign: 'center', marginBottom: 16, padding: '24px 16px' }}>
            <div className="hud-label" style={{ marginBottom: 8 }}>ORE ATTUALI (FISICHE)</div>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: '3.5rem', color: 'var(--ok)', textShadow: 'var(--glow-ok)', lineHeight: 1 }}>
              {Number(engineHours).toFixed(1)}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>h</span>
            </div>
          </div>
          <div className="card">
            <div className="hud-label" style={{ marginBottom: 12 }}>AGGIORNA CONTAORE</div>
            <input type="number" step="0.1" min="0" className="input-field" style={{ marginBottom: 12 }}
              value={newHours} onChange={e => setNewHours(e.target.value)} />
            <button className="btn btn-primary" style={{ height: 52 }} onClick={() => { setEngineHours(Number(newHours)); }}>
              💾 Salva Ore
            </button>
          </div>
        </div>
      )}

      {/* Tab: Log */}
      {tab === 'log' && (
        <div>
          {logs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔧</div>
              <div style={{ color: 'var(--text-muted)' }}>Nessuna manutenzione registrata</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {logs.map(log => (
                <div key={log.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.componentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.date}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-hud)', color: 'var(--cyan)', fontSize: '0.9rem' }}>{log.hours}h</div>
                </div>
              ))}
            </div>
          )}
          {logs.length > 0 && (
            <button className="btn btn-danger" style={{ marginTop: 12, height: 44 }} onClick={() => { if (confirm('Cancellare tutto lo storico?')) setLogs([]); }}>
              🗑 Cancella Storico
            </button>
          )}
        </div>
      )}
    </div>
  );
}
