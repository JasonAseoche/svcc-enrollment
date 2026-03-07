import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Shield, Database, ClipboardList, Activity,
  Users, AlertTriangle, CheckCircle, Clock, RefreshCw
} from 'lucide-react'
import '../../components/SuperAdminLayout/DashboardSuperAdmin.css'

const API_URL = 'http://localhost/svcc-enrollment/dashboard_super.php'

const DashboardSuperAdmin = () => {
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await axios.get(`${API_URL}?action=all`)
      if (res.data.success) {
        setData(res.data.data)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 60000)
    return () => clearInterval(interval)
  }, [])

  const fmt = (n) => {
    if (n === null || n === undefined) return '—'
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'k'
    return n.toLocaleString()
  }

  const stats = data ? [
    {
      label: 'Total Users',
      value: fmt(data.stats.total_users),
      trend: `+${data.stats.new_users} this month`,
      icon: Users,
    },
    {
      label: 'Last Backup',
      value: data.stats.last_backup,
      trend: data.stats.last_backup_status === 'success' ? 'Healthy' : data.stats.last_backup_status === 'none' ? 'No backups yet' : 'Check backup',
      icon: Database,
    },
    {
      label: 'Audit Logs',
      value: fmt(data.stats.total_audit),
      trend: `+${data.stats.audit_today} today`,
      icon: ClipboardList,
    },
    {
      label: 'Active Users',
      value: fmt(data.stats.active_users),
      trend: data.stats.failed_logins > 0
        ? `${data.stats.failed_logins} failed login${data.stats.failed_logins > 1 ? 's' : ''} today`
        : 'No failed logins today',
      icon: data.stats.failed_logins > 0 ? AlertTriangle : Activity,
    },
  ] : []

  return (
    <div className="sa-dashboard">
      {/* Header */}
      <div className="sa-dashboard__header">
        <div className="sa-dashboard__header-left">
          <Shield size={20} className="sa-dashboard__header-icon" />
          <div>
            <h1 className="sa-dashboard__title">Super Admin Dashboard</h1>
            <p className="sa-dashboard__subtitle">System overview and monitoring</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sa-dashboard__header-date">
            <Clock size={14} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            title="Refresh"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 6,
              border: '1px solid var(--sa-border)', background: 'var(--sa-surface)',
              color: 'var(--sa-text-muted)', cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', marginBottom: 20,
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, color: '#dc2626', fontSize: 13
        }}>
          <AlertTriangle size={15} />
          <span>Failed to load dashboard data.</span>
          <button onClick={fetchAll} style={{ marginLeft: 'auto', fontSize: 12, color: '#dc2626', background: 'none', border: '1px solid #dc2626', borderRadius: 5, padding: '3px 10px', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="sa-dashboard__stats">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sa-stat-card" style={{ opacity: 0.5 }}>
                <div className="sa-stat-card__icon-wrap"><Users size={18} /></div>
                <div className="sa-stat-card__body">
                  <span className="sa-stat-card__value">—</span>
                  <span className="sa-stat-card__label">Loading…</span>
                  <span className="sa-stat-card__trend">—</span>
                </div>
              </div>
            ))
          : stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div className="sa-stat-card" key={i}>
                  <div className="sa-stat-card__icon-wrap">
                    <Icon size={18} />
                  </div>
                  <div className="sa-stat-card__body">
                    <span className="sa-stat-card__value">{stat.value}</span>
                    <span className="sa-stat-card__label">{stat.label}</span>
                    <span className="sa-stat-card__trend">{stat.trend}</span>
                  </div>
                </div>
              )
            })}
      </div>

      {/* Main Grid */}
      <div className="sa-dashboard__grid">

        {/* Recent Audit Trail */}
        <div className="sa-panel">
          <div className="sa-panel__header">
            <div className="sa-panel__header-left">
              <ClipboardList size={16} />
              <h2>Recent Audit Trail</h2>
            </div>
            <a href="/audit-trail" className="sa-panel__link">View all</a>
          </div>
          <div className="sa-panel__body">
            {loading ? (
              <div style={{ padding: '24px 20px', color: 'var(--sa-text-muted)', fontSize: 13, textAlign: 'center' }}>
                Loading…
              </div>
            ) : !data?.recent_audit?.length ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--sa-text-muted)', fontSize: 13 }}>
                No audit logs recorded yet.
              </div>
            ) : (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_audit.map((log, i) => (
                    <tr key={i}>
                      <td className="sa-table__user">{log.user}</td>
                      <td>{log.action}</td>
                      <td><span className="sa-badge sa-badge--module">{log.module}</span></td>
                      <td className="sa-table__time">{log.time}</td>
                      <td>
                        <span className={`sa-badge sa-badge--${log.status === 'success' ? 'success' : 'warning'}`}>
                          {log.status === 'success' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Backup Status */}
        <div className="sa-panel">
          <div className="sa-panel__header">
            <div className="sa-panel__header-left">
              <Database size={16} />
              <h2>Backup Status</h2>
            </div>
            <a href="/backup-restore" className="sa-panel__link">Manage</a>
          </div>
          <div className="sa-panel__body">
            {loading ? (
              <div style={{ padding: '24px 20px', color: 'var(--sa-text-muted)', fontSize: 13, textAlign: 'center' }}>
                Loading…
              </div>
            ) : (
              <>
                <div className="sa-backup-status">
                  <div className="sa-backup-status__indicator">
                    {data?.stats?.last_backup_status === 'success' ? (
                      <>
                        <CheckCircle size={32} className="sa-backup-status__icon--ok" />
                        <div>
                          <p className="sa-backup-status__title">System Healthy</p>
                          <p className="sa-backup-status__desc">Last backup completed successfully {data.stats.last_backup}</p>
                        </div>
                      </>
                    ) : data?.stats?.last_backup_status === 'none' ? (
                      <>
                        <Database size={32} style={{ color: 'var(--sa-text-muted)', flexShrink: 0 }} />
                        <div>
                          <p className="sa-backup-status__title">No Backups Yet</p>
                          <p className="sa-backup-status__desc">Create your first backup in the Backup & Recovery page</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={32} style={{ color: 'var(--sa-warning)', flexShrink: 0 }} />
                        <div>
                          <p className="sa-backup-status__title">Backup Issue</p>
                          <p className="sa-backup-status__desc">Last backup may have failed. Please check.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!data?.recent_backups?.length ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--sa-text-muted)', fontSize: 13 }}>
                    No backup records found.
                  </div>
                ) : (
                  <div className="sa-backup-list">
                    {data.recent_backups.map((b, i) => (
                      <div className="sa-backup-item" key={i}>
                        <div className="sa-backup-item__left">
                          <Database size={13} />
                          <span className="sa-backup-item__name">{b.filename}</span>
                        </div>
                        <div className="sa-backup-item__right">
                          <span className="sa-backup-item__size">{b.size}</span>
                          <span className="sa-backup-item__date">{b.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default DashboardSuperAdmin