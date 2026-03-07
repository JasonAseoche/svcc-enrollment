import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Eye, Check, XCircle, AlertCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser } from '../../utils/auth';
import '../../components/AdminLayout/StudentPayment.css';

const API_URL = 'http://localhost/svcc-enrollment/student_payment.php';

const StudentPayment = () => {
  const currentUser = getCurrentUser();
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  const [students, setStudents]             = useState([]);
  const [filteredStudents, setFiltered]     = useState([]);
  const [searchTerm, setSearch]             = useState('');
  const [statusFilter, setStatusFilter]     = useState('All');
  const [isLoading, setIsLoading]           = useState(false);
  const [message, setMessage]               = useState({ text: '', type: '' });

  // Schedule confirm modal
  const [scheduleModal, setScheduleModal]   = useState({ open: false, student: null, schedules: [], loadingSchedules: false });
  // Reject modal
  const [rejectModal, setRejectModal]       = useState({ open: false, student: null, reason: '' });

  /* ─── fetch students ─────────────────────────────────────────── */
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}?action=getAdvisingApprovedStudents`);
      if (res.data.success) {
        setStudents(res.data.data || []);
      } else {
        setMessage({ text: res.data.error || 'Failed to load students', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error loading students', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  /* ─── filter ─────────────────────────────────────────────────── */
  useEffect(() => {
    let data = [...students];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      data = data.filter(s => s.status === statusFilter);
    }
    setFiltered(data);
  }, [students, searchTerm, statusFilter]);

  /* ─── auto-clear message ─────────────────────────────────────── */
  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  /* ─── open approve modal: load schedules ─────────────────────── */
  const handleOpenApproveModal = async (student) => {
    setScheduleModal({ open: true, student, schedules: [], loadingSchedules: true });
    try {
      const res = await axios.get(`${API_URL}?action=getStudentSchedulePreview&applicationId=${student.applicationId}`);
      if (res.data.success) {
        setScheduleModal(prev => ({ ...prev, schedules: res.data.data, loadingSchedules: false }));
      } else {
        setScheduleModal(prev => ({ ...prev, loadingSchedules: false }));
        setMessage({ text: 'Could not load section schedules', type: 'error' });
      }
    } catch {
      setScheduleModal(prev => ({ ...prev, loadingSchedules: false }));
      setMessage({ text: 'Network error loading schedules', type: 'error' });
    }
  };

  /* ─── confirm approve ────────────────────────────────────────── */
  const handleConfirmApprove = async () => {
    const { student } = scheduleModal;
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}?action=approvePayment`,
        { applicationId: student.applicationId, approvedBy: currentUser?.user_id },
        { headers: auditHeaders }
      );
      if (res.data.success) {
        setMessage({ text: `${student.name} approved and enrolled successfully.`, type: 'success' });
        setScheduleModal({ open: false, student: null, schedules: [], loadingSchedules: false });
        fetchStudents();
      } else {
        setMessage({ text: res.data.error || 'Failed to approve', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error during approval', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── confirm reject ─────────────────────────────────────────── */
  const handleConfirmReject = async () => {
    const { student, reason } = rejectModal;
    if (!reason.trim()) {
      setMessage({ text: 'Please provide a rejection reason', type: 'error' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}?action=rejectPayment`,
        { applicationId: student.applicationId, reason: reason.trim(), rejectedBy: currentUser?.user_id },
        { headers: auditHeaders }
      );
      if (res.data.success) {
        setMessage({ text: `${student.name}'s payment rejected.`, type: 'success' });
        setRejectModal({ open: false, student: null, reason: '' });
        fetchStudents();
      } else {
        setMessage({ text: res.data.error || 'Failed to reject', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error during rejection', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── status badge class ─────────────────────────────────────── */
   const badgeClass = (status) => {
    if (status === 'Approved') return 'stp-badge stp-badge--approved';
    if (status === 'Rejected') return 'stp-badge stp-badge--rejected';
    if (status === 'Waiting')  return 'stp-badge stp-badge--waiting';
    return 'stp-badge stp-badge--pending';
  };

  /* ─── group schedules by day for the modal ───────────────────── */
  const groupByDay = (schedules) =>
    schedules.reduce((acc, s) => {
      if (!acc[s.day]) acc[s.day] = [];
      acc[s.day].push(s);
      return acc;
    }, {});

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="stp-wrapper">
      {/* ── Header ── */}
      <div className="stp-header">
        <div className="stp-header__text">
          <h1 className="stp-title">Payment Verification</h1>
          <p className="stp-subtitle">Review payment receipts and finalize student enrollment</p>
        </div>
        <div className="stp-header__badge">
          {students.filter(s => s.status === 'Pending').length > 0 && (
            <span className="stp-pending-count">
              {students.filter(s => s.status === 'Pending').length} Pending
            </span>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {message.text && (
        <div className={`stp-toast ${message.type === 'success' ? 'stp-toast--success' : 'stp-toast--error'}`}>
          <AlertCircle size={18} />
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="stp-toast__close">
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="stp-controls">
        <div className="stp-search">
          <Search size={17} className="stp-search__icon" />
          <input
            type="text"
            placeholder="Search student number or name…"
            value={searchTerm}
            onChange={e => setSearch(e.target.value)}
            className="stp-search__input"
          />
          {searchTerm && (
            <button onClick={() => setSearch('')} className="stp-search__clear"><X size={15} /></button>
          )}
        </div>

        <div className="stp-filter">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="stp-filter__select"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <ChevronDown size={15} className="stp-filter__arrow" />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="stp-table-wrap">
        {isLoading && students.length === 0 ? (
          <div className="stp-empty">
            <div className="stp-spinner" />
            <p>Loading students…</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="stp-empty">
            <div className="stp-empty__icon">₱</div>
            <p className="stp-empty__title">No students found</p>
            <p className="stp-empty__sub">Students approved from advising will appear here.</p>
          </div>
        ) : (
          <table className="stp-table">
            <thead>
              <tr>
                <th>Student No.</th>
                <th>Name</th>
                <th>Assigned Section</th>
                <th>Year Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} className={student.status === 'Approved' ? 'stp-row--approved' : student.status === 'Rejected' ? 'stp-row--rejected' : ''}>
                  <td className="stp-cell--mono">{student.studentNumber}</td>
                  <td className="stp-cell--name">{student.name}</td>
                  <td>
                    <span className="stp-section-chip">{student.sectionName || '—'}</span>
                  </td>
                  <td>{student.yearLevel}</td>
                  <td><span className={badgeClass(student.status)}>{student.status}</span></td>
                  <td>
                    <div className="stp-actions">
                      {/* View Receipt */}
                      {student.receiptPath ? (
                        <a
                          href={student.receiptPath}
                          target="_blank"
                          rel="noreferrer"
                          className="stp-btn stp-btn--view"
                          title="View Receipt"
                        >
                          <Eye size={14} /> View
                        </a>
                      ) : (
                        <button className="stp-btn stp-btn--view stp-btn--disabled" disabled title="No receipt uploaded">
                          <Eye size={14} /> View
                        </button>
                      )}

                      {/* Approve / Reject only for Pending (advising_approved or payment_uploaded) */}
                      {student.status === 'Pending' && student.applicationStatus && 
                       ['advising_approved','payment_uploaded'].includes(student.applicationStatus) && (
                        <>
                          <button
                            className="stp-btn stp-btn--approve"
                            onClick={() => handleOpenApproveModal(student)}
                            disabled={isLoading}
                            title="Approve Payment"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="stp-btn stp-btn--reject"
                            onClick={() => setRejectModal({ open: true, student, reason: '' })}
                            disabled={isLoading}
                            title="Reject Payment"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Schedule Confirm Modal ── */}
      {scheduleModal.open && (
        <div className="stp-overlay" onClick={() => setScheduleModal({ open: false, student: null, schedules: [], loadingSchedules: false })}>
          <div className="stp-modal" onClick={e => e.stopPropagation()}>
            <div className="stp-modal__header">
              <div>
                <h2 className="stp-modal__title">Confirm Enrollment</h2>
                <p className="stp-modal__sub">
                  {scheduleModal.student?.name} &nbsp;·&nbsp;
                  <span className="stp-modal__section">{scheduleModal.student?.sectionName}</span>
                </p>
              </div>
              <button
                className="stp-modal__close"
                onClick={() => setScheduleModal({ open: false, student: null, schedules: [], loadingSchedules: false })}
              >
                <X size={18} />
              </button>
            </div>

            <p className="stp-modal__desc">
              The following schedules will be assigned to this student upon approval.
            </p>

            <div className="stp-modal__body">
              {scheduleModal.loadingSchedules ? (
                <div className="stp-modal__loading">
                  <div className="stp-spinner" />
                  <span>Loading schedules…</span>
                </div>
              ) : scheduleModal.schedules.length === 0 ? (
                <p className="stp-modal__no-sched">No schedules found for this section.</p>
              ) : (
                <div className="stp-schedule-groups">
                  {dayOrder
                    .filter(day => groupByDay(scheduleModal.schedules)[day])
                    .map(day => (
                      <div key={day} className="stp-day-group">
                        <div className="stp-day-label">{day}</div>
                        {groupByDay(scheduleModal.schedules)[day].map(s => (
                          <div key={s.id} className="stp-sched-row">
                            <div className="stp-sched-row__left">
                              <span className="stp-sched-code">{s.courseCode}</span>
                              <span className="stp-sched-name">{s.courseName}</span>
                            </div>
                            <div className="stp-sched-row__right">
                              <span className="stp-sched-time">{s.time}</span>
                              <span className="stp-sched-room">{s.room}</span>
                              <span className="stp-sched-prof">{s.instructorName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="stp-modal__footer">
              <button
                className="stp-btn stp-btn--cancel"
                onClick={() => setScheduleModal({ open: false, student: null, schedules: [], loadingSchedules: false })}
              >
                Cancel
              </button>
              <button
                className="stp-btn stp-btn--cancel"
                onClick={handleConfirmApprove}
                disabled={isLoading || scheduleModal.loadingSchedules}
                title="Approve without requiring receipt"
              >
                {isLoading ? 'Processing…' : 'Approve Without Attachment'}
              </button>
              <button
                className="stp-btn stp-btn--confirm"
                onClick={handleConfirmApprove}
                disabled={isLoading || scheduleModal.loadingSchedules || !scheduleModal.student?.receiptPath}
                title={scheduleModal.student?.receiptPath ? 'Approve with uploaded receipt' : 'No receipt uploaded'}
              >
                {isLoading ? 'Processing…' : 'Approve With Attachment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal.open && (
        <div className="stp-overlay" onClick={() => setRejectModal({ open: false, student: null, reason: '' })}>
          <div className="stp-modal stp-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="stp-modal__header">
              <div>
                <h2 className="stp-modal__title">Reject Payment</h2>
                <p className="stp-modal__sub">{rejectModal.student?.name}</p>
              </div>
              <button className="stp-modal__close" onClick={() => setRejectModal({ open: false, student: null, reason: '' })}>
                <X size={18} />
              </button>
            </div>
            <div className="stp-modal__body">
              <label className="stp-form-label">Reason for rejection <span className="stp-required">*</span></label>
              <textarea
                className="stp-form-textarea"
                rows={4}
                placeholder="Provide a clear reason…"
                value={rejectModal.reason}
                onChange={e => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div className="stp-modal__footer">
              <button className="stp-btn stp-btn--cancel" onClick={() => setRejectModal({ open: false, student: null, reason: '' })}>
                Cancel
              </button>
              <button
                className="stp-btn stp-btn--reject-confirm"
                onClick={handleConfirmReject}
                disabled={isLoading || !rejectModal.reason.trim()}
              >
                {isLoading ? 'Processing…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPayment;