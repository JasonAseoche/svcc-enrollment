import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import {
  Database,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
  X,
  Info,
  Shield,
  Trash2
} from 'lucide-react'
import '../../components/SuperAdminLayout/BUR.css'

const API_URL = 'http://localhost/svcc-enrollment/backup_recovery.php'

const BUR = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  }

  const [backupLoading, setBackupLoading] = useState(false)
  const [backupDone, setBackupDone] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importState, setImportState] = useState('idle') // idle | confirm | loading | success | error
  const [importError, setImportError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [backupHistory, setBackupHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })
  const fileRef = useRef()

  useEffect(() => {
    fetchBackupHistory()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchBackupHistory = async () => {
    try {
      setHistoryLoading(true)
      const response = await axios.get(`${API_URL}?action=history`)
      if (response.data.success) {
        setBackupHistory(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch backup history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleBackup = async () => {
    setBackupLoading(true)
    setBackupDone(false)
    try {
      const response = await axios.post(
        `${API_URL}?action=backup`,
        {},
        {
          headers: auditHeaders,
          responseType: 'blob'
        }
      )

      // Check if it's an error JSON response
      const contentType = response.headers['content-type'] || ''
      if (contentType.includes('application/json')) {
        const text = await response.data.text()
        const json = JSON.parse(text)
        setMessage({ text: json.message || 'Backup failed', type: 'error' })
        return
      }

      // Get filename from Content-Disposition header
      const disposition = response.headers['content-disposition'] || ''
      const match = disposition.match(/filename="?([^"]+)"?/)
      const filename = match ? match[1] : `backup_${new Date().toISOString().replace(/[:.]/g, '_').slice(0, 19)}.json`

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setBackupDone(true)
      setMessage({ text: 'Backup downloaded successfully!', type: 'success' })
      fetchBackupHistory()
      setTimeout(() => setBackupDone(false), 4000)
    } catch (error) {
      console.error('Backup failed:', error)
      setMessage({ text: 'Backup failed. Please try again.', type: 'error' })
    } finally {
      setBackupLoading(false)
    }
  }

  const handleDownloadOld = async (filename) => {
    try {
      const response = await axios.get(`${API_URL}?action=download&filename=${encodeURIComponent(filename)}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setMessage({ text: 'Download failed.', type: 'error' })
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.json'))) {
      setImportFile(file)
      setImportState('confirm')
      setImportError('')
    } else {
      setMessage({ text: 'Only .json backup files are accepted.', type: 'error' })
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImportFile(file)
      setImportState('confirm')
      setImportError('')
    }
  }

  const handleImport = async () => {
    setImportState('loading')
    setImportError('')
    try {
      const formData = new FormData()
      formData.append('backup_file', importFile)

      const response = await axios.post(
        `${API_URL}?action=restore`,
        formData,
        {
          headers: {
            ...auditHeaders,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.success) {
        setImportState('success')
        fetchBackupHistory()
      } else {
        setImportError(response.data.message || 'Restore failed.')
        setImportState('error')
      }
    } catch (error) {
      console.error('Restore failed:', error)
      setImportError(error.response?.data?.message || 'Restore failed. The file may be invalid or corrupted.')
      setImportState('error')
    }
  }

  const resetImport = () => {
    setImportFile(null)
    setImportState('idle')
    setImportError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A'
    const mb = bytes / (1024 * 1024)
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`
  }

  return (
    <div className="bur">
      <div className="bur__header">
        <div className="bur__header-left">
          <Database size={20} className="bur__header-icon" />
          <div>
            <h1 className="bur__title">Backup & Recovery</h1>
            <p className="bur__subtitle">Manage database backups and restore points</p>
          </div>
        </div>
        <div className="bur__status-pill">
          <CheckCircle size={13} />
          <span>System Healthy</span>
        </div>
      </div>

      {message.text && (
        <div className={`bur__message bur__message--${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="bur__info-banner">
        <Info size={15} />
        <p>Backups export table data as <strong>.json</strong> files (no schema/table creation). Importing will <strong>clear and replace</strong> all current data. Keep backups stored safely.</p>
      </div>

      {/* Action Cards */}
      <div className="bur__actions">
        {/* Backup Card */}
        <div className="bur-card">
          <div className="bur-card__icon-wrap bur-card__icon-wrap--blue">
            <Download size={22} />
          </div>
          <h2 className="bur-card__title">Download Backup</h2>
          <p className="bur-card__desc">
            Export all current table data as a <span className="bur-card__mono">.json</span> file. Table structures are not included — only the data rows.
          </p>
          <div className="bur-card__meta">
            <Clock size={13} />
            <span>
              {backupHistory.length > 0
                ? `Last backup: ${formatDate(backupHistory[0].created_at)}`
                : 'No backups yet'}
            </span>
          </div>
          <button
            className={`bur-btn bur-btn--primary ${backupLoading ? 'bur-btn--loading' : ''}`}
            onClick={handleBackup}
            disabled={backupLoading}
          >
            {backupLoading ? (
              <><RefreshCw size={15} className="bur-btn__spin" />Generating backup…</>
            ) : backupDone ? (
              <><CheckCircle size={15} />Downloaded!</>
            ) : (
              <><Download size={15} />Download Backup</>
            )}
          </button>
        </div>

        {/* Import / Restore Card */}
        <div className="bur-card">
          <div className="bur-card__icon-wrap bur-card__icon-wrap--amber">
            <Upload size={22} />
          </div>
          <h2 className="bur-card__title">Import & Restore</h2>
          <p className="bur-card__desc">
            Restore data from a <span className="bur-card__mono">.json</span> backup. All current data will be <strong>deleted</strong> and replaced. This cannot be undone.
          </p>

          {importState === 'idle' && (
            <div
              className={`bur-dropzone ${dragOver ? 'bur-dropzone--active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileRef.current.click()}
            >
              <Upload size={24} className="bur-dropzone__icon" />
              <p className="bur-dropzone__text">Drop your <strong>.json</strong> backup here</p>
              <p className="bur-dropzone__subtext">or click to browse</p>
              <input ref={fileRef} type="file" accept=".json" hidden onChange={handleFileSelect} />
            </div>
          )}

          {importState === 'confirm' && (
            <div className="bur-confirm">
              <div className="bur-confirm__file">
                <FileText size={16} />
                <div className="bur-confirm__file-info">
                  <span className="bur-confirm__filename">{importFile?.name}</span>
                  <span className="bur-confirm__filesize">{importFile ? formatSize(importFile.size) : ''}</span>
                </div>
                <button className="bur-confirm__remove" onClick={resetImport}><X size={14} /></button>
              </div>
              <div className="bur-confirm__warning">
                <AlertTriangle size={13} />
                <span>All current data will be permanently deleted and replaced with the backup data.</span>
              </div>
              <div className="bur-confirm__actions">
                <button className="bur-btn bur-btn--ghost" onClick={resetImport}>Cancel</button>
                <button className="bur-btn bur-btn--danger" onClick={handleImport}>
                  <Upload size={14} />Confirm Restore
                </button>
              </div>
            </div>
          )}

          {importState === 'loading' && (
            <div className="bur-progress">
              <RefreshCw size={20} className="bur-btn__spin" />
              <p className="bur-progress__text">Restoring database…</p>
              <div className="bur-progress__bar"><div className="bur-progress__fill" /></div>
              <p className="bur-progress__note">Do not close this page.</p>
            </div>
          )}

          {importState === 'success' && (
            <div className="bur-result bur-result--success">
              <CheckCircle size={28} />
              <p>Database restored successfully.</p>
              <button className="bur-btn bur-btn--ghost" onClick={resetImport}>Import another</button>
            </div>
          )}

          {importState === 'error' && (
            <div className="bur-result bur-result--error">
              <AlertTriangle size={28} />
              <p>{importError || 'Restore failed. The file may be invalid.'}</p>
              <button className="bur-btn bur-btn--ghost" onClick={resetImport}>Try again</button>
            </div>
          )}
        </div>
      </div>

      {/* Backup History */}
      <div className="bur-history">
        <div className="bur-history__header">
          <h2>Backup History</h2>
          <span className="bur-history__count">{backupHistory.length} records</span>
        </div>
        {historyLoading ? (
          <div className="bur-history__loading">
            <RefreshCw size={16} className="bur-btn__spin" />
            <span>Loading history…</span>
          </div>
        ) : backupHistory.length === 0 ? (
          <div className="bur-history__empty">
            <Database size={32} />
            <p>No backups yet. Create your first backup above.</p>
          </div>
        ) : (
          <table className="bur-table">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Size</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {backupHistory.map((b) => (
                <tr key={b.id}>
                  <td className="bur-table__filename">
                    <FileText size={13} />{b.filename}
                  </td>
                  <td className="bur-table__mono">{formatSize(b.file_size)}</td>
                  <td className="bur-table__date">{formatDate(b.created_at)}</td>
                  <td>
                    <span className={`bur-tag bur-tag--${(b.backup_type || 'manual').toLowerCase()}`}>
                      {b.backup_type || 'Manual'}
                    </span>
                  </td>
                  <td className="bur-table__user">{b.created_by || '—'}</td>
                  <td>
                    <span className={`bur-tag bur-tag--${b.status || 'success'}`}>
                      {b.status === 'success'
                        ? <><CheckCircle size={11} />success</>
                        : <><AlertTriangle size={11} />failed</>}
                    </span>
                  </td>
                  <td>
                    {b.status === 'success' && (
                      <button className="bur-link-btn" onClick={() => handleDownloadOld(b.filename)}>
                        <Download size={13} />Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default BUR