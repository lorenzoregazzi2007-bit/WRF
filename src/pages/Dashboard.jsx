import { Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard({ currentHours, components }) {
  // Sort components by percentage used (descending), pick top 2
  const sortedComponents = [...components].map(c => {
    const hoursUsed = currentHours - c.currentHoursAtLastChange;
    const percent = (hoursUsed / c.interval) * 100;
    const hoursLeft = c.interval - hoursUsed;
    return { ...c, percent, hoursLeft };
  }).sort((a, b) => b.percent - a.percent).slice(0, 2);

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h1>WR450F <span className="text-gradient">Supermoto</span></h1>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Gestione intervalli su strada.</p>
      
      <div className="card" style={{ textAlign: 'center', marginBottom: '24px', background: 'linear-gradient(145deg, var(--bg-panel) 0%, rgba(10, 61, 145, 0.1) 100%)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>CONTAORE FISICO</h3>
        <div style={{ fontSize: '4.5rem', fontFamily: 'Outfit', fontWeight: '800', margin: '10px 0', color: 'var(--status-ok)', textShadow: '0 0 20px rgba(16, 185, 129, 0.2)' }}>
          {currentHours.toFixed(1)}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', textShadow: 'none' }}>h</span>
        </div>
        <Link to="/track">
          <button className="btn-secondary" style={{ width: '60%', margin: '0 auto', fontSize: '0.9rem', padding: '8px 16px' }}>Aggiorna Ore</button>
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Wrench size={18}/> In Scadenza</h3>
          <Link to="/maintenance" style={{ color: 'var(--yamaha-blue-light)', fontSize: '0.9rem', textDecoration: 'none' }}>Vedi tutti</Link>
        </div>
        
        {sortedComponents.map((c, idx) => {
          let color = 'var(--status-ok)';
          if (c.percent > 70) color = 'var(--status-warn)';
          if (c.percent >= 100) color = 'var(--status-critical)';

          return (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: idx === 0 ? '16px' : '0', borderBottom: idx === 0 ? '1px solid var(--border-color)' : 'none', paddingBottom: idx === 0 ? '16px' : '0' }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{c.name}</div>
                <div style={{ fontSize: '0.9rem', color: color }}>
                  {c.hoursLeft > 0 ? `Mancano ${c.hoursLeft.toFixed(1)}h` : `Scaduto da ${Math.abs(c.hoursLeft).toFixed(1)}h`}
                </div>
              </div>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: `4px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {Math.min(100, Math.round(c.percent))}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
