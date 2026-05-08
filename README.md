# 🏍 WRF Dashboard
### Premium PWA Dashboard · Yamaha WR450F 2017

[![Deploy](https://github.com/lorenzoregazzi2007-bit/WRF/actions/workflows/deploy.yml/badge.svg)](https://github.com/lorenzoregazzi2007-bit/WRF/actions/workflows/deploy.yml)

> Dashboard moto premium installabile su iPhone, ottimizzata per uso in moto, fullscreen, leggibile al sole.

**🌐 Live App:** https://lorenzoregazzi2007-bit.github.io/WRF/

---

## 📱 Funzionalità

### 🚀 Dashboard Speed (schermata principale)
- **Tachimetro GPS** enorme con grafica ad arco SVG animata
- Glow neon dinamico che cambia colore con la velocità (verde → cyan → giallo → rosso)
- Temperatura esterna via **Open-Meteo** (gratuito, no API key)
- Altitudine GPS, direzione cardinale, bussola
- Stato GPS in tempo reale con precisione in metri
- Distanza sessione e velocità massima
- Avviso manutenzione in scadenza sempre visibile
- Pulsante avvia/stop sessione

### 📊 Stats
- Velocità massima, media, distanza, durata
- **Grafico sparkline** velocità sessione
- **Gauge circolari** animati (performance, distanza, durata)
- Storico sessioni con export **JSON**

### ⚡ Ride (Telemetria)
- **Cronometro** con timer giri (lap timer)
- **G-Force** in tempo reale via accelerometro iPhone
- **Inclinazione moto** con gauge visuale animata
- Accelerazione su 3 assi (X, Y, Z)
- Registrazione GPS toggle

### 🗺 Mappa
- **OpenStreetMap** caricato da CDN (nessun bundle extra)
- Tracking GPS in tempo reale con **polyline cyan**
- Marcatore posizione attuale animato
- **Salva "Casa"** e navigazione home
- Export **GPX** del percorso registrato

### 🔧 Garage (Manutenzione)
- 7 componenti moto preconfigurati con intervalli personalizzabili
- Barre di progresso con colori status (ok/warn/critico)
- Contaore digitale con aggiornamento manuale
- Storico manutenzioni completo

### ⚙️ Impostazioni
- Toggle KM/H ↔ MPH
- 3 temi colore (Yamaha Blue, Rally Green, Rally Amber)
- Smoothing GPS toggle
- Modalità Pioggia / Rally
- Reset dati completo

---

## 🛠 Stack Tecnico

| Tool | Uso |
|------|-----|
| React 18 + Vite 5 | Framework + bundler |
| Vanilla CSS | Design system completo |
| Web Geolocation API | GPS velocità + posizione |
| DeviceMotion API | G-force + inclinazione |
| DeviceOrientation API | Bussola |
| Open-Meteo API | Temperatura (gratuito) |
| Leaflet.js (CDN) | Mappa OpenStreetMap |
| localStorage | Persistenza dati offline |
| GitHub Actions | CI/CD automatico |
| GitHub Pages | Hosting gratuito |

---

## 🚀 Deploy & Sviluppo

### Avvia in locale
```bash
npm install
npm run dev
```

### Build produzione
```bash
npm run build
```

### Deploy automatico
Ogni `git push` su `master` triggera GitHub Actions che:
1. Installa dipendenze
2. Fa la build Vite
3. Deploya su GitHub Pages

---

## 📲 Installazione su iPhone

1. Apri **Safari** → `https://lorenzoregazzi2007-bit.github.io/WRF/`
2. Tap **Condividi** → **Aggiungi a schermata Home**
3. L'app si apre in **fullscreen standalone** come app nativa

---

## ⚙️ Struttura Progetto

```
WRF/
├── public/
│   ├── manifest.json        # PWA manifest
│   └── icons/               # Icone app
├── src/
│   ├── App.jsx              # Router + stato globale
│   ├── index.css            # Design system completo
│   ├── main.jsx             # Entry point React
│   └── pages/
│       ├── SpeedDashboard.jsx  # Tachimetro GPS principale
│       ├── Stats.jsx           # Statistiche + grafici
│       ├── RidePage.jsx        # Telemetria + cronometro
│       ├── MapPage.jsx         # Mappa OpenStreetMap
│       ├── Garage.jsx          # Manutenzione moto
│       └── SettingsPage.jsx    # Impostazioni
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions auto-deploy
├── vite.config.js
└── index.html               # PWA meta tags
```

---

## ⚠️ Disclaimer

> Non usare questa app in modo pericoloso durante la guida. Rispetta sempre il codice della strada.

---

*WRF Dashboard — Fatto per Yamaha WR450F 2017 · Antigravity AI*
