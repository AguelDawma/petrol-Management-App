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
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const mapRef = useRef(null)
  const routingControlRef = useRef(null)
  const watchIdRef = useRef(null)

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

  // Request user location immediately on page load
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setLocationLoading(false)
      },
      err => {
        console.error('Geolocation error:', err)
        setLocationLoading(false)
        // Keep default location if initial request fails
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    )
  }, [])

  // Watch user location continuously for real-time updates
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      pos => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
      },
      err => {
        console.error('Geolocation watch error:', err)
        // Don't show alerts for every error - keep current location
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    )

    watchIdRef.current = watchId

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const handleRate = useCallback(async (stationId, rating) => {
    // Update the station's rating and review count locally
    setStations(prevStations =>
      prevStations.map(station => {
        if (station.id === stationId) {
          const newReviews = station.reviews + 1
          const newRating = ((station.rating * station.reviews) + rating) / newReviews
          return {
            ...station,
            rating: newRating,
            reviews: newReviews
          }
        }
        return station
      })
    )
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
      fillColor: '#1f6aff',
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
        fillColor: '#1f66ff',
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
        styles: [{ color: '#06c619', opacity: 0.8, weight: 5 }]
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
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setLocationError(null)
        setLocationLoading(false)
      },
      err => {
        setLocationLoading(false)
        
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('permission-denied')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('unavailable')
        } else if (err.code === err.TIMEOUT) {
          setLocationError('timeout')
        } else {
          setLocationError('unknown')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
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
        {/* Left Column: Map */}
        <section className="map-panel">
          <div id="map-container" className="leaflet-map"></div>
        </section>

        {/* Right Column: Station List */}
        <section className="stations-panel">
          <div className="hero">
            <div className="hero-tag">Your Local Fuel Now</div>
            <h1>Find the nearest petrol station</h1>
            <p>
              Browse stations and view routes to your destination on the map.
            </p>
          </div>

          {locationLoading && (
            <div style={{
              background: 'rgba(44, 157, 100, 0.1)',
              border: '1px solid rgba(44, 157, 100, 0.3)',
              color: '#2c9d64',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              📍 <strong>Detecting your location...</strong> This helps us show nearby stations first.
            </div>
          )}

          {locationError === 'permission-denied' && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              <strong>📍 Location Permission Denied</strong><br/>
              Please enable location access in your browser:<br/>
              <strong>Chrome:</strong> Settings → Privacy and security → Site settings → Location<br/>
              <strong>Firefox:</strong> Settings → Privacy → Permissions → Location<br/>
              <strong>Safari:</strong> Settings → Privacy → Allow location access
            </div>
          )}

          {locationError === 'timeout' && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem'
            }}>
              ⏱️ <strong>Location request timed out.</strong> Make sure your device's GPS is enabled and try again.
            </div>
          )}

          {locationError === 'unavailable' && (
            <div style={{
              background: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem'
            }}>
              📍 <strong>Location information unavailable.</strong> Please check your GPS connection and try again.
            </div>
          )}

          {!locationLoading && !locationError && (userLat === DEFAULT_LAT && userLng === DEFAULT_LNG) && (
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              color: '#f59e0b',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem'
            }}>
              ⚠️ <strong>Using default location</strong> - Click "Use Device Location" to see stations near you.
            </div>
          )}

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
                  onRate={handleRate}
                />
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
