import { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/home'
import Stations from './Pages/stations'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stations" element={<Stations />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
