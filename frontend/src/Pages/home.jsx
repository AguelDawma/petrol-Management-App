import './home.css'
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const handleViewStations = () => {
    // redirect user to stations page
    navigate('/stations');
  }

  return (
    <div className="home-container">
      {}
      <div className="home-overlay"></div>

      {}
      <div className="home-content">
        <div className="home-text">
          <h1 className="home-title">Mafura Fill</h1>
          <p className="home-subtitle">Hi, Welcome to the Petrol Station Finder App, where we help you find the best shortest route to the petrol station near you.</p>
          <p className="home-description">
            Get quick access to fuel prices, locations, and real-time availability of petrol stations around you.
          </p>
          
          <button 
            className="view-stations-btn"
            onClick={handleViewStations}
          >
            <span className="btn-icon">📍</span>
            View Nearest Petrol Stations
          </button>

          <div className="home-features">
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <h3>Fast & Easy</h3>
              <p>Find stations in seconds</p>
            </div>
            <div className="feature">
              <span className="feature-icon">💰</span>
              <h3>Best Prices</h3>
              <p>Compare fuel prices</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🗺️</span>
              <h3>Real Location</h3>
              <p>Accurate GPS tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home