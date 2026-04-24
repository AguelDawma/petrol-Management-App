import { useState, useEffect } from 'react'
import styles from './StationCard.module.css'

function Stars({ rating, interactive = false, onRate }) {
  const [hoverRating, setHoverRating] = useState(0)
  const [glowRating, setGlowRating] = useState(0)

  const handleClick = (star) => {
    if (interactive && onRate) {
      setGlowRating(star)
      onRate(star)
      // Fade out glow after 1.5 seconds
      setTimeout(() => setGlowRating(0), 1500)
    }
  }

  const handleMouseEnter = (star) => {
    if (interactive) {
      setHoverRating(star)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`${styles.star} ${displayRating >= i ? styles.on : styles.off} ${interactive ? styles.interactive : ''} ${glowRating >= i ? styles.glow : ''}`}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function FuelChip({ label, type }) {
  return <span className={`${styles.chip} ${styles[type]}`}>{label}</span>
}

export default function StationCard({ station, selected, index, onSelect, onNavigate, onRate }) {
  const fuelMap = {
    ULD95: 'petrol',
    PPM50: 'diesel',
    ULD93: 'ULD93',
  }

  const brandSlug = (station.brand || station.name || '').toLowerCase()
  const brandImageMap = {
    puma: '/puma.jpg',
    shell: '/shell.jpg',
    total: '/total.jpg',
    engen: '/engen-petrol-station.jpg',
    tholo: '/tholo.jpg',
  }

  const stationImage = Object.entries(brandImageMap).find(([key]) => brandSlug.includes(key))?.[1] || null

  const handleRate = async (rating) => {
    if (!onRate) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to rate stations')
        return
      }

      const response = await fetch(`http://localhost:3000/api/stations/${station.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      })

      if (response.ok) {
        onRate(station.id, rating)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating')
    }
  }

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onSelect(station.id)}
    >
      {stationImage && (
        <div className={styles.stationImageWrapper}>
          <img
            src={stationImage}
            alt={`${station.name} logo`}
            className={styles.stationImage}
          />
        </div>
      )}

      {/* Top row */}
      <div className={styles.top}>
        <div className={styles.info}>
          <div className={styles.name}>{station.name}</div>
          <div className={styles.address}>{station.address}</div>
        </div>
        <div className={`${styles.badge} ${station.available ? styles.available : styles.unavailable}`}>
          <span className={styles.dot} />
          {station.available ? 'Petrol In' : 'No Petrol'}
        </div>
      </div>

      {/* Rating */}
      <div className={styles.ratingRow}>
        <Stars rating={station.rating} interactive={true} onRate={handleRate} />
        <span className={styles.score}>{station.rating.toFixed(1)}</span>
        <span className={styles.reviewCount}>({station.reviews} reviews)</span>
      </div>

      {/* Rating bar */}
      <div className={styles.barBg}>
        <div
          className={styles.barFill}
          style={{ width: `${(station.rating / 5) * 100}%` }}
        />
      </div>

      {/* Fuel chips */}
      <div className={styles.chips}>
        {['ULD95', 'PPM50', 'ULD93'].map(f => (
          <FuelChip
            key={f}
            label={f}
            type={station.fuels.includes(f) && (f !== 'ULD95' || station.available) ? fuelMap[f] : 'none'}
          />
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.metaItem}>📍 {station.distance} km</span>
          <span className={styles.metaItem}>🕐 {station.hours}</span>
          {station.price
            ? <span className={styles.price}>M{station.price}/L</span>
            : <span className={styles.noPrice}>—</span>
          }
        </div>
        <button
          className={styles.navBtn}
          onClick={e => { e.stopPropagation(); onNavigate(station) }}
        >
          🗺 Go
        </button>
      </div>
    </div>
  )
}
