import styles from './StationCard.module.css'

function Stars({ rating }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`${styles.star} ${rating >= i ? styles.on : styles.off}`}
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

export default function StationCard({ station, selected, index, onSelect, onNavigate }) {
  const fuelMap = {
    PMS: 'petrol',
    AGO: 'diesel',
    LPG: 'lpg',
  }

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onSelect(station.id)}
    >
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
        <Stars rating={station.rating} />
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
        {['PMS', 'AGO', 'LPG'].map(f => (
          <FuelChip
            key={f}
            label={f}
            type={station.fuels.includes(f) && (f !== 'PMS' || station.available) ? fuelMap[f] : 'none'}
          />
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.metaItem}>📍 {station.distance} km</span>
          <span className={styles.metaItem}>🕐 {station.hours}</span>
          {station.price
            ? <span className={styles.price}>₦{station.price}/L</span>
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
