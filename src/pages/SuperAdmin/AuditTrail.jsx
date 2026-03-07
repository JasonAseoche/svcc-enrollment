import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  ClipboardList, Search, Download, ChevronLeft, ChevronRight,
  CheckCircle, AlertTriangle, Info, XCircle, Eye, X,
  Filter, User, Tag, Clock, RefreshCw,
} from 'lucide-react'
import '../../components/SuperAdminLayout/AuditTrail.css'

const API_BASE = 'http://localhost/svcc-enrollment'  // adjust if needed
const PAGE_SIZE = 8
const STATUS_OPTIONS = ['All', 'success', 'warning', 'error']

// ── Helper: get logged-in user from localStorage ──────────────
// Your login.php returns: { data: { user: { role, email, ... } } }
// React likely stores this — adjust the key to match yours
const getStoredUser = () => {
  try {
    // Try common storage keys — use whichever your app uses
    const raw =
      localStorage.getItem('user') ||
      localStorage.getItem('userData') ||
      localStorage.getItem('currentUser')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const statusIcon = (s) => {
  if (s === 'success') return <CheckCircle size={12} />
  if (s === 'warning') return <AlertTriangle size={12} />
  if (s === 'error')   return <XCircle size={12} />
  return <Info size={12} />
}

const AuditTrail = () => {
  const [logs, setLogs]                   = useState([])
  const [summary, setSummary]             = useState({ total: 0, success: 0, warning: 0, error: 0 })
  const [moduleOptions, setModuleOptions] = useState(['All'])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)

  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState('All')
  const [moduleFilter, setModuleFilter]   = useState('All')
  const [page, setPage]                   = useState(1)
  const [totalPages, setTotalPages]       = useState(1)
  const [total, setTotal]                 = useState(0)
  const [selectedLog, setSelectedLog]     = useState(null)

  // ── Get user from localStorage ─────────────────────────────
  const storedUser = getStoredUser()
  // Adjust these depending on how your app stores user data:
  const userRole  = storedUser?.role  || storedUser?.user?.role  || ''
  const userEmail = storedUser?.email || storedUser?.user?.email || ''

  // ── Fetch logs ─────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/get_audit_logs.php`, {
        params: { search, status: statusFilter, module: moduleFilter, page },
        headers: {
          // Send user info as custom headers since no PHP session exists
          'X-User-Role':  userRole,
          'X-User-Email': userEmail,
        },
      })
      const data = res.data
      setLogs(data.logs)
      setSummary(data.summary)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      if (data.modules) setModuleOptions(data.modules)
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied. Super Admin role required.')
      } else {
        setError('Failed to load audit logs. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, moduleFilter, page, userRole, userEmail])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }
  const handleStatus = (e) => { setStatusFilter(e.target.value); setPage(1) }
  const handleModule = (e) => { setModuleFilter(e.target.value); setPage(1) }

  // ── CSV Export ─────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get_audit_logs.php`, {
        params: { search, status: statusFilter, module: moduleFilter, export: 'csv' },
        headers: { 'X-User-Role': userRole, 'X-User-Email': userEmail },
        responseType: 'blob',
      })
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `audit_log_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Export failed', err)
    }
  }

  return (
    <div className="at">

      {/* Header */}
      <div className="at__header">
        <div className="at__header-left">
          <ClipboardList size={20} className="at__header-icon" />
          <div>
            <h1 className="at__title">Audit Trail</h1>
            <p className="at__subtitle">Complete log of all user and system activity</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="at-btn at-btn--outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'at-spin' : ''} />
            Refresh
          </button>
          <button className="at-btn at-btn--outline" onClick={handleExport}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="at__error-banner">
          <AlertTriangle size={14} />
          {error}
          <button onClick={() => setError(null)}><X size={12} /></button>
        </div>
      )}

      {/* Summary */}
      <div className="at__summary">
        <div className="at__summary-item">
          <span className="at__summary-count">{summary.total}</span>
          <span className="at__summary-label">Total Entries</span>
        </div>
        <div className="at__summary-divider" />
        <div className="at__summary-item">
          <span className="at__summary-count at__summary-count--success">{summary.success}</span>
          <span className="at__summary-label">Success</span>
        </div>
        <div className="at__summary-divider" />
        <div className="at__summary-item">
          <span className="at__summary-count at__summary-count--warning">{summary.warning}</span>
          <span className="at__summary-label">Warning</span>
        </div>
        <div className="at__summary-divider" />
        <div className="at__summary-item">
          <span className="at__summary-count at__summary-count--error">{summary.error}</span>
          <span className="at__summary-label">Error</span>
        </div>
      </div>

      {/* Filters */}
      <div className="at__controls">
        <div className="at__search-wrap">
          <Search size={14} className="at__search-icon" />
          <input
            className="at__search"
            type="text"
            placeholder="Search by user, action, or description…"
            value={search}
            onChange={handleSearch}
          />
          {search && (
            <button className="at__search-clear" onClick={() => { setSearch(''); setPage(1) }}>
              <X size={13} />
            </button>
          )}
        </div>
        <div className="at__filters">
          <div className="at__filter-group">
            <label className="at__filter-label">Status</label>
            <select className="at__select" value={statusFilter} onChange={handleStatus}>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="at__filter-group">
            <label className="at__filter-label">Module</label>
            <select className="at__select" value={moduleFilter} onChange={handleModule}>
              {moduleOptions.map(m => (
                <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="at-table-wrap">
        {loading ? (
          <div className="at-table__loading">
            <RefreshCw size={20} className="at-spin" />
            <span>Loading logs…</span>
          </div>
        ) : (
          <table className="at-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date & Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>IP Address</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="at-table__empty">No records found.</td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="at-table__row">
                  <td className="at-table__id">{log.id}</td>
                  <td>
                    <div className="at-table__time">
                      <span className="at-table__date">{log.created_at?.split(' ')[0]}</span>
                      <span className="at-table__hour">{log.created_at?.split(' ')[1]}</span>
                    </div>
                  </td>
                  <td>
                    <div className="at-table__user">
                      <div className="at-table__avatar">
                        {(log.user_email?.[0] ?? 'S').toUpperCase()}
                      </div>
                      <div>
                        <span className="at-table__username">{log.user_email}</span>
                        <span className="at-table__role">{log.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="at-table__action">{log.action}</td>
                  <td><span className="at-badge at-badge--module">{log.module}</span></td>
                  <td className="at-table__ip">{log.ip_address}</td>
                  <td>
                    <span className={`at-badge at-badge--${log.status}`}>
                      {statusIcon(log.status)}
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <button className="at-icon-btn" title="View details" onClick={() => setSelectedLog(log)}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="at__pagination">
          <span className="at__pagination-info">
            Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} entries
          </span>
          <div className="at__pagination-controls">
            <button className="at__page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`at__page-btn ${page === i + 1 ? 'at__page-btn--active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="at__page-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="at-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="at-modal" onClick={(e) => e.stopPropagation()}>
            <div className="at-modal__header">
              <h3>Log Detail</h3>
              <button className="at-icon-btn" onClick={() => setSelectedLog(null)}><X size={16} /></button>
            </div>
            <div className="at-modal__body">
              <div className={`at-modal__status at-modal__status--${selectedLog.status}`}>
                {statusIcon(selectedLog.status)}
                <span>{selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}</span>
              </div>
              <div className="at-modal__grid">
                <div className="at-modal__field">
                  <span className="at-modal__field-label"><User size={12} /> User</span>
                  <span className="at-modal__field-value">{selectedLog.user_email}</span>
                </div>
                <div className="at-modal__field">
                  <span className="at-modal__field-label"><Tag size={12} /> Role</span>
                  <span className="at-modal__field-value">{selectedLog.role}</span>
                </div>
                <div className="at-modal__field">
                  <span className="at-modal__field-label"><Clock size={12} /> Timestamp</span>
                  <span className="at-modal__field-value">{selectedLog.created_at}</span>
                </div>
                <div className="at-modal__field">
                  <span className="at-modal__field-label"><Filter size={12} /> Module</span>
                  <span className="at-modal__field-value">{selectedLog.module}</span>
                </div>
                <div className="at-modal__field at-modal__field--full">
                  <span className="at-modal__field-label">Action</span>
                  <span className="at-modal__field-value at-modal__field-value--bold">{selectedLog.action}</span>
                </div>
                <div className="at-modal__field at-modal__field--full">
                  <span className="at-modal__field-label">Description</span>
                  <span className="at-modal__field-value">{selectedLog.description}</span>
                </div>
                <div className="at-modal__field">
                  <span className="at-modal__field-label">IP Address</span>
                  <span className="at-modal__field-value at-modal__mono">{selectedLog.ip_address}</span>
                </div>
                <div className="at-modal__field">
                  <span className="at-modal__field-label">Entry ID</span>
                  <span className="at-modal__field-value at-modal__mono">#{selectedLog.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditTrail