import { useState, useCallback } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MapView from '../components/MapView'
import { stations as rawStations, getDistance } from '../data/stations'
import './stations.css'

// Default location: Lagos centre
const DEFAULT_LAT = 6.4550
const DEFAULT_LNG = 3.3850

export default function Stations() {
  const [userLat, setUserLat] = useState(DEFAULT_LAT)
  const [userLng, setUserLng] = useState(DEFAULT_LNG)
  const [selectedId, setSelectedId] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const stations = rawStations.map(s => ({
    ...s,
    distance: parseFloat(getDistance(userLat, userLng, s.lat, s.lng)),
  }))

  const handleLoadMap = useCallback((apiKey) => {
    if (!apiKey.trim()) {
      alert('Please enter your Google Maps API Key first.')
      return
    }
    if (window.google) {
      setMapLoaded(true)
      return
    }

    window.initMap = () => setMapLoaded(true)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
    script.async = true
    script.onerror = () => alert('Failed to load Google Maps. Check your API key and billing.')
    document.head.appendChild(script)
  }, [])

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
      },
      () => alert('Location access denied. Using default Lagos centre.')
    )
  }, [])

  const handleNavigate = useCallback(station => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`,
      '_blank'
    )
  }, [])

  return (
    <div className="stations-page">
      <Header onLoadMap={handleLoadMap} onLocate={handleLocate} />
      <main className="stations-content">
        <section className="stations-panel">
          <div className="hero">
            <div className="hero-tag">Your Local Fuel Now</div>
            <h1>Find the nearest petrol station in seconds</h1>
            <p>
              Use the map and station list to locate nearest stations, compare availability and prices, then
              navigate with one click.
            </p>
          </div>
          <div className="controls">
            <button className="view-go-btn" onClick={handleLocate}>Use Device Location</button>
            <button className="view-go-btn" onClick={() => setSelectedId(null)}>Reset Selection</button>
          </div>
          <div className="results-meta">
            <strong>{stations.length}</strong> stations found
          </div>
          <Sidebar
            stations={stations}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onNavigate={handleNavigate}
          />
        </section>
        <section className="stations-map">
          <MapView
            stations={stations}
            selectedId={selectedId}
            userLat={userLat}
            userLng={userLng}
            mapLoaded={mapLoaded}
            onSelectStation={setSelectedId}
          />
        </section>
      </main>
    </div>
  )
}
