import { useEffect, useRef, useState } from 'react';

/* ── MapPage with Leaflet loaded via CDN ── */
export default function MapPage({ sessionStats }) {
  const mapRef    = useRef(null);
  const leafRef   = useRef(null);  // L (leaflet instance)
  const mapInst   = useRef(null);  // map instance
  const markerRef = useRef(null);
  const polyRef   = useRef(null);
  const posRef    = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [home, setHome]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('wrf_home') || 'null'); } catch { return null; }
  });
  const [tracking, setTracking]     = useState(false);
  const [trackPts, setTrackPts]     = useState([]);
  const watchId = useRef(null);

  /* ── Load Leaflet from CDN ── */
  useEffect(() => {
    if (window.L) { leafRef.current = window.L; initMap(); return; }

    // CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => { leafRef.current = window.L; initMap(); };
    document.head.appendChild(script);

    return () => {
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  function initMap() {
    if (mapInst.current || !mapRef.current) return;
    const L = leafRef.current;

    mapInst.current = L.map(mapRef.current, {
      center: [44.4, 8.9], zoom: 13,
      zoomControl: false, attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(mapInst.current);

    L.control.zoom({ position: 'bottomright' }).addTo(mapInst.current);
    setMapReady(true);

    // Center on user
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      mapInst.current.setView([lat, lng], 15);
      updateMarker(lat, lng);
      posRef.current = { lat, lng };
    }, () => {}, { enableHighAccuracy: true });
  }

  function updateMarker(lat, lng) {
    const L = leafRef.current;
    if (!L || !mapInst.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        html: `<div style="width:16px;height:16px;background:#00D4FF;border-radius:50%;border:3px solid white;box-shadow:0 0 12px #00D4FF"></div>`,
        className: '', iconSize: [16, 16], iconAnchor: [8, 8],
      });
      markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInst.current);
    }
  }

  /* ── Start/Stop tracking ── */
  const startTracking = () => {
    setTracking(true);
    setTrackPts([]);
    if (polyRef.current && mapInst.current) mapInst.current.removeLayer(polyRef.current);
    watchId.current = navigator.geolocation.watchPosition((pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      posRef.current = { lat, lng };
      updateMarker(lat, lng);
      setTrackPts(pts => {
        const newPts = [...pts, [lat, lng]];
        if (leafRef.current && mapInst.current) {
          if (polyRef.current) mapInst.current.removeLayer(polyRef.current);
          polyRef.current = leafRef.current.polyline(newPts, { color: '#00D4FF', weight: 3, opacity: 0.8 }).addTo(mapInst.current);
          mapInst.current.setView([lat, lng]);
        }
        return newPts;
      });
    }, () => {}, { enableHighAccuracy: true, maximumAge: 2000 });
  };

  const stopTracking = () => {
    setTracking(false);
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
  };

  const goHome = () => {
    if (home && mapInst.current) {
      mapInst.current.setView([home.lat, home.lng], 15);
    }
  };

  const saveHome = () => {
    if (posRef.current) {
      localStorage.setItem('wrf_home', JSON.stringify(posRef.current));
      setHome(posRef.current);
    }
  };

  const centerOnMe = () => {
    if (posRef.current && mapInst.current) {
      mapInst.current.setView([posRef.current.lat, posRef.current.lng], 16);
    }
  };

  /* ── GPX Export ── */
  const exportGPX = () => {
    if (trackPts.length === 0) return;
    const trkpts = trackPts.map(([lat, lon]) =>
      `<trkpt lat="${lat.toFixed(6)}" lon="${lon.toFixed(6)}"></trkpt>`
    ).join('\n');
    const gpx = `<?xml version="1.0"?><gpx version="1.1" creator="WRF Dashboard"><trk><name>WRF Ride</name><trkseg>${trkpts}</trkseg></trk></gpx>`;
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `wrf_ride_${Date.now()}.gpx`; a.click();
  };

  return (
    <div className="page" style={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 8px', background: 'var(--bg-dark)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div className="hud-label" style={{ color: 'var(--cyan)', marginBottom: 2 }}>OpenStreetMap</div>
        <h1 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.3rem', color: 'var(--text-primary)', lineHeight: 1 }}>Mappa</h1>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ flex: 1, minHeight: 280 }} />

      {/* Controls */}
      <div style={{ padding: 12, background: 'var(--bg-dark)', flexShrink: 0, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <button className={`btn ${tracking ? 'btn-danger' : 'btn-cyan'}`} style={{ height: 46 }}
            onClick={tracking ? stopTracking : startTracking}>
            {tracking ? '⏹ Stop Track' : '⏺ Registra'}
          </button>
          <button className="btn btn-ghost" style={{ height: 46 }} onClick={centerOnMe}>📍 Centra</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <button className="btn btn-ghost" style={{ height: 42, fontSize: '0.8rem' }} onClick={saveHome}>🏠 Salva Casa</button>
          <button
            onClick={goHome}
            disabled={!home}
            style={{ height: 42, fontSize: '0.8rem', opacity: home ? 1 : 0.4, background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', cursor: home ? 'pointer' : 'default' }}
          >
            🧭 Casa
          </button>
          <button
            onClick={exportGPX}
            disabled={trackPts.length === 0}
            style={{ height: 42, fontSize: '0.8rem', opacity: trackPts.length > 0 ? 1 : 0.4, background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', cursor: trackPts.length > 0 ? 'pointer' : 'default' }}
          >
            ⬇ GPX
          </button>
        </div>

        {tracking && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="rec-dot" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{trackPts.length} punti registrati</span>
          </div>
        )}
      </div>
    </div>
  );
}
