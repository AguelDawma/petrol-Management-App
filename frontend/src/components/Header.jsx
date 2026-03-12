import { useState } from 'react'
import styles from './Header.module.css'

export default function Header({ onLoadMap, onLocate }) {
  const [apiKey, setApiKey] = useState('')

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.flame}>⛽</div>
        FuelNow
      </div>

      <div className={styles.right}>
        <div className={styles.apiWrap}>
          <span className={styles.keyIcon}>🔑</span>
          <input
            type="text"
            placeholder="Paste your Google Maps API Key…"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            className={styles.apiInput}
          />
        </div>
        <button className={styles.loadBtn} onClick={() => onLoadMap(apiKey)}>
          Load Map
        </button>
        <button className={styles.locateBtn} onClick={onLocate}>
          📍 Locate Me
        </button>
      </div>
    </header>
  )
}
