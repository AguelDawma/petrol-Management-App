import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import StatusCircle from "../assets/statusCircle";

export default function dashboard() {
    const [userLocation, setUserLocation] = useState(null);
    const [stations, setStations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords: { latitude, longitude } }) => {
                    setUserLocation({
                        lat: latitude,
                        lng: longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                },
                { enableHighAccuracy: true }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            return;
        }

        // Mock data for stations
        const mockStations = [
            {
                id: 1,
                name: "Station A",
                lat: 40.7128,
                lng: -74.0060,
                fuels: { 95: 'available', 93: 'low', diesel: 'out' }
            },
            {
                id: 2,
                name: "Station B",
                lat: 40.7589,
                lng: -73.9851,
                fuels: { 95: 'available', 93: 'available', diesel: 'low' }
            },
            {
                id: 3,
                name: "Station C",
                lat: 40.7505,
                lng: -73.9934,
                fuels: { 95: 'low', 93: 'out', diesel: 'available' }
            }
        ];
        setStations(mockStations);
    }, []);

    async function sendLocation(coords) {
        try {
            const response = await fetch("/api/location", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(coords)
            });
            const data = await response.json();
            console.log("Location sent successfully:", data);
        } catch (error) {
            console.error("Error sending location:", error);
        }
    }

    // Function to calculate distance using Haversine formula
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance.toFixed(2); // in km
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'available': return '🟢';
            case 'low': return '🟡';
            case 'out': return '🔴';
            default: return '❓';
        }
    };

    return (
        <main>
            <div className={styles["key-div"]}>
                <ul>
                    {[0, 20, 40, 60, 80, 100].map((value) => (
                        <li key={value}>
                            <StatusCircle percent={value} />
                            <p>{value}L +</p>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles["stations-list"]}>
                <h2>Nearby Stations</h2>
                {userLocation ? (
                    <ul>
                        {stations.map(station => {
                            const distance = calculateDistance(userLocation.lat, userLocation.lng, station.lat, station.lng);
                            return (
                                <li key={station.id} className={styles["station-item"]}>
                                    <h3>{station.name}</h3>
                                    <p>Distance: {distance} km</p>
                                    <div className={styles["fuels"]}>
                                        <span>95: {getStatusIcon(station.fuels[95])}</span>
                                        <span>93: {getStatusIcon(station.fuels[93])}</span>
                                        <span>Diesel: {getStatusIcon(station.fuels.diesel)}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p>Loading location...</p>
                )}
            </div>
        </main>
    );
}