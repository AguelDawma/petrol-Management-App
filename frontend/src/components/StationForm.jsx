import { useState, useEffect } from 'react'
import styles from './StationForm.module.css'

export default function StationForm({ station, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    station_name: '',
    brand: '',
    area: '',
    address: '',
    latitude: '',
    longitude: '',
    operating_hours: '6am - 9pm',
    phone_number: '',
    manager_name: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (station) {
      setFormData({
        station_name: station.name || '',
        brand: station.brand || '',
        area: station.area || '',
        address: station.address || '',
        latitude: station.lat || '',
        longitude: station.lng || '',
        operating_hours: station.hours || '6am - 9pm',
        phone_number: station.phone_number || '',
        manager_name: station.manager_name || '',
      })
    }
  }, [station])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.station_name.trim()) {
      newErrors.station_name = 'Station name is required'
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required'
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    if (!formData.latitude || isNaN(formData.latitude)) {
      newErrors.latitude = 'Valid latitude is required'
    }

    if (!formData.longitude || isNaN(formData.longitude)) {
      newErrors.longitude = 'Valid longitude is required'
    }

    if (parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90'
    }

    if (parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  return (
    <div className={styles.formContainer}>
      <h2>{station ? 'Edit Station' : 'Add New Station'}</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="station_name">Station Name *</label>
          <input
            type="text"
            id="station_name"
            name="station_name"
            value={formData.station_name}
            onChange={handleChange}
            placeholder="e.g., NNPC Mega Station"
            disabled={isLoading}
            className={errors.station_name ? styles.inputError : ''}
          />
          {errors.station_name && <span className={styles.error}>{errors.station_name}</span>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="brand">Brand *</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., NNPC, Total, Shell"
              disabled={isLoading}
              className={errors.brand ? styles.inputError : ''}
            />
            {errors.brand && <span className={styles.error}>{errors.brand}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="area">Area *</label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g., Victoria Island, Lekki"
              disabled={isLoading}
              className={errors.area ? styles.inputError : ''}
            />
            {errors.area && <span className={styles.error}>{errors.area}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full street address"
            disabled={isLoading}
            className={errors.address ? styles.inputError : ''}
          />
          {errors.address && <span className={styles.error}>{errors.address}</span>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="latitude">Latitude *</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="-90 to 90"
              step="0.0001"
              disabled={isLoading}
              className={errors.latitude ? styles.inputError : ''}
            />
            {errors.latitude && <span className={styles.error}>{errors.latitude}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="longitude">Longitude *</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="-180 to 180"
              step="0.0001"
              disabled={isLoading}
              className={errors.longitude ? styles.inputError : ''}
            />
            {errors.longitude && <span className={styles.error}>{errors.longitude}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="operating_hours">Operating Hours</label>
          <input
            type="text"
            id="operating_hours"
            name="operating_hours"
            value={formData.operating_hours}
            onChange={handleChange}
            placeholder="e.g., 6am - 10pm"
            disabled={isLoading}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="phone_number">Phone Number</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+234-XXX-XXXX-XXXX"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="manager_name">Manager Name</label>
            <input
              type="text"
              id="manager_name"
              name="manager_name"
              value={formData.manager_name}
              onChange={handleChange}
              placeholder="Station manager name"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? 'Saving...' : (station ? 'Update Station' : 'Create Station')}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isLoading}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
