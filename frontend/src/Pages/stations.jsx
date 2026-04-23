import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Header from '../components/Header'
import StationCard from '../components/StationCard'
import { getDistance } from '../data/stations'
import './stations.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'

// Default location: Maseru centre
const DEFAULT_LAT = -29.6109
const DEFAULT_LNG = 27.5554
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Petrol In' },
  { key: 'top', label: 'Top Rated' },
  { key: 'nearest', label: 'Nearest' },
]

export default function Stations() {
  const [userLat, setUserLat] = useState(DEFAULT_LAT)
  const [userLng, setUserLng] = useState(DEFAULT_LNG)
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)
  const routingControlRef = useRef(null)

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stations')
        if (!response.ok) {
          throw new Error('Unable to fetch station data')
        }
        const data = await response.json()
        setStations(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchStations()
  }, [])

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return // Map already initialized

    const map = L.map('map-container').setView([userLat, userLng], 13)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add user location marker
    L.circleMarker([userLat, userLng], {
      radius: 8,
      fillColor: '#ff5a1f',
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map).bindPopup('Your Location')

    mapRef.current = map
  }, [])

  // Update map when user location changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([userLat, userLng], mapRef.current.getZoom())
      // Update user location marker
      mapRef.current.eachLayer(layer => {
        if (layer instanceof L.CircleMarker && !layer.getPopup()?.getContent().includes('Station')) {
          mapRef.current.removeLayer(layer)
        }
      })
      L.circleMarker([userLat, userLng], {
        radius: 8,
        fillColor: '#ff5a1f',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapRef.current).bindPopup('Your Location')
    }
  }, [userLat, userLng])

  // Update route when selected station changes
  useEffect(() => {
    if (!mapRef.current || selectedId === null) {
      if (routingControlRef.current) {
        mapRef.current.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
      return
    }

    const station = stations.find(s => s.id === selectedId)
    if (!station) return

    // Remove existing routing control
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current)
    }

    // Add new routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLat, userLng),
        L.latLng(station.lat, station.lng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#ff5a1f', opacity: 0.8, weight: 5 }]
      }
    }).addTo(mapRef.current)

    routingControlRef.current = routingControl
  }, [selectedId, stations, userLat, userLng])

  const handleLoadMap = useCallback(() => {
    // Map is now integrated directly
  }, [])

  const stationsWithDistance = useMemo(() => stations.map(s => ({
    ...s,
    distance: parseFloat(getDistance(userLat, userLng, s.lat, s.lng)),
  })), [stations, userLat, userLng])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()

    return stationsWithDistance
      .filter(s => {
        const matchQ = !q || s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q)
        const matchF =
          filter === 'all' ? true :
          filter === 'available' ? s.available :
          filter === 'top' ? s.rating >= 4.2 : true
        return matchQ && matchF
      })
      .sort((a, b) => {
        if (filter === 'nearest') return a.distance - b.distance
        if (filter === 'top') return b.rating - a.rating
        return a.distance - b.distance
      })
  }, [stationsWithDistance, query, filter])

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
      () => alert('Location access denied. Using default Maseru centre.')
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
      <main className="stations-content-layout">
        {/* Left Column: Station List */}
        <section className="stations-panel">
          <div className="hero">
            <div className="hero-tag">Your Local Fuel Now</div>
            <h1>Find the nearest petrol station</h1>
            <p>
              Browse stations and view routes to your destination on the map.
            </p>
          </div>

          <div className="controls">
            <button className="view-go-btn" onClick={handleLocate}>Use Device Location</button>
            <button className="view-go-btn" onClick={() => setSelectedId(null)}>Reset Selection</button>
          </div>

          <div className="search-filter-row">
            <input
              type="text"
              placeholder="Search station or area…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="search-input"
            />
            <div className="filter-buttons">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="results-meta">
            {loading ? 'Loading stations…' : <><strong>{filtered.length}</strong> station{filtered.length === 1 ? '' : 's'} found</>}
          </div>

          <div className="station-list">
            {loading ? (
              <div className="empty-state">Loading station data from the database…</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">No stations match your search.</div>
            ) : (
              filtered.map((station, i) => (
                <StationCard
                  key={station.id}
                  station={station}
                  selected={selectedId === station.id}
                  index={i}
                  onSelect={setSelectedId}
                  onNavigate={handleNavigate}
                />
              ))
            )}
          </div>
        </section>

        {/* Right Column: Map */}
        <section className="map-panel">
          <div id="map-container" className="leaflet-map"></div>
        </section>
      </main>
    </div>
  )
}
