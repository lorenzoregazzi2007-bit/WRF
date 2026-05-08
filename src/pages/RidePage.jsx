import { useState, useEffect, useRef } from 'react';

/* ── Accelerometer / G-Force hook ── */
function useMotion() {
  const [motion, setMotion] = useState({ ax: 0, ay: 0, az: 0, gx: 0, gy: 0, gz: 0, tilt: 0, gforce: 1 });
  useEffect(() => {
    const handler = (e) => {
      const ax = e.accelerationIncludingGravity?.x ?? 0;
      const ay = e.accelerationIncludingGravity?.y ?? 0;
      const az = e.accelerationIncludingGravity?.z ?? 9.81;
      const gforce = Math.sqrt(ax*ax + ay*ay + az*az) / 9.81;
      const tilt = Math.round(Math.atan2(ax, az) * (180 / Math.PI));
      setMotion({ ax, ay, az, gx: e.rotationRate?.alpha ?? 0, gy: e.rotationRate?.beta ?? 0, gz: e.rotationRate?.gamma ?? 0, tilt, gforce });
    };
    if (typeof DeviceMotionEvent !== 'undefined') {
      if (DeviceMotionEvent.requestPermission) {
        DeviceMotionEvent.requestPermission().then(p => { if (p === 'granted') window.addEventListener('devicemotion', handler); }).catch(() => {});
      } else {
        window.addEventListener('devicemotion', handler);
      }
    }
    return () => window.removeEventListener('devicemotion', handler);
  }, []);
  return motion;
}

/* ── Stopwatch ── */
function useStopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed;
      const tick = () => { setElapsed(Date.now() - startRef.current); rafRef.current = requestAnimationFrame(tick); };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running]);

  return { elapsed, running, start: () => setRunning(true), stop: () => setRunning(false), reset: () => { setRunning(false); setElapsed(0); } };
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}

/* ── Tilt Gauge ── */
function TiltGauge({ tilt }) {
  const clamped = Math.max(-60, Math.min(60, tilt));
  const pct = ((clamped + 60) / 120) * 100;
  return (
    <div style={{ position: 'relative', height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'visible' }}>
      <div style={{ position: 'absolute', left: '50%', top: -2, width: 2, height: 16, background: 'rgba(255,255,255,0.15)', transform: 'translateX(-50%)', borderRadius: 1 }} />
      <div style={{
        position: 'absolute', left: `${pct}%`, top: '50%',
        transform: 'translate(-50%,-50%)',
        width: 20, height: 20, borderRadius: '50%',
        background: Math.abs(clamped) > 40 ? 'var(--danger)' : Math.abs(clamped) > 25 ? 'var(--warn)' : 'var(--cyan)',
        boxShadow: `0 0 10px ${Math.abs(clamped) > 40 ? 'var(--danger)' : 'var(--cyan)'}`,
        transition: 'left 0.1s ease, background 0.2s',
      }} />
    </div>
  );
}

export default function RidePage({ sessionStats, setSessionStats }) {
  const motion = useMotion();
  const chrono = useStopwatch();
  const lapChrono = useStopwatch();
  const [laps, setLaps] = useState([]);
  const [motionPermission, setMotionPermission] = useState('unknown');

  const requestMotion = () => {
    if (DeviceMotionEvent?.requestPermission) {
      DeviceMotionEvent.requestPermission().then(p => setMotionPermission(p)).catch(() => setMotionPermission('denied'));
    } else {
      setMotionPermission('granted');
    }
  };

  const addLap = () => {
    setLaps(l => [...l, lapChrono.elapsed]);
    lapChrono.reset();
    lapChrono.start();
  };

  const gforce = motion.gforce.toFixed(2);
  const tilt = motion.tilt;

  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <div className="hud-label" style={{ color: 'var(--cyan)', marginBottom: 4 }}>Telemetria</div>
        <h1 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.6rem', color: 'var(--text-primary)', lineHeight: 1 }}>Ride Data</h1>
      </div>

      {/* ── Main Chronometer ── */}
      <div className="card card-glow" style={{ textAlign: 'center', marginBottom: 12, padding: '20px 16px' }}>
        <div className="hud-label" style={{ marginBottom: 8 }}>CRONOMETRO</div>
        <div style={{ fontFamily: 'var(--font-hud)', fontSize: '2.8rem', color: 'var(--cyan)', letterSpacing: '0.05em', textShadow: 'var(--glow-cyan)' }}>
          {formatMs(chrono.elapsed)}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className={`btn ${chrono.running ? 'btn-danger' : 'btn-cyan'}`} style={{ height: 48 }}
            onClick={() => chrono.running ? chrono.stop() : chrono.start()}>
            {chrono.running ? '⏸ Pausa' : '▶ Start'}
          </button>
          <button className="btn btn-ghost" style={{ width: 80, height: 48 }} onClick={chrono.reset}>Reset</button>
          {chrono.running && (
            <button className="btn btn-ghost" style={{ width: 80, height: 48 }} onClick={addLap}>Giro</button>
          )}
        </div>
      </div>

      {/* ── Laps ── */}
      {laps.length > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="section-title">Giri</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {laps.map((lap, i) => {
              const best = i === laps.indexOf(Math.min(...laps));
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < laps.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Giro {i+1}</span>
                  <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', color: best ? 'var(--ok)' : 'var(--text-primary)' }}>{formatMs(lap)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sensors ── */}
      <div className="section-title">Sensori IMU</div>

      {motionPermission !== 'granted' && (
        <div className="card" style={{ marginBottom: 12, textAlign: 'center', padding: 20 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: '0.85rem' }}>
            Autorizza l'accesso ai sensori di movimento per G-force e inclinazione
          </div>
          <button className="btn btn-cyan" style={{ height: 44 }} onClick={requestMotion}>🔓 Autorizza Sensori</button>
        </div>
      )}

      {/* Tilt */}
      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="hud-label">INCLINAZIONE MOTO</span>
          <span style={{ fontFamily: 'var(--font-hud)', fontSize: '1.2rem', color: Math.abs(tilt) > 40 ? 'var(--danger)' : 'var(--text-primary)' }}>
            {tilt > 0 ? '+' : ''}{tilt}°
          </span>
        </div>
        <TiltGauge tilt={tilt} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>60° SX</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>DRITTO</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>60° DX</span>
        </div>
      </div>

      {/* G-Force + Accel grid */}
      <div className="grid-3" style={{ marginBottom: 12 }}>
        <div className="stat-cell">
          <div className="stat-value" style={{ color: Number(gforce) > 1.5 ? 'var(--warn)' : 'var(--text-primary)' }}>{gforce}</div>
          <div className="stat-unit">G</div>
          <div className="stat-label">G-Force</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{motion.ax.toFixed(1)}</div>
          <div className="stat-unit">m/s²</div>
          <div className="stat-label">Accel X</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{motion.ay.toFixed(1)}</div>
          <div className="stat-unit">m/s²</div>
          <div className="stat-label">Accel Y</div>
        </div>
      </div>

      {/* Session toggle */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Registrazione GPS</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {sessionStats.isRecording ? 'Sessione attiva' : 'Inattiva'}
            </div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={sessionStats.isRecording}
              onChange={() => setSessionStats(s => ({ ...s, isRecording: !s.isRecording, startTime: !s.isRecording ? Date.now() : null }))}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="disclaimer-banner">
        ⚠️ Non usare questa app in modo pericoloso durante la guida.
      </div>
    </div>
  );
}
