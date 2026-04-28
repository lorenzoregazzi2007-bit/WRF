import { useState } from 'react';
import { Save, ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import { setupFirebase } from '../firebase';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState(() => {
    try {
      const s = localStorage.getItem('wrf_firebase_config');
      return s ? JSON.parse(s) : { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };
    } catch {
      return { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };
    }
  });

  const fields = [
    { key: 'apiKey', label: 'API Key' },
    { key: 'authDomain', label: 'Auth Domain' },
    { key: 'projectId', label: 'Project ID' },
    { key: 'storageBucket', label: 'Storage Bucket' },
    { key: 'messagingSenderId', label: 'Messaging Sender ID' },
    { key: 'appId', label: 'App ID' },
  ];

  const handleSave = () => {
    localStorage.setItem('wrf_firebase_config', JSON.stringify(config));
    const ok = setupFirebase(config);
    setSaved(ok);
    if (!ok) alert('Credenziali non valide. Controlla i valori copiati da Firebase.');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px', paddingBottom: '100px' }}>
      <h1>Impostazioni <span className="text-gradient">Cloud</span></h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Incolla qui le credenziali del tuo progetto Firebase per attivare il salvataggio automatico sul cloud.
      </p>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--yamaha-blue-light)', marginBottom: '8px' }}>
          <ShieldCheck size={22} />
          <h3 style={{ margin: 0 }}>Firebase Config</h3>
        </div>

        {fields.map(({ key, label }) => (
          <div key={key}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {label}
            </label>
            <input
              type="text"
              value={config[key]}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
              placeholder={`Inserisci ${label}...`}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                color: 'white',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ marginTop: '8px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          {saved
            ? <><CheckCircle2 size={20} /> Connesso al Cloud!</>
            : <><Save size={20} /> Salva e Connetti</>
          }
        </button>
      </div>

      <div className="card" style={{ marginTop: '20px', background: 'rgba(10, 61, 145, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--yamaha-blue-light)' }}>
          <Database size={18} />
          <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Dove trovo le credenziali?</h4>
        </div>
        <ol style={{ fontSize: '0.83rem', color: 'var(--text-muted)', paddingLeft: '18px', lineHeight: '1.8', margin: 0 }}>
          <li>Vai su <strong style={{ color: 'white' }}>console.firebase.google.com</strong></li>
          <li>Apri il tuo progetto → Impostazioni (ingranaggio)</li>
          <li>Scorri fino a <strong style={{ color: 'white' }}>"Le tue app"</strong></li>
          <li>Clicca sulla tua Web App e copia il <strong style={{ color: 'white' }}>firebaseConfig</strong></li>
        </ol>
      </div>
    </div>
  );
}
