import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Smooth speed with exponential moving average ── */
function useSmoothValue(raw, alpha = 0.15) {
  const ref = useRef(raw);
  useEffect(() => { ref.current = ref.current * (1 - alpha) + raw * alpha; });
  return ref.current;
}

/* ── GPS Hook ── */
function useGPS(smoothing = true) {
  const [gps, setGps] = useState({
    speed: 0, rawSpeed: 0, lat: null, lon: null,
    altitude: 0, accuracy: null, heading: 0,
    status: 'waiting', // waiting | active | error | denied
  });

  const watchId = useRef(null);
  const smoothRef = useRef(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGps(g => ({ ...g, status: 'error' }));
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const rawKmh = pos.coords.speed != null ? pos.coords.speed * 3.6 : 0;
        if (smoothing) {
          smoothRef.current = smoothRef.current * 0.75 + rawKmh * 0.25;
        } else {
          smoothRef.current = rawKmh;
        }
        setGps({
          speed:    Math.max(0, smoothRef.current),
          rawSpeed: rawKmh,
          lat:      pos.coords.latitude,
          lon:      pos.coords.longitude,
          altitude: Math.round(pos.coords.altitude || 0),
          accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null,
          heading:  pos.coords.heading || 0,
          status:   'active',
        });
      },
      (err) => {
        setGps(g => ({ ...g, status: err.code === 1 ? 'denied' : 'error' }));
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, [smoothing]);

  return gps;
}

/* ── Compass hook ── */
function useCompass() {
  const [heading, setHeading] = useState(null);
  useEffect(() => {
    const handler = (e) => setHeading(e.alpha != null ? Math.round(e.alpha) : null);
    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (DeviceOrientationEvent.requestPermission) {
        // iOS 13+
        DeviceOrientationEvent.requestPermission().then(p => {
          if (p === 'granted') window.addEventListener('deviceorientation', handler, true);
        }).catch(() => {});
      } else {
        window.addEventListener('deviceorientation', handler, true);
      }
    }
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, []);
  return heading;
}

/* ── Weather hook (OpenMeteo, free no key) ── */
function useWeather(lat, lon) {
  const [weather, setWeather] = useState({ temp: null, loading: false });
  const lastFetch = useRef(0);
  useEffect(() => {
    if (!lat || !lon) return;
    const now = Date.now();
    if (now - lastFetch.current < 5 * 60 * 1000) return; // 5 min throttle
    lastFetch.current = now;
    setWeather(w => ({ ...w, loading: true }));
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current_weather=true`)
      .then(r => r.json())
      .then(d => setWeather({ temp: Math.round(d.current_weather?.temperature ?? null), loading: false }))
      .catch(() => setWeather({ temp: null, loading: false }));
  }, [lat, lon]);
  return weather;
}

/* ── Cardinal direction ── */
const CARDINALS = ['N','NE','E','SE','S','SO','O','NO'];
const toCardinal = (deg) => CARDINALS[Math.round(deg / 45) % 8];

/* ── Speed colour ── */
const speedGlowClass = (kmh) => {
  if (kmh < 30)  return 'speed-glow-low';
  if (kmh < 80)  return 'speed-glow-mid';
  if (kmh < 130) return 'speed-glow-high';
  return 'speed-glow-danger';
};

/* ── SVG Arc Gauge ── */
function ArcGauge({ value, max = 180, size = 220, color = '#00D4FF' }) {
  const r = 90;
  const cx = size / 2, cy = size / 2;
  const startAngle = -220, sweepAngle = 260;
  const pct = Math.min(value / max, 1);
  const ang = startAngle + pct * sweepAngle;
  const toRad = d => (d * Math.PI) / 180;
  const polarX = (a) => cx + r * Math.cos(toRad(a));
  const polarY = (a) => cy + r * Math.sin(toRad(a));
  const describeArc = (start, end) => {
    const large = end - start > 180 ? 1 : 0;
    return `M ${polarX(start)} ${polarY(start)} A ${r} ${r} 0 ${large} 1 ${polarX(end)} ${polarY(end)}`;
  };
  return (
    <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
      <path d={describeArc(startAngle, startAngle + sweepAngle)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />
      {pct > 0 && (
        <path d={describeArc(startAngle, ang)} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      )}
    </svg>
  );
}

/* ── Clock ── */
function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return time;
}

/* ── Main Dashboard ── */
export default function SpeedDashboard({ settings, sessionStats, setSessionStats, components, engineHours }) {
  const gps = useGPS(settings.smoothing !== false);
  const compass = useCompass();
  const weather = useWeather(gps.lat, gps.lon);
  const time = useClock();
  const { unit = 'kmh' } = settings;

  const speedKmh = gps.speed;
  const displaySpeed = unit === 'mph' ? speedKmh * 0.621371 : speedKmh;
  const speedLabel = unit === 'mph' ? 'MPH' : 'KM/H';

  // Session tracking
  const prevPos = useRef(null);
  useEffect(() => {
    if (!sessionStats.isRecording || gps.status !== 'active') return;
    if (speedKmh > sessionStats.maxSpeed) {
      setSessionStats(s => ({ ...s, maxSpeed: speedKmh }));
    }
    if (prevPos.current && gps.lat && gps.lon) {
      const d = haversine(prevPos.current.lat, prevPos.current.lon, gps.lat, gps.lon);
      setSessionStats(s => ({ ...s, totalDist: s.totalDist + d }));
    }
    prevPos.current = { lat: gps.lat, lon: gps.lon };
  }, [gps.lat, gps.lon]);

  // Nearest critical maintenance
  const criticalComp = [...components].map(c => {
    const used = engineHours - c.hoursAtLastChange;
    const pct  = (used / c.interval) * 100;
    return { ...c, pct };
  }).filter(c => c.pct > 70).sort((a, b) => b.pct - a.pct)[0];

  const headingVal = compass ?? gps.heading ?? 0;
  const gaugeColor = speedKmh < 30 ? '#00e676' : speedKmh < 80 ? '#00D4FF' : speedKmh < 130 ? '#ffb300' : '#ff1744';

  return (
    <div className="page" style={{ padding: 0, background: 'var(--bg-void)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px 4px', background: 'rgba(6,8,16,0.9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="hud-label" style={{ color: 'var(--cyan)', fontSize: '0.7rem' }}>WRF</span>
          <span className="hud-label" style={{ fontSize: '0.65rem' }}>DASHBOARD</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {sessionStats.isRecording && <div className="rec-dot" />}
          <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            {time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* GPS Status */}
      <div style={{ textAlign: 'center', padding: '4px 16px' }}>
        <span className={`badge ${gps.status === 'active' ? 'badge-ok' : gps.status === 'denied' ? 'badge-danger' : 'badge-cyan'}`}>
          {gps.status === 'active' ? `GPS ±${gps.accuracy ?? '?'}m` : gps.status === 'waiting' ? 'Acquisizione GPS…' : gps.status === 'denied' ? 'GPS negato' : 'Errore GPS'}
        </span>
      </div>

      {/* ── Speedometer ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          <ArcGauge value={speedKmh} max={180} size={220} color={gaugeColor} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className={`speed-display ${speedGlowClass(speedKmh)}`} style={{ fontSize: '4.8rem' }}>
              {Math.round(displaySpeed)}
            </div>
            <div className="hud-label" style={{ marginTop: 2, letterSpacing: '0.2em', color: 'var(--cyan)' }}>{speedLabel}</div>
          </div>
        </div>
      </div>

      {/* ── Info grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '0 12px 8px' }}>
        <div className="stat-cell">
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>{gps.altitude}m</div>
          <div className="stat-label">Altitudine</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>
            {weather.temp != null ? `${weather.temp}°` : '--'}
          </div>
          <div className="stat-label">Temp</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>{toCardinal(headingVal)}</div>
          <div className="stat-label">Direzione</div>
        </div>
      </div>

      {/* ── Session row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 12px 8px' }}>
        <div className="stat-cell">
          <div className="stat-value">{sessionStats.totalDist < 1 ? `${Math.round(sessionStats.totalDist * 1000)}m` : `${sessionStats.totalDist.toFixed(1)}km`}</div>
          <div className="stat-label">Distanza</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{unit === 'mph' ? (sessionStats.maxSpeed * 0.621).toFixed(0) : sessionStats.maxSpeed.toFixed(0)}</div>
          <div className="stat-label">Max {speedLabel}</div>
        </div>
      </div>

      {/* ── Record button ── */}
      <div style={{ padding: '4px 12px 12px', display: 'flex', gap: 8 }}>
        <button
          className={`btn ${sessionStats.isRecording ? 'btn-danger' : 'btn-cyan'}`}
          style={{ flex: 1, height: 52 }}
          onClick={() => setSessionStats(s => ({
            ...s,
            isRecording: !s.isRecording,
            startTime: s.isRecording ? null : Date.now(),
            maxSpeed: s.isRecording ? s.maxSpeed : 0,
            totalDist: s.isRecording ? s.totalDist : 0,
            track: s.isRecording ? s.track : [],
          }))}
        >
          {sessionStats.isRecording ? '⏹ Stop Sessione' : '⏺ Avvia Sessione'}
        </button>
        <button
          className="btn btn-ghost"
          style={{ width: 52, height: 52, padding: 0 }}
          onClick={() => setSessionStats(s => ({ ...s, maxSpeed: 0, totalDist: 0, track: [] }))}
          title="Reset"
        >
          ↺
        </button>
      </div>

      {/* ── Critical maintenance alert ── */}
      {criticalComp && (
        <div style={{ margin: '0 12px 12px', padding: '10px 14px', background: 'rgba(255,179,0,0.08)', border: '1px solid rgba(255,179,0,0.25)', borderRadius: 'var(--r-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--warn)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Manutenzione</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{criticalComp.name}</div>
          </div>
          <div style={{ fontFamily: 'var(--font-hud)', color: criticalComp.pct >= 100 ? 'var(--danger)' : 'var(--warn)', fontSize: '1.1rem', fontWeight: 700 }}>
            {Math.round(criticalComp.pct)}%
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer-banner" style={{ margin: '0 12px 16px', fontSize: '0.62rem' }}>
        ⚠️ Non usare questa app in modo pericoloso durante la guida.
      </div>
    </div>
  );
}

/* ── Haversine distance (km) ── */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
