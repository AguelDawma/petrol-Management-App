import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Header.module.css'

export default function Header({ onLoadMap, onLocate }) {
  const [apiKey, setApiKey] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <div className={styles.flame}>⛽</div>
          <span>MafuraFill</span>
        </div>
        {user && (
          <nav className={styles.nav}>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/') }}
              className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
            >
              🏠 Home
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/stations') }}
              className={`${styles.navLink} ${styles.stationLink} ${isActive('/stations') ? styles.active : ''}`}
            >
              📍 Stations
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/admin') }}
              className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
            >
              ⚙ Admin
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); navigate('/reports') }}
              className={`${styles.navLink} ${isActive('/reports') ? styles.active : ''}`}
            >
              📊 Reports
            </a>
          </nav>
        )}
      </div>

      <div className={styles.right}>
        {user && (
          <div className={styles.userInfo}>
            <span className={styles.welcome}>👤 {user.full_name}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}

        {location.pathname === '/stations' && onLocate && (
          <button className={styles.locateBtn} onClick={onLocate}>
            📍 Use My Location
          </button>
        )}
      </div>
    </header>
  )
}
