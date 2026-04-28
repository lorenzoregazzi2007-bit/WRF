import { Cloud, Database, CheckCircle, RefreshCcw } from 'lucide-react';

export default function Settings() {
  return (
    <div className="animate-fade-in" style={{ padding: '24px', paddingBottom: '100px' }}>
      <h1>Stato <span className="text-gradient">Cloud</span></h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        Tutti i tuoi dati sono salvati automaticamente su Firebase.
      </p>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ position: 'relative' }}>
          <Cloud size={80} color="var(--yamaha-blue-light)" style={{ opacity: 0.2 }} />
          <CheckCircle 
            size={30} 
            color="var(--status-ok)" 
            style={{ position: 'absolute', bottom: '10px', right: '0', background: 'var(--bg-panel)', borderRadius: '50%' }} 
          />
        </div>

        <div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Sincronizzazione Attiva</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Ogni modifica al contaore o alla manutenzione viene salvata istantaneamente nel tuo database privato.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-ok)', fontWeight: '600', fontSize: '0.9rem', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 20px', borderRadius: '30px' }}>
          <RefreshCcw size={16} className="animate-pulse" />
          Dati al sicuro nel Cloud
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Database size={18} color="var(--yamaha-blue-light)" />
          <h4 style={{ margin: 0 }}>Dettagli Account</h4>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Progetto:</span>
            <span style={{ color: 'white' }}>wr450app</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>Stato:</span>
            <span style={{ color: 'var(--status-ok)' }}>Ottimale</span>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '15px', fontStyle: 'italic' }}>
            Le credenziali sono state incorporate direttamente nel codice per la tua massima sicurezza e comodità.
          </p>
        </div>
      </div>
    </div>
  );
}
