import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StationForm from './StationForm'
import Header from './Header'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBrand, setFilterBrand] = useState('all')
  const [formLoading, setFormLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchStations()
  }, [token, navigate])

  const fetchStations = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/stations')
      if (!response.ok) {
        throw new Error('Failed to fetch stations')
      }
      const data = await response.json()
      setStations(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (station = null) => {
    setEditingStation(station)
    setShowForm(true)
    setSuccessMessage('')
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingStation(null)
  }

  const handleSubmitForm = async (formData) => {
    try {
      setFormLoading(true)
      setError(null)

      const url = editingStation
        ? `http://localhost:3000/api/stations/${editingStation.id}`
        : 'http://localhost:3000/api/stations'

      const method = editingStation ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save station')
      }

      const successMsg = editingStation ? 'Station updated successfully!' : 'Station created successfully!'
      setSuccessMessage(successMsg)
      
      setTimeout(() => {
        fetchStations()
        handleCloseForm()
      }, 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteStation = async (stationId) => {
    if (!window.confirm('Are you sure you want to delete this station?')) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`http://localhost:3000/api/stations/${stationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete station')
      }

      setSuccessMessage('Station deleted successfully!')
      setTimeout(() => {
        fetchStations()
      }, 1000)
    } catch (err) {
      setError(err.message)
    }
  }

  const brands = [...new Set(stations.map(s => s.brand))]
  
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         station.area.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = filterBrand === 'all' || station.brand === filterBrand
    return matchesSearch && matchesBrand
  })

  if (showForm) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.content}>
          <button onClick={handleCloseForm} className={styles.backBtn}>← Back to Dashboard</button>
          <StationForm
            station={editingStation}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            isLoading={formLoading}
          />
          {error && <div className={styles.errorBanner}>{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Station Management Dashboard</h1>
          <button onClick={() => handleOpenForm()} className={styles.addBtn}>
            + Add New Station
          </button>
        </div>

        {successMessage && (
          <div className={styles.successBanner}>
            {successMessage}
            <button onClick={() => setSuccessMessage('')} className={styles.closeBanner}>×</button>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            {error}
            <button onClick={() => setError(null)} className={styles.closeBanner}>×</button>
          </div>
        )}

        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by station name or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loadingState}>Loading stations...</div>
        ) : filteredStations.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No stations found</p>
            <button onClick={() => handleOpenForm()} className={styles.addBtn}>
              Create your first station
            </button>
          </div>
        ) : (
          <div className={styles.stationsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.colName}>Name</div>
              <div className={styles.colBrand}>Brand</div>
              <div className={styles.colArea}>Area</div>
              <div className={styles.colRating}>Rating</div>
              <div className={styles.colActions}>Actions</div>
            </div>
            {filteredStations.map(station => (
              <div key={station.id} className={styles.tableRow}>
                <div className={styles.colName}>{station.name}</div>
                <div className={styles.colBrand}>{station.brand}</div>
                <div className={styles.colArea}>{station.area}</div>
                <div className={styles.colRating}>
                  <span className={styles.ratingBadge}>⭐ {station.rating.toFixed(1)}</span>
                </div>
                <div className={styles.colActions}>
                  <button
                    onClick={() => handleOpenForm(station)}
                    className={styles.editBtn}
                    title="Edit station"
                  >
                    ✎ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStation(station.id)}
                    className={styles.deleteBtn}
                    title="Delete station"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Stations</span>
            <span className={styles.statValue}>{stations.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Showing</span>
            <span className={styles.statValue}>{filteredStations.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Unique Brands</span>
            <span className={styles.statValue}>{brands.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
