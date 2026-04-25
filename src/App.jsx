import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Clock, FileText } from 'lucide-react';
import './index.css';

// Pages
import Dashboard from './pages/Dashboard';
import Track from './pages/Track';
import Maintenance from './pages/Maintenance';

const initialComponents = [
  { id: 1, name: 'Olio Motore', currentHoursAtLastChange: 0, interval: 5, critical: false },
  { id: 2, name: 'Filtro Olio', currentHoursAtLastChange: 0, interval: 10, critical: true },
  { id: 3, name: 'Filtro Aria', currentHoursAtLastChange: 0, interval: 5, critical: false },
  { id: 4, name: 'Gioco Valvole', currentHoursAtLastChange: 0, interval: 30, critical: true },
  { id: 5, name: 'Pistone', currentHoursAtLastChange: 0, interval: 100, critical: true },
];

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/track', icon: Clock, label: 'Contaore' },
    { path: '/maintenance', icon: Wrench, label: 'Garage' }
  ];

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '480px', margin: '0 auto', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)', padding: '12px 24px', display: 'flex', justifyContent: 'space-around', zIndex: 100 }}>
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.path} to={item.path} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: isActive ? 'var(--yamaha-blue-light)' : 'var(--text-muted)' }}>
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: '0.7rem', fontWeight: isActive ? '600' : '400' }}>{item.label}</span>
          </Link>
        )
      })}
    </div>
  );
};

function App() {
  const [currentHours, setCurrentHours] = useState(() => {
    return Number(localStorage.getItem('wrf_currentHours')) || 0;
  });

  const [components, setComponents] = useState(() => {
    const saved = localStorage.getItem('wrf_components');
    if (saved) return JSON.parse(saved);
    return initialComponents;
  });

  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem('wrf_logs');
    if (savedLogs) return JSON.parse(savedLogs);
    return [];
  });

  useEffect(() => {
    localStorage.setItem('wrf_currentHours', currentHours.toString());
  }, [currentHours]);

  useEffect(() => {
    localStorage.setItem('wrf_components', JSON.stringify(components));
  }, [components]);

  useEffect(() => {
    localStorage.setItem('wrf_logs', JSON.stringify(logs));
  }, [logs]);

  const handleUpdateHours = (hours) => {
    setCurrentHours(Number(hours));
  };

  const handleMarkDone = (id) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;

    // Aggiungi al log
    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString('it-IT'),
      componentName: comp.name,
      hours: currentHours
    };
    
    setLogs([newLog, ...logs]);

    // Aggiorna componenti
    setComponents(components.map(c => 
      c.id === id ? { ...c, currentHoursAtLastChange: currentHours } : c
    ));
  };

  return (
    <Router>
      <div className="app-container">
        <header className="top-header">
          <h2 style={{ fontFamily: 'Outfit', fontWeight: '800' }}>WR450<span style={{ color: 'var(--yamaha-blue)' }}>APP</span></h2>
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<Dashboard currentHours={currentHours} components={components} />} />
            <Route path="/track" element={<Track currentHours={currentHours} handleUpdateHours={handleUpdateHours} />} />
            <Route path="/maintenance" element={<Maintenance currentHours={currentHours} components={components} handleMarkDone={handleMarkDone} logs={logs} />} />
          </Routes>
        </main>
        
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
