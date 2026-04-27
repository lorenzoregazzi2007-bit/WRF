import { useState } from 'react';
import { Save, ShieldCheck, Database } from 'lucide-react';
import { initializeFirebase } from '../firebase';

export default function Settings() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('wrf_firebase_config');
    return saved ? JSON.parse(saved) : {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    };
  });

  const handleSave = () => {
    localStorage.setItem('wrf_firebase_config', JSON.stringify(config));
    initializeFirebase(config);
    alert('Configurazione salvata! L\'app proverà a sincronizzarsi con il cloud.');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px', paddingBottom: '100px' }}>
      <h1>Impostazioni <span className="text-gradient">Cloud</span></h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Inserisci le tue credenziali Firebase per attivare il salvataggio remoto.</p>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--yamaha-blue-light)' }}>
          <ShieldCheck size={24} />
          <h3 style={{ margin: 0 }}>Configurazione Database</h3>
        </div>

        {Object.keys(config).map(key => (
          <div key={key}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {key.replace(/([A-Z])/g, ' $1')}
            </label>
            <input 
              type="text"
              value={config[key]}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
              placeholder={`Inserisci ${key}...`}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white' }}
            />
          </div>
        ))}

        <button onClick={handleSave} className="btn-primary" style={{ marginTop: '10px' }}>
          <Save size={20} style={{ marginRight: '8px' }} /> Salva Configurazione
        </button>
      </div>

      <div className="card" style={{ marginTop: '24px', opacity: 0.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Database size={18} />
          <h4 style={{ margin: 0 }}>Perché usare il Cloud?</h4>
        </div>
        <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
          Configurando Firebase, i tuoi dati (contaore, log, componenti) verranno salvati su un server sicuro. 
          Potrai accedere agli stessi dati da qualsiasi dispositivo semplicemente inserendo le stesse chiavi.
        </p>
      </div>
    </div>
  );
}
