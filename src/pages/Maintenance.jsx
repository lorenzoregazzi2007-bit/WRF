import { AlertTriangle, CheckCircle2, History } from 'lucide-react';

export default function Maintenance({ currentHours, components, handleMarkDone, logs }) {
  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1>Garage <span className="text-gradient">Motard</span></h1>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
          Moto: {Number(currentHours).toFixed(1)}h
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Gestisci le manutenzioni della tua WR.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
        {components.map((c) => {
          const hoursUsed = currentHours - c.currentHoursAtLastChange;
          const percent = (hoursUsed / c.interval) * 100;
          let color = 'var(--status-ok)';
          if (percent > 70) color = 'var(--status-warn)';
          if (percent >= 100) color = 'var(--status-critical)';
          
          return (
            <div key={c.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>{c.name}</span>
                  {percent >= 100 && <AlertTriangle size={16} color="var(--status-critical)" />}
                </div>
                <div style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.2rem' }}>
                  {hoursUsed.toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '400' }}>/ {c.interval}h</span>
                </div>
              </div>
              
              <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min(Math.max(percent, 0), 100)}%`, 
                  background: color,
                  borderRadius: '4px',
                  transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                 <button onClick={() => {
                   if(window.confirm(`Confermi di aver eseguito ${c.name} a ${currentHours}h?`)) {
                     handleMarkDone(c.id);
                   }
                 }} className="btn-primary" style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', fontSize: '1rem' }}>
                   <CheckCircle2 size={18} style={{ marginRight: '8px' }} /> Fatto a {Number(currentHours).toFixed(1)}h
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginBottom: '80px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} /> Cronologia Interventi
        </h3>
        
        {logs && logs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((log) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{log.componentName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.date}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--yamaha-blue-light)' }}>
                  A {log.hours.toFixed(1)}h
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Nessuna manutenzione registrata.</p>
        )}
      </div>
      
    </div>
  );
}
