export default function SettingsPage({ settings, setSettings }) {
  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const Row = ({ label, sub, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );

  const resetAll = () => {
    if (!confirm('Cancellare tutti i dati app? (Manutenzione, ore, storico)')) return;
    ['wrf_hours','wrf_components','wrf_logs','wrf_ride_history','wrf_settings'].forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <div className="hud-label" style={{ color: 'var(--cyan)', marginBottom: 4 }}>Configurazione</div>
        <h1 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.6rem', color: 'var(--text-primary)', lineHeight: 1 }}>Impostazioni</h1>
      </div>

      {/* Moto Info */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--yamaha-blue), var(--yamaha-blue-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: 'var(--glow-blue)' }}>🏍</div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>Yamaha WR450F</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2017 · Enduro · 449cc</div>
            <div className="badge badge-ok" style={{ marginTop: 4 }}>WRF Dashboard v1.0</div>
          </div>
        </div>
      </div>

      {/* Unità */}
      <div className="section-title">Dashboard</div>
      <div className="card" style={{ marginBottom: 12 }}>
        <Row label="Unità Velocità" sub="KM/H oppure MPH">
          <div style={{ display: 'flex', gap: 4 }}>
            {['kmh','mph'].map(u => (
              <button key={u} onClick={() => set('unit', u)} style={{
                padding: '6px 14px', borderRadius: 'var(--r-sm)', border: '1px solid',
                background: settings.unit === u ? 'var(--yamaha-blue-mid)' : 'transparent',
                borderColor: settings.unit === u ? 'var(--yamaha-blue-light)' : 'var(--border)',
                color: settings.unit === u ? 'white' : 'var(--text-muted)',
                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase',
              }}>{u}</button>
            ))}
          </div>
        </Row>
        <Row label="Smoothing GPS" sub="Ammortizza oscillazioni velocità">
          <label className="toggle">
            <input type="checkbox" checked={settings.smoothing !== false} onChange={e => set('smoothing', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </Row>
        <Row label="Notte Automatica" sub="Adatta tema all'ora del giorno">
          <label className="toggle">
            <input type="checkbox" checked={settings.autoNight !== false} onChange={e => set('autoNight', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </Row>
      </div>

      {/* Tema colore */}
      <div className="section-title">Tema Colore</div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { key: 'blue',  label: 'Yamaha Blue', color: '#1A6FFF' },
            { key: 'green', label: 'Rally Green',  color: '#00e676' },
            { key: 'amber', label: 'Rally Amber',  color: '#ffb300' },
          ].map(({ key, label, color }) => (
            <button key={key} onClick={() => set('theme', key)} style={{
              padding: '12px 8px', borderRadius: 'var(--r-md)', border: `2px solid`,
              borderColor: settings.theme === key ? color : 'var(--border)',
              background: settings.theme === key ? `${color}18` : 'transparent',
              cursor: 'pointer', textAlign: 'center',
              boxShadow: settings.theme === key ? `0 0 12px ${color}44` : 'none',
            }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: color, margin: '0 auto 6px', boxShadow: `0 0 8px ${color}` }} />
              <div style={{ fontSize: '0.65rem', color: settings.theme === key ? color : 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Modalità operative */}
      <div className="section-title">Modalità</div>
      <div className="card" style={{ marginBottom: 12 }}>
        <Row label="Modalità Pioggia" sub="Aumenta contrasto UI, riduce luminosità">
          <label className="toggle">
            <input type="checkbox" checked={settings.rainMode || false} onChange={e => set('rainMode', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </Row>
        <Row label="Modalità Rally" sub="Massima visibilità, font più grandi">
          <label className="toggle">
            <input type="checkbox" checked={settings.rallyMode || false} onChange={e => set('rallyMode', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </Row>
        <Row label="Schermo Sempre Attivo" sub="Impedisce sleep screen (consuma batteria)">
          <label className="toggle">
            <input type="checkbox" checked={settings.keepScreen !== false} onChange={e => set('keepScreen', e.target.checked)} />
            <span className="toggle-slider" />
          </label>
        </Row>
      </div>

      {/* App info */}
      <div className="section-title">Informazioni App</div>
      <div className="card" style={{ marginBottom: 16 }}>
        {[
          ['Versione', '1.0.0'],
          ['Stack', 'React + Vite + PWA'],
          ['Deploy', 'GitHub Pages'],
          ['GPS', 'Web Geolocation API'],
          ['Mappe', 'OpenStreetMap + Leaflet'],
          ['Meteo', 'Open-Meteo (gratuito)'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{k}</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-banner" style={{ marginBottom: 16 }}>
        ⚠️ Non usare questa app in modo pericoloso durante la guida. Rispetta sempre il codice della strada.
      </div>

      {/* Reset */}
      <button className="btn btn-danger" style={{ height: 50, marginBottom: 8 }} onClick={resetAll}>
        🗑 Reset Tutti i Dati
      </button>
    </div>
  );
}
