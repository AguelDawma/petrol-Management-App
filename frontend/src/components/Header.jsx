import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './Header.module.css'

export default function Header({ onLoadMap, onLocate }) {
  const [apiKey, setApiKey] = useState('')
  const { user, logout } = useAuth()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.flame}>⛽</div>
        FuelNow
      </div>

      <div className={styles.right}>
        {user && (
          <div className={styles.userInfo}>
            <span className={styles.welcome}>Welcome, {user.full_name}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}

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
