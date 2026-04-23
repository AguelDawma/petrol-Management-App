import React, { useState, useEffect } from 'react'

const OSMStationList = ({ bounds = "-29.35,27.45,-29.28,27.55" }) => {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStations = async () => {
    const query = `[out:json];node["amenity"="fuel"](${bounds});out;`
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`

    try {
      const response = await fetch(url)
      const data = await response.json()
      setStations(data.elements || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching petrol stations:", err)
      setError("Failed to fetch stations from OpenStreetMap")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStations()
  }, [bounds])

  if (loading) return <p>Searching for nearby stations...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Petrol Stations Found: {stations.length}</h2>
      <ul>
        {stations.map((station) => (
          <li key={station.id} style={{ marginBottom: '10px' }}>
            <strong>{station.tags?.name || "Unnamed Station"}</strong><br />
            Coordinates: {station.lat}, {station.lon}
            {station.tags?.phone && <><br />Phone: {station.tags.phone}</>}
            {station.tags?.opening_hours && <><br />Hours: {station.tags.opening_hours}</>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default OSMStationList
