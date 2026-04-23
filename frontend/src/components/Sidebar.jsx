import { useState } from 'react'
import StationCard from './StationCard'
import styles from './Sidebar.module.css'

const FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'available', label: 'Petrol In' },
  { key: 'top',       label: 'Top Rated' },
  { key: 'nearest',   label: 'Nearest' },
]

export default function Sidebar({ stations, selectedId, onSelect, onNavigate }) {
  const [query, setQuery]   = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = stations
    .filter(s => {
      const q = query.toLowerCase()
      const matchQ = s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q)
      const matchF =
        filter === 'all'       ? true :
        filter === 'available' ? s.available :
        filter === 'top'       ? s.rating >= 4.2 : true
      return matchQ && matchF
    })
    .sort((a, b) => {
      if (filter === 'nearest') return a.distance - b.distance
      if (filter === 'top')     return b.rating - a.rating
      return a.distance - b.distance
    })

  const nearest = stations.filter(s => s.available).sort((a,b) => a.distance - b.distance)[0]

  return (
    <aside className={styles.sidebar}>
      {/* Search & Filters */}
      <div className={styles.top}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search station or area…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterRow}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`${styles.fBtn} ${filter === f.key ? styles.active : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nearest available banner */}
      {nearest && (
        <div className={styles.nearestBanner}>
          <div className={styles.nearestLeft}>
            <span className={styles.nearestLabel}>Nearest with Petrol</span>
            <span className={styles.nearestName}>{nearest.name}</span>
          </div>
          <div className={styles.nearestRight}>
            <span className={styles.nearestDist}>{nearest.distance} km</span>
            <span className={styles.nearestPrice}>₦{nearest.price}/L</span>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className={styles.resultsMeta}>
        <span>{filtered.length} station{filtered.length !== 1 ? 's' : ''} found</span>
      </div>

      {/* Cards */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>⛽</span>
            <p>No stations match your search.</p>
          </div>
        ) : (
          filtered.map((s, i) => (
            <StationCard
              key={s.id}
              station={s}
              selected={selectedId === s.id}
              index={i}
              onSelect={onSelect}
              onNavigate={onNavigate}
            />
          ))
        )}
      </div>
    </aside>
  )
}
