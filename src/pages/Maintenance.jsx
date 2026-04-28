import { useState } from 'react';
import { AlertTriangle, CheckCircle2, History, Edit3, X, Check } from 'lucide-react';

function ComponentCard({ c, currentHours, onMarkDone, onUpdateInterval }) {
  const [editing, setEditing] = useState(false);
  const [newInterval, setNewInterval] = useState(c.interval);

  const hoursUsed = currentHours - c.currentHoursAtLastChange;
  const percent = (hoursUsed / c.interval) * 100;
  const hoursLeft = c.interval - hoursUsed;

  let color = 'var(--status-ok)';
  if (percent > 70) color = 'var(--status-warn)';
  if (percent >= 100) color = 'var(--status-critical)';

  const saveInterval = () => {
    const val = Number(newInterval);
    if (val > 0) onUpdateInterval(c.id, val);
    setEditing(false);
  };

  return (
    <div className="card" style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '700', fontSize: '1.05rem' }}>{c.name}</span>
          {percent >= 100 && <AlertTriangle size={15} color="var(--status-critical)" />}
        </div>

        {/* Intervallo modificabile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {editing ? (
            <>
              <input
                type="number"
                value={newInterval}
                onChange={e => setNewInterval(e.target.value)}
                style={{ width: '60px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--yamaha-blue-light)', color: 'white', fontSize: '0.9rem', textAlign: 'center' }}
                autoFocus
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>h</span>
              <button onClick={saveInterval} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-ok)', padding: '2px' }}>
                <Check size={16} />
              </button>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
                <X size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.8rem' }}
            >
              <Edit3 size={12} />
              ogni {c.interval}h
            </button>
          )}
        </div>
      </div>

      {/* Ore usate */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '0.85rem', color }}>
          {hoursLeft > 0
            ? `Mancano ${hoursLeft.toFixed(1)}h`
            : `⚠️ Scaduto da ${Math.abs(hoursLeft).toFixed(1)}h`}
        </span>
        <span style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.1rem' }}>
          {hoursUsed.toFixed(1)}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '400' }}>/{c.interval}h</span>
        </span>
      </div>

      {/* Barra progresso */}
      <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(Math.max(percent, 0), 100)}%`,
          background: color,
          borderRadius: '4px',
          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </div>

      {/* Bottone fatto */}
      <button
        onClick={() => {
          if (window.confirm(`Confermi ${c.name} eseguita a ${currentHours}h?`))
            onMarkDone(c.id);
        }}
        className="btn-primary"
        style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}
      >
        <CheckCircle2 size={18} /> Fatto a {Number(currentHours).toFixed(1)}h
      </button>
    </div>
  );
}

export default function Maintenance({ currentHours, components, handleMarkDone, handleUpdateInterval, logs }) {
  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <h1>Garage <span className="text-gradient">Motard</span></h1>
        <div style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          {Number(currentHours).toFixed(1)}h
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>Tocca "ogni Xh" per modificare l'intervallo.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '20px' }}>
        {components.map(c => (
          <ComponentCard
            key={c.id}
            c={c}
            currentHours={currentHours}
            onMarkDone={handleMarkDone}
            onUpdateInterval={handleUpdateInterval}
          />
        ))}
      </div>

      {/* Cronologia */}
      <div className="card" style={{ marginBottom: '90px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} /> Cronologia Interventi
        </h3>
        {logs && logs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map(log => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{log.componentName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{log.date}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--yamaha-blue-light)' }}>
                  {log.hours.toFixed(1)}h
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>Nessuna manutenzione registrata.</p>
        )}
      </div>
    </div>
  );
}
