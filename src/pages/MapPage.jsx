import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchLiveWeather } from '../services/weather';
import { supabase, supabaseAuth } from '../lib/supabaseClient';
import { MapPin, CloudSun, Compass, ShieldAlert, ArrowRight, Calendar, Clock, CheckCircle2, AlertCircle, LogOut, Shield } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import NavBar from '../components/NavBar';
import CreatePostModal from '../components/CreatePostModal';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const tealIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const ALL_29_LOCATIONS = [
  { id: '1', name: "Calangute Beach", type: "Hotspot", lat: 15.5494, lng: 73.7626, capacity: 6000 },
  { id: '2', name: "Baga Beach", type: "Hotspot", lat: 15.5523, lng: 73.7517, capacity: 5000 },
  { id: '3', name: "Anjuna Beach", type: "Hotspot", lat: 15.5819, lng: 73.7430, capacity: 4500 },
  { id: '4', name: "Dudhsagar Falls", type: "Hotspot", lat: 15.3144, lng: 74.3143, capacity: 2000 },
  { id: '5', name: "Basilica of Bom Jesus", type: "Hotspot", lat: 15.5009, lng: 73.9116, capacity: 3000 },
  { id: '6', name: "Fort Aguada & Lighthouse", type: "Hotspot", lat: 15.4925, lng: 73.7738, capacity: 2500 },
  { id: '7', name: "Palolem Beach", type: "Hotspot", lat: 15.0100, lng: 74.0232, capacity: 4000 },
  { id: '8', name: "Morjim and Ashwem Beaches", type: "Hotspot", lat: 15.6174, lng: 73.7337, capacity: 3500 },
  { id: '9', name: "Dona Paula", type: "Hotspot", lat: 15.4549, lng: 73.8058, capacity: 2000 },
  { id: '10', name: "Mandovi River cruise", type: "Hotspot", lat: 15.5029, lng: 73.8340, capacity: 1500 },
  { id: '11', name: "Chapora Fort", type: "Hotspot", lat: 15.6056, lng: 73.7368, capacity: 2000 },
  { id: '12', name: "Se Cathedral", type: "Hotspot", lat: 15.5034, lng: 73.9121, capacity: 2500 },
  { id: '13', name: "Vagator Beach", type: "Hotspot", lat: 15.6030, lng: 73.7336, capacity: 4000 },
  { id: '14', name: "Butterfly Beach Goa", type: "Hidden Gem", lat: 15.0066, lng: 73.9785, capacity: 500 },
  { id: '15', name: "Galgibaga Beach", type: "Hidden Gem", lat: 14.9818, lng: 74.0456, capacity: 500 },
  { id: '16', name: "Divar Island", type: "Hidden Gem", lat: 15.5173, lng: 73.8860, capacity: 800 },
  { id: '17', name: "Cabo de Rama Fort", type: "Hidden Gem", lat: 15.0884, lng: 73.9213, capacity: 600 },
  { id: '18', name: "Netravali Bubbling Lake", type: "Hidden Gem", lat: 15.1051, lng: 74.2045, capacity: 300 },
  { id: '19', name: "Harvalem Waterfalls", type: "Hidden Gem", lat: 15.5510, lng: 74.0253, capacity: 400 },
  { id: '20', name: "Chorla Ghat", type: "Hidden Gem", lat: 15.6321, lng: 74.1205, capacity: 800 },
  { id: '21', name: "Cola Beach", type: "Hidden Gem", lat: 15.0506, lng: 73.9686, capacity: 500 },
  { id: '22', name: "Fontainhas", type: "Hidden Gem", lat: 15.4989, lng: 73.8282, capacity: 1000 },
  { id: '23', name: "Kadamba Shri Mahadeva Temple", type: "Hidden Gem", lat: 15.4387, lng: 74.2285, capacity: 300 },
  { id: '24', name: "Kakolem Beach", type: "Hidden Gem", lat: 15.0740, lng: 73.9405, capacity: 400 },
  { id: '25', name: "Tambdi Surla Temple & Falls", type: "Hidden Gem", lat: 15.4363, lng: 74.2505, capacity: 300 },
  { id: '26', name: "Agonda Beach", type: "Hidden Gem", lat: 15.0416, lng: 73.9880, capacity: 1000 },
  { id: '27', name: "Colva Beach", type: "Hidden Gem", lat: 15.2758, lng: 73.9168, capacity: 1500 },
  { id: '28', name: "Sada Waterfalls", type: "Hidden Gem", lat: 15.3999, lng: 74.1309, capacity: 400 },
  { id: '29', name: "Spice farms near Ponda", type: "Hidden Gem", lat: 15.4011, lng: 74.0152, capacity: 800 }
];

export default function MapPage() {
  console.log("AURA MapPage Rendered with SOS Beacon");
  const [locations, setLocations] = useState(ALL_29_LOCATIONS);
  const [selectedLocId, setSelectedLocId] = useState(ALL_29_LOCATIONS[0].id);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('10');
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [crowdStatus, setCrowdStatus] = useState(null);
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const [safeMessage, setSafeMessage] = useState(false);
  const [gemData, setGemData] = useState(null);
  const [fallbackMsg, setFallbackMsg] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [sosConfirmed, setSosConfirmed] = useState(false);
  const [dragX, setDragX] = useState(0);

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const gemMarkerRef = useRef(null);
  const sosChannelRef = useRef(null); // Keep channel alive

  const purgeMapRoutes = () => {
    if (gemMarkerRef.current && mapRef.current) { mapRef.current.removeLayer(gemMarkerRef.current); gemMarkerRef.current = null; }
    if (mapRef.current) mapRef.current.eachLayer(layer => { if (layer.options?.isAuraRoute) mapRef.current.removeLayer(layer); });
  };

  const dateOptions = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tz.toISOString().split('T')[0];
  }), []);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  useEffect(() => {
    setSelectedDate(dateOptions[0]);
    const syncDb = async () => {
      const { data, error } = await supabase.from('locations').select('*');
      if (!error && data) {
        const merged = ALL_29_LOCATIONS.map(loc => { const dbLoc = data.find(d => d.name === loc.name); return dbLoc ? { ...loc, id: dbLoc.id, capacity: dbLoc.capacity } : loc; });
        setLocations(merged);
        const baga = merged.find(l => l.name === 'Baga Beach');
        if (baga) setSelectedLocId(baga.id);
      }
    };
    syncDb();
  }, [dateOptions]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabaseAuth.auth.getUser();
      if (user) setUserProfile({ id: user.id, name: user.user_metadata?.username || user.email?.split('@')[0] || 'Tourist', email: user.email, phone: user.user_metadata?.phone_number || 'N/A' });
    };
    init();

    // Initialize SOS Channel immediately on mount
    sosChannelRef.current = supabase.channel('sos-emergency-line');
    sosChannelRef.current.subscribe((status) => {
      console.log("⚡ AURA: Tourist SOS Channel Status:", status);
    });

    return () => {
      if (sosChannelRef.current) supabase.removeChannel(sosChannelRef.current);
    };
  }, []);
  
  const confirmSOS = async () => {
    console.log("🆘 TRIGGERING SOS BEACON...");
    setSosConfirmed(true);
    setTimeout(() => setShowSOSModal(false), 500);

    // 1. Multi-Format Realtime Broadcast (Try sending via multiple patterns)
    try {
      if (sosChannelRef.current) {
        const payload = { 
          location_name: selectedLoc?.name || 'Unknown',
          timestamp: new Date().toISOString()
        };
        
        console.log("🛰️ SENDING SOS TRIPLE-PULSE...");

        // Pattern A: Standard Broadcast
        sosChannelRef.current.send({
          type: 'broadcast',
          event: 'emergency',
          payload: payload
        });

        // Pattern B: Flat Broadcast
        sosChannelRef.current.send({
          event: 'emergency',
          payload: payload
        });

        // Pattern C: Notification Wrapper
        sosChannelRef.current.send({
          type: 'broadcast',
          event: 'emergency',
          payload: { data: payload }
        });

        alert("🚨 SOS SIGNAL DISPATCHED TO HQ! (Waiting for Response)");
      } else {
        alert("❌ EMERGENCY CHANNEL OFFLINE! Retrying...");
      }
    } catch (e) { console.error("Broadcast failed:", e); }

    // 2. Database Backup (Permanent record)
    try {
      const { error } = await supabase.from('sos_alerts').insert({
        location_id: Number(selectedLocId),
        location_name: selectedLoc?.name || 'Unknown',
        status: 'active'
      });
      if (error) console.error("❌ SOS DB INSERT FAILED:", error);
      else console.log("✅ SOS DATABASE LOG CREATED!");
    } catch (err) { console.error("SOS DB Exception:", err); }
  };

  const selectedLoc = locations.find(l => l.id === selectedLocId);

  useEffect(() => {
    purgeMapRoutes(); setCrowdStatus(null); setShowNudgeModal(false);
    setSafeMessage(false); setFallbackMsg(''); setClaimed(false); setGemData(null); setRouteError(false);
  }, [selectedLocId, selectedDate, selectedHour]);

  useEffect(() => {
    if (!selectedLoc) return;
    fetchLiveWeather(selectedLoc.lat, selectedLoc.lng).then(setWeather);
    if (!mapRef.current && mapContainer.current) {
      mapRef.current = L.map(mapContainer.current).setView([selectedLoc.lat, selectedLoc.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(mapRef.current);
      markerRef.current = L.marker([selectedLoc.lat, selectedLoc.lng], { icon: tealIcon }).bindTooltip(`<b>${selectedLoc.name}</b>`, { permanent: true, direction: 'top', offset: [0, -35] }).addTo(mapRef.current);
    } else if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo([selectedLoc.lat, selectedLoc.lng], 13);
      markerRef.current.setLatLng([selectedLoc.lat, selectedLoc.lng]);
      markerRef.current.setTooltipContent(`<b>${selectedLoc.name}</b>`);
    }
  }, [selectedLoc]);

  useEffect(() => {
    if (claimed && selectedLoc && gemData && mapRef.current) {
      const fetchRoute = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${selectedLoc.lng},${selectedLoc.lat};${gemData.lng},${gemData.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url); const data = await res.json();
          if (data.code === "NoRoute" || !data.routes?.length) {
            setRouteError(true); setTimeout(() => setShowNudgeModal(false), 3000);
            if (!gemMarkerRef.current) gemMarkerRef.current = L.marker([gemData.lat, gemData.lng], { icon: orangeIcon }).addTo(mapRef.current);
            mapRef.current.fitBounds([[selectedLoc.lat, selectedLoc.lng], [gemData.lat, gemData.lng]], { padding: [80, 80], duration: 1.5 }); return;
          }
          purgeMapRoutes();
          gemMarkerRef.current = L.marker([gemData.lat, gemData.lng], { icon: orangeIcon }).bindTooltip(`<b style="color:#ea580c">${gemData.name}</b>`, { permanent: true, direction: 'top', offset: [0, -35] }).addTo(mapRef.current);
          L.geoJSON(data.routes[0].geometry, { style: { color: 'var(--accent-orange)', weight: 6, opacity: 0.8 }, isAuraRoute: true }).addTo(mapRef.current);
          mapRef.current.fitBounds([[selectedLoc.lat, selectedLoc.lng], [gemData.lat, gemData.lng]], { padding: [80, 80], duration: 1.5 });
          setTimeout(() => setShowNudgeModal(false), 2500);
        } catch (err) { console.error(err); setRouteError(true); setTimeout(() => setShowNudgeModal(false), 2500); }
      };
      fetchRoute();
    }
  }, [claimed, selectedLoc, gemData]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371, x = (lat2 - lat1) * Math.PI / 180, y = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(x / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(y / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleCheckAvailability = async () => {
    setIsLoading(true); setCrowdStatus(null); setShowNudgeModal(false); setSafeMessage(false); setGemData(null); setFallbackMsg(''); setRouteError(false);
    if (!selectedLoc) { setIsLoading(false); return; }
    let activeVisitors = null;
    try {
      const formattedDate = selectedDate, formattedHour = parseInt(selectedHour, 10);
      try {
        const { data: forecast, error } = await supabase.from('forecasts').select('predicted_visitors').eq('location_id', selectedLocId).eq('forecast_date', formattedDate).eq('hour', formattedHour).maybeSingle();
        if (!error && forecast?.predicted_visitors !== undefined) activeVisitors = forecast.predicted_visitors;
      } catch (e) { console.warn("Supabase bypassed:", e); }
      if (activeVisitors === null) {
        const maxCap = selectedLoc.capacity, peak = 16, dist = Math.abs(formattedHour - peak);
        let base = maxCap * 0.95 - dist * maxCap * 0.07; if (base < 200) base = 200;
        const stableSeed = new Date(formattedDate).getTime();
        let nameHash = 0; for (let i = 0; i < selectedLoc.name.length; i++) { nameHash = (nameHash << 5) - nameHash + selectedLoc.name.charCodeAt(i); nameHash |= 0; } nameHash = Math.abs(nameHash);
        const pr = Math.sin(stableSeed + formattedHour + nameHash) * 10000; const rand = pr - Math.floor(pr);
        base += rand * maxCap * 0.16 - maxCap * 0.08;
        const d = new Date(formattedDate).getDay(); if ([0, 5, 6].includes(d)) base *= 1.25;
        activeVisitors = Math.max(0, Math.floor(base));
      }
      const dangerThreshold = selectedLoc.capacity * 0.8;
      if (activeVisitors >= dangerThreshold) {
        setCrowdStatus('CROWDED');
        const gems = locations.filter(l => l.type === 'Hidden Gem');
        if (gems.length > 0) {
          const sorted = gems.sort((a, b) => getDistance(selectedLoc.lat, selectedLoc.lng, a.lat, a.lng) - getDistance(selectedLoc.lat, selectedLoc.lng, b.lat, b.lng));
          setGemData({ ...sorted[0], distance_km: getDistance(selectedLoc.lat, selectedLoc.lng, sorted[0].lat, sorted[0].lng).toFixed(1) });
        }
        setShowNudgeModal(true);
      } else {
        setCrowdStatus('SAFE'); setSafeMessage(true);
      }
    } catch (err) { setFallbackMsg(`Real-time data syncing. Try a different hour. (${err.message})`); }
    setIsLoading(false);
  };

  return (
    <div className="tourist-app map-page">
      <NavBar onCreatePost={() => setShowPostModal(true)} />

      {/* SOS EMERGENCY BEACON - MOVED TO TOP FOR VISIBILITY */}
      <button 
        id="sos-alive"
        className="sos-fab" 
        onClick={() => !sosConfirmed && setShowSOSModal(true)}
        disabled={sosConfirmed}
        style={{ 
          position: 'fixed', 
          bottom: '30px', 
          right: '25px', 
          zIndex: 99999, 
          background: '#e11d48',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          border: '4px solid #fff',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        <Shield size={28} />
        <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>{sosConfirmed ? 'ALERTED' : 'SOS'}</span>
      </button>

      {/* HERO SEARCH */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover the <span>Real Goa</span></h1>
          <p>Escape the crowds. Find your pristine paradise.</p>
          <div className="search-bar">
            <div className="search-field">
              <Compass size={20} color="var(--teal-primary)" />
              <select value={selectedLocId} onChange={e => setSelectedLocId(e.target.value)}>
                <optgroup label="Locations">
                  {locations.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </optgroup>
              </select>
            </div>
            <div className="search-field">
              <Calendar size={20} color="var(--teal-primary)" />
              <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
                {dateOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="search-field">
              <Clock size={20} color="var(--teal-primary)" />
              <select value={selectedHour} onChange={e => setSelectedHour(e.target.value)}>
                {hours.map(h => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </div>
            <button className="btn-search" onClick={handleCheckAvailability} disabled={isLoading}>
              {isLoading ? 'Scanning AI Net...' : 'Check Availability'}
            </button>
            <button className="btn-search" onClick={() => supabaseAuth.auth.signOut()} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0 1rem', width: 'auto' }} title="Sign Out">
              <LogOut size={20} />
            </button>
          </div>
          <div style={{ position: 'relative', zIndex: 20, paddingBottom: '2.5rem' }}>
            {fallbackMsg && <div style={{ marginTop: '1.5rem', padding: '1.2rem 1.5rem', background: 'rgba(255,255,255,0.95)', color: 'var(--text-main)', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center', boxShadow: 'var(--shadow-lg)' }}><AlertCircle size={24} color="var(--accent-orange)" /><span>{fallbackMsg}</span></div>}
            {safeMessage && crowdStatus === 'SAFE' && <div className="safe-badge"><CheckCircle2 style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} /> Clear to Visit! Traffic logic reports green.</div>}
          </div>
        </div>
      </section>

      {/* MAP & WEATHER */}
      <main className="main-content">
        <div className="info-grid">
          <div className="card weather-card">
            <h3>Live Destination Intel</h3>
            <div className="weather-widget">
              <CloudSun size={56} color="var(--accent-orange)" />
              <div className="weather-data">
                <div className="temp">{weather ? weather.temp : '--'}°C</div>
                <div className="desc">{weather ? weather.desc : 'Loading weather...'}</div>
                <div className="humid">Humidity: {weather ? weather.humidity : '--'}%</div>
              </div>
            </div>
            <p className="ai-hint">AURA utilizes OpenWeatherMap API layers synced with destination mapping to establish micro-climate intelligence.</p>
          </div>
          <div className="card map-card">
            <div className="map-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <MapPin color="var(--teal-primary)" size={24} />
                <h3 style={{ margin: 0 }}>{selectedLoc?.name} Live Mapping</h3>
              </div>
              <button onClick={() => { if (mapRef.current) { mapRef.current.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true }); mapRef.current.on('locationfound', e => { if (!mapRef.current.userTracker) mapRef.current.userTracker = L.circleMarker(e.latlng, { radius: 8, fillOpacity: 0.9, color: 'white', weight: 2, fillColor: '#3b82f6' }).addTo(mapRef.current); else mapRef.current.userTracker.setLatLng(e.latlng); }); mapRef.current.on('locationerror', () => alert("GPS blocked. Please allow location in browser.")); } }} style={{ background: 'var(--teal-primary)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Compass size={16} /> Real-Time Track
              </button>
            </div>
            <div ref={mapContainer} className="map-container" style={{ height: '400px', width: '100%', borderRadius: '12px' }} />
          </div>
        </div>
      </main>

      {/* NUDGE MODAL */}
      {showNudgeModal && (
        <div className="modal-overlay">
          <div className="nudge-modal sponsored">
            <div className="modal-header">
              <ShieldAlert size={42} color="#22c55e" />
              <h2>⚠️ Protect the Ecosystem & Earn Rewards!</h2>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '1.2rem', margin: '0 0 1.5rem 0' }}>
                <b>{selectedLoc?.name}</b> is currently at critical capacity. 
                Staying here adds significant strain to the local environment.
              </p>
              <div className="offer-box" style={{ borderLeft: '4px solid #fbbf24', background: '#fffbeb' }}>
                <div className="eco-badge-modal">✨ ECO-ACTION OPPORTUNITY</div>
                <div className="offer-title" style={{ color: '#b45309', marginTop: '0.8rem' }}>Claim +500 AURA Coins instantly!</div>
                <p>
                  Help us reduce footfall by visiting <b>{gemData?.name || 'a nearby Hidden Gem'}</b> (just {gemData?.distance_km || ''} km away) right now. 
                  We will instantly credit your wallet with <b>500 AURA Coins!</b>
                </p>
                {routeError && <p style={{ color: 'var(--accent-red)', fontWeight: 600, marginTop: '1rem', padding: '0.8rem', background: '#ffebeb', borderRadius: '8px' }}>Map engine unable to source driving roads. Bypassing route trace.</p>}
              </div>
              
              <div className="sponsor-banner">
                <span style={{ opacity: 0.7 }}>Powered by</span>
                <div className="sponsor-logo-grid">
                  <strong>Goa Tourism Board</strong>
                  <span>|</span>
                  <span style={{ fontStyle: 'italic' }}>Local Eco-Partners</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-accept" style={{ background: '#22c55e' }} onClick={() => setClaimed(true)} disabled={claimed}>
                {claimed && !routeError ? '✨ Rewards Credited! Plotting Route...' : 'Accept Reroute & Claim +500 Coins'} 
                {claimed && !routeError ? '' : <ArrowRight size={20} />}
              </button>
              {!claimed && <button className="btn-dismiss" onClick={() => setShowNudgeModal(false)}>No thanks, I'll stay here</button>}
            </div>
          </div>
        </div>
      )}

      {showPostModal && <CreatePostModal userProfile={userProfile} onClose={() => setShowPostModal(false)} onPosted={() => setShowPostModal(false)} />}

      {showSOSModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="sos-modal">
            <Shield size={48} color="#e11d48" style={{ marginBottom: '1rem' }} />
            <h2>Emergency Beacon</h2>
            <p>Are you in a dangerous crowd crush or medical emergency? Slide to notify authorities at <strong>{selectedLoc?.name}</strong>.</p>
            
            <div className="slide-confirm-container">
              <div className="slide-text">Slide to Confirm</div>
              <div 
                className="slide-handle"
                style={{ transform: `translateX(${dragX}px)` }}
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const handleMove = (moveEvent) => {
                    const delta = Math.max(0, Math.min(moveEvent.clientX - startX, 280));
                    setDragX(delta);
                    if (delta >= 270) {
                      confirmSOS();
                      cleanup();
                    }
                  };
                  const cleanup = () => {
                    window.removeEventListener('mousemove', handleMove);
                    window.removeEventListener('mouseup', cleanup);
                  };
                  window.addEventListener('mousemove', handleMove);
                  window.addEventListener('mouseup', cleanup);
                }}
              >
                <ArrowRight size={24} />
              </div>
            </div>
            
            <button className="btn-sos-cancel" onClick={() => {
              if (sosChannelRef.current) {
                sosChannelRef.current.send({ type: 'broadcast', event: 'ping', payload: {} });
                console.log("🏓 PING SENT");
              }
            }} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid #3b82f6', marginBottom: '8px' }}>
              Test Connection (Officer Ping)
            </button>
            <button className="btn-sos-cancel" onClick={() => { setShowSOSModal(false); setDragX(0); }}>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

