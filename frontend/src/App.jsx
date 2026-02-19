import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="cover-page">
        <div className="overlay">
          <header className="navbar">
            <div className="logo">PetrolPeek</div>
            <button className="login-btn">Manager Login</button>
          </header>

          <main className="content">
            <h1>Fueling Your Journey</h1>
            <p className="tagline">Real-time stock levels for petrol and diesel at your fingertips.</p>
            
            <div className="services-grid">
              <div className="service-card">
                <h3>Live Status</h3>
                <p>Check if your station has 93, 95, or Diesel before you drive.</p>
              </div>
              <div className="service-card">
                <h3>Manager Tools</h3>
                <p>Update inventory volumes and manage supply logs instantly.</p>
              </div>
            </div>
            
            <button className="cta-button">View Live Map</button>
          </main>
        </div>
      </div>
    </>
  )
}

export default App
