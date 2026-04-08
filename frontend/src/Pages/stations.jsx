import { useState, useEffect, useMemo, useCallback } from 'react'
import Header from '../components/Header'
import StationCard from '../components/StationCard'
import { getDistance } from '../data/stations'
import './stations.css'

// Default location: Lagos centre
const DEFAULT_LAT = 6.4550
const DEFAULT_LNG = 3.3850
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

  const handleLoadMap = useCallback(() => {
    // Map is not used in the full-page stations layout.
    alert('Map view is disabled for this layout.')
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
              Browse the full station list and get directions instantly.
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
      </main>
    </div>
  )
}
