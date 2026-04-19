import { useState, useEffect } from 'react'
import Header from './Header'
import styles from './Reports.module.css'

export default function Reports() {
  const [reports, setReports] = useState({
    performance: null,
    fuelAvailability: null,
    userActivity: null,
    transactions: null
  })
  const [loading, setLoading] = useState({
    performance: false,
    fuelAvailability: false,
    userActivity: false,
    transactions: false
  })
  const [error, setError] = useState(null)
  const [activeReport, setActiveReport] = useState('performance')

  useEffect(() => {
    fetchAllReports()
  }, [])

  const fetchAllReports = async () => {
    await Promise.all([
      fetchReport('performance'),
      fetchReport('fuelAvailability'),
      fetchReport('userActivity'),
      fetchReport('transactions')
    ])
  }

  const fetchReport = async (reportType) => {
    try {
      setLoading(prev => ({ ...prev, [reportType]: true }))
      setError(null)

      const endpoint = {
        performance: '/api/reports/station-performance',
        fuelAvailability: '/api/reports/fuel-availability',
        userActivity: '/api/reports/user-activity',
        transactions: '/api/reports/transaction-summary'
      }[reportType]

      const response = await fetch(`http://localhost:3000${endpoint}`)
      if (!response.ok) {
        throw new Error('Failed to fetch report')
      }

      const data = await response.json()
      setReports(prev => ({
        ...prev,
        [reportType]: data
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }))
    }
  }

  const downloadReportCSV = (reportData, reportName) => {
    if (!reportData || !reportData.data) return

    let csv = `${reportName}\n`
    csv += `Generated: ${new Date().toLocaleString()}\n\n`

    // Get headers from first row
    const headers = Object.keys(reportData.data[0])
    csv += headers.join(',') + '\n'

    // Add data rows
    reportData.data.forEach(row => {
      csv += headers.map(header => {
        const value = row[header]
        // Escape values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',') + '\n'
    })

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderReport = () => {
    const report = reports[activeReport]

    if (loading[activeReport]) {
      return <div className={styles.loading}>Loading report...</div>
    }

    if (!report) {
      return <div className={styles.empty}>No data available</div>
    }

    return (
      <div className={styles.reportContent}>
        <div className={styles.reportHeader}>
          <div>
            <h2>{report.report_name}</h2>
            <p className={styles.description}>{report.description}</p>
          </div>
          <button 
            className={styles.downloadBtn}
            onClick={() => downloadReportCSV(report, report.report_name)}
          >
            ⬇ Download CSV
          </button>
        </div>

        {report.total_stations !== undefined && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Stations</span>
              <span className={styles.statValue}>{report.total_stations}</span>
            </div>
          </div>
        )}

        {report.fuel_types !== undefined && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Fuel Types</span>
              <span className={styles.statValue}>{report.fuel_types}</span>
            </div>
          </div>
        )}

        {report.active_users !== undefined && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Active Users</span>
              <span className={styles.statValue}>{report.active_users}</span>
            </div>
          </div>
        )}

        {report.total_transactions !== undefined && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Transactions</span>
              <span className={styles.statValue}>{report.total_transactions}</span>
            </div>
          </div>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {Object.keys(report.data[0] || {}).map(header => (
                  <th key={header}>{header.replace(/_/g, ' ').toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.data.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>
                      {typeof value === 'number' ? value.toFixed(2) : value || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <h1>Reports Dashboard</h1>
        
        {error && (
          <div className={styles.errorBanner}>
            {error}
            <button onClick={() => setError(null)} className={styles.closeBanner}>×</button>
          </div>
        )}

        <div className={styles.reportTabs}>
          {[
            { id: 'performance', label: 'Station Performance', icon: '📊' },
            { id: 'fuelAvailability', label: 'Fuel Availability', icon: '⛽' },
            { id: 'userActivity', label: 'User Activity', icon: '👥' },
            { id: 'transactions', label: 'Transactions', icon: '💳' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeReport === tab.id ? styles.active : ''}`}
              onClick={() => setActiveReport(tab.id)}
            >
              <span className={styles.icon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.reportPanel}>
          {renderReport()}
        </div>
      </div>
    </div>
  )
}
