import React, { useState } from 'react';
import { Save } from 'lucide-react';

export default function Track({ currentHours, handleUpdateHours }) {
  const [newHours, setNewHours] = useState(currentHours);

  const onSave = () => {
    handleUpdateHours(newHours);
    alert('Ore aggiornate correttamente!');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Contaore <span className="text-gradient">Moto</span></h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Inserisci le ore attuali lette fisicamente dal cruscotto della moto.</p>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>ORE APP ATTUALI</h3>
        <div style={{ fontSize: '3.5rem', fontFamily: 'Outfit', fontWeight: '800', margin: '10px 0', color: 'var(--text-main)' }}>
          {Number(currentHours).toFixed(1)}<span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>h</span>
        </div>
      </div>

      <div className="card">
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Ore Lette sul Cruscotto</label>
            <input 
              type="number" 
              step="0.1" 
              value={newHours}
              onChange={(e) => setNewHours(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }} 
            />
          </div>
          
          <button type="button" onClick={onSave} className="btn-primary" style={{ marginTop: '8px', height: '55px' }}>
            <Save size={20} /> Salva e Aggiorna Totale
          </button>
        </form>
      </div>
    </div>
  );
}
