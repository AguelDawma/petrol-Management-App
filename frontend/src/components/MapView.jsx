import { useEffect, useRef, useState } from 'react'
import styles from './MapView.module.css'

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0D0D14' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0D14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6B6B7A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1A1A24' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#1E1E2C' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#222232' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#12121A' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0F1A12' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#060610' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#101018' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2A2A3A' }] },
]

export default function MapView({ stations, selectedId, userLat, userLng, mapLoaded, onSelectStation }) {
  const mapRef    = useRef(null)
  const mapObj    = useRef(null)
  const markers   = useRef([])
  const userMark  = useRef(null)
  const [status, setStatus] = useState(null)

  // Show temporary status message
  const showStatus = (msg, duration = 3500) => {
    setStatus(msg)
    setTimeout(() => setStatus(null), duration)
  }

  // Init map once Google Maps is loaded
  useEffect(() => {
    if (!mapLoaded || !window.google) return
    if (mapObj.current) return // already initted

    mapObj.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: userLat, lng: userLng },
      zoom: 12,
      styles: MAP_STYLES,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    showStatus('✅ Map loaded — click a marker to see details')
  }, [mapLoaded])

  // Place/update station markers
  useEffect(() => {
    if (!mapObj.current || !window.google) return

    // Clear old markers
    markers.current.forEach(m => m.setMap(null))
    markers.current = []

    stations.forEach(s => {
      const isSelected = s.id === selectedId

      const marker = new window.google.maps.Marker({
        position: { lat: s.lat, lng: s.lng },
        map: mapObj.current,
        title: s.name,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z',
          fillColor: s.available ? '#FF4500' : '#444455',
          fillOpacity: 1,
          strokeColor: isSelected ? '#FFD600' : (s.available ? '#FF7744' : '#333344'),
          strokeWeight: isSelected ? 2.5 : 1,
          scale: isSelected ? 2 : 1.6,
          anchor: new window.google.maps.Point(12, 22),
        },
        zIndex: isSelected ? 20 : s.available ? 10 : 5,
      })

      // Info window
      const starsStr = '★'.repeat(Math.round(s.rating)) + '☆'.repeat(5 - Math.round(s.rating))
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family:'DM Sans',sans-serif;background:#111117;color:#F2EFE9;
                      padding:14px;border-radius:12px;min-width:210px;
                      border:1px solid rgba(255,255,255,0.07)">
            <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:0.95rem;margin-bottom:3px">
              ${s.name}
            </div>
            <div style="font-size:0.68rem;color:#888896;margin-bottom:10px">${s.address}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
              <span style="color:#FFD600;font-size:0.9rem">${starsStr}</span>
              <strong style="font-size:0.88rem">${s.rating.toFixed(1)}</strong>
              <span style="color:#888896;font-size:0.68rem">(${s.reviews} reviews)</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <span style="font-size:0.72rem;font-weight:600;color:${s.available ? '#00C853' : '#FF3D3D'}">
                ${s.available ? '● Petrol Available' : '● No Petrol'}
              </span>
              ${s.price ? `<span style="color:#FF4500;font-weight:700;font-size:0.9rem">₦${s.price}/L</span>` : ''}
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}"
               target="_blank"
               style="display:block;background:#FF4500;color:white;text-align:center;
                      text-decoration:none;padding:7px;border-radius:8px;
                      font-size:0.75rem;font-weight:600">
              🗺 Get Directions
            </a>
          </div>`,
        pixelOffset: new window.google.maps.Size(0, -8),
      })

      marker.addListener('click', () => {
        // Close all open windows
        markers.current.forEach(m => m._iw && m._iw.close())
        infoWindow.open(mapObj.current, marker)
        marker._iw = infoWindow
        onSelectStation(s.id)
      })

      marker._iw = null
      markers.current.push(marker)
    })
  }, [stations, selectedId, mapLoaded])

  // Pan to selected station
  useEffect(() => {
    if (!mapObj.current || !selectedId) return
    const s = stations.find(x => x.id === selectedId)
    if (s) {
      mapObj.current.panTo({ lat: s.lat, lng: s.lng })
      mapObj.current.setZoom(15)
    }
  }, [selectedId])

  // Update user marker
  useEffect(() => {
    if (!mapObj.current || !window.google) return
    if (userMark.current) userMark.current.setMap(null)
    userMark.current = new window.google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map: mapObj.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2.5,
      },
      zIndex: 999,
    })
    mapObj.current.panTo({ lat: userLat, lng: userLng })
    showStatus('📍 Your location updated')
  }, [userLat, userLng, mapLoaded])

  return (
    <div className={styles.wrap}>
      {/* Map placeholder (before API key) */}
      {!mapLoaded && (
        <div className={styles.placeholder}>
          <div className={styles.grid} />
          <div className={styles.icon}>🗺</div>
          <div className={styles.placeholderText}>
            <h3>Interactive Map</h3>
            <p>Enter your Google Maps API Key above and click <strong>Load Map</strong> to activate live station markers.</p>
          </div>
          <div className={styles.steps}>
            {[
              ['1', 'Go to console.cloud.google.com'],
              ['2', 'Enable Maps JavaScript API'],
              ['3', 'Credentials → Create API Key'],
              ['4', 'Paste key & click Load Map'],
            ].map(([n, t]) => (
              <div key={n} className={styles.step}>
                <span className={styles.stepNum}>{n}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actual map div */}
      <div ref={mapRef} className={styles.map} />

      {/* Status toast */}
      {status && (
        <div className={styles.toast}>{status}</div>
      )}
    </div>
  )
}
