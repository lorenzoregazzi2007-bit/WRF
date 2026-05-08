import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './index.css';
import SpeedDashboard from './pages/SpeedDashboard';
import Stats from './pages/Stats';
import RidePage from './pages/RidePage';
import MapPage from './pages/MapPage';
import Garage from './pages/Garage';
import SettingsPage from './pages/SettingsPage';

const INITIAL_COMPONENTS = [
  { id: 1, name: 'Olio Motore',     hoursAtLastChange: 0, interval: 5,   critical: false },
  { id: 2, name: 'Filtro Olio',     hoursAtLastChange: 0, interval: 10,  critical: true  },
  { id: 3, name: 'Filtro Aria',     hoursAtLastChange: 0, interval: 5,   critical: false },
  { id: 4, name: 'Gioco Valvole',   hoursAtLastChange: 0, interval: 30,  critical: true  },
  { id: 5, name: 'Pistone',         hoursAtLastChange: 0, interval: 100, critical: true  },
  { id: 6, name: 'Candela',         hoursAtLastChange: 0, interval: 20,  critical: false },
  { id: 7, name: 'Catena/Pignone',  hoursAtLastChange: 0, interval: 25,  critical: false },
];

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}

const NavIcon = ({ d, viewBox = "0 0 24 24" }) => (
  <svg width="22" height="22" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const NAV_ITEMS = [
  { path: '/',       label: 'Speed',  d: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 0v10l4 2' },
  { path: '/stats',  label: 'Stats',  d: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { path: '/ride',   label: 'Ride',   d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { path: '/map',    label: 'Mappa',  d: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6zm6-3v15m6-12v15' },
  { path: '/garage', label: 'Garage', d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' },
];

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ path, label, d }) => (
        <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <div className="nav-icon-wrap"><NavIcon d={d} /></div>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default function App() {
  const [engineHours, setEngineHours] = useLocalState('wrf_hours', 0);
  const [components,  setComponents]  = useLocalState('wrf_components', INITIAL_COMPONENTS);
  const [logs,        setLogs]        = useLocalState('wrf_logs', []);
  const [settings,    setSettings]    = useLocalState('wrf_settings', {
    unit: 'kmh', theme: 'blue', autoNight: true, keepScreen: true, smoothing: true,
  });
  const [sessionStats, setSessionStats] = useState({
    maxSpeed: 0, totalDist: 0, startTime: null, isRecording: false, track: [],
  });

  const handleMarkDone = (id) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;
    setLogs(p => [{ id: Date.now(), date: new Date().toLocaleDateString('it-IT'), componentName: comp.name, hours: engineHours }, ...p]);
    setComponents(p => p.map(c => c.id === id ? { ...c, hoursAtLastChange: engineHours } : c));
  };

  const handleUpdateInterval = (id, val) => {
    setComponents(p => p.map(c => c.id === id ? { ...c, interval: Number(val) } : c));
  };

  return (
    <Router>
      <div className="app-shell">
        <div className="app-body">
          <Routes>
            <Route path="/"       element={<SpeedDashboard settings={settings} sessionStats={sessionStats} setSessionStats={setSessionStats} components={components} engineHours={engineHours} />} />
            <Route path="/stats"  element={<Stats sessionStats={sessionStats} />} />
            <Route path="/ride"   element={<RidePage sessionStats={sessionStats} setSessionStats={setSessionStats} />} />
            <Route path="/map"    element={<MapPage sessionStats={sessionStats} />} />
            <Route path="/garage" element={<Garage engineHours={engineHours} setEngineHours={setEngineHours} components={components} handleMarkDone={handleMarkDone} handleUpdateInterval={handleUpdateInterval} logs={logs} setLogs={setLogs} />} />
            <Route path="/settings" element={<SettingsPage settings={settings} setSettings={setSettings} />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}
