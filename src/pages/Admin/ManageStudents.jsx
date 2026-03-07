import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  PlusCircle, Edit2, Trash2, Search, X, Save,
  AlertCircle, CheckSquare, BookOpen
} from 'lucide-react';
import '../../components/AdminLayout/ManageStudents.css';

const API_URL = 'http://localhost/svcc-enrollment';
const REQUIREMENTS_LIST = ['PSA', 'Form 138', 'Form 137', 'Certificate of Good Moral', '2pcs 2x2'];
const YEAR_LEVELS_LABEL = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const TERMS = ['1st Term', '2nd Term', 'Summer'];

// ─── helpers ─────────────────────────────────────────────────────────────────
const storedUser = () => JSON.parse(localStorage.getItem('user') || '{}');
const auditHeaders = () => {
  const u = storedUser();
  return {
    'Content-Type':  'application/json',
    'X-User-Email':  u?.email || u?.user?.email || '',
    'X-User-Role':   u?.role  || u?.user?.role  || '',
  };
};

// ─── Memoised Student Row ─────────────────────────────────────────────────────
const StudentRow = React.memo(({ student, onEdit, onDelete, getYearLevelBadgeClass }) => (
  <tr>
    <td data-label="Student Number: ">
      <div className="manage-students-student-number">{student.student_number}</div>
    </td>
    <td data-label="Name: ">
      <div className="manage-students-student-name">{student.firstName} {student.lastName}</div>
    </td>
    <td data-label="Year Level: ">
      <span className={`manage-students-year-badge ${getYearLevelBadgeClass(student.yearLevel)}`}>
        Year {student.yearLevel}
      </span>
    </td>
    <td data-label="Program: " className="manage-students-program">
      {student.program ? student.program.toUpperCase() : 'N/A'}
    </td>
    <td data-label="Section: " className="manage-students-section">
      {student.section || 'Not Assigned'}
    </td>
    <td data-label="Enrollment Status: " className="manage-students-enrollment-status">
      <span className={`manage-students-status-badge ${student.isEnrolled
        ? 'manage-students-status-enrolled'
        : 'manage-students-status-not-enrolled'}`}>
        {student.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
      </span>
    </td>
    <td data-label="Birthday: " className="manage-students-birthday">
      {student.birthday
        ? new Date(student.birthday).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
        : 'N/A'}
    </td>
    <td data-label="Actions: " className="manage-students-actions-cell">
      <div className="manage-students-actions-buttons">
        <button onClick={() => onEdit(student)}
          className="manage-students-action-button manage-students-edit-button" title="Edit student">
          <Edit2 size={18} />
        </button>
        <button onClick={() => onDelete(student.user_id)}
          className="manage-students-action-button manage-students-delete-button" title="Delete student">
          <Trash2 size={18} />
        </button>
      </div>
    </td>
  </tr>
));
StudentRow.displayName = 'StudentRow';

// ─── Requirements Modal ───────────────────────────────────────────────────────
const RequirementsModal = ({ onClose, studentName, userId, initialChecked, onSaveLocal }) => {
  const [checked, setChecked] = useState(
    initialChecked ||
    REQUIREMENTS_LIST.reduce((acc, r) => ({ ...acc, [r]: false }), {})
  );
  const [loading,  setLoading]  = useState(!initialChecked && !!userId);
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState('');

  useEffect(() => {
    if (!userId || initialChecked) { setLoading(false); return; }
    axios.get(`${API_URL}/requirements_and_courses.php`, {
      params: { action: 'getRequirements', user_id: userId }
    })
      .then(res => {
        if (res.data.success && res.data.data) {
          const db = res.data.data;
          setChecked(REQUIREMENTS_LIST.reduce((acc, r) => ({
            ...acc, [r]: db[r]?.is_submitted || false
          }), {}));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, initialChecked]);

  const allChecked   = REQUIREMENTS_LIST.every(r => checked[r]);
  const checkedCount = REQUIREMENTS_LIST.filter(r => checked[r]).length;
  const toggleAll    = () => { const v = !allChecked; setChecked(REQUIREMENTS_LIST.reduce((a,r)=>({...a,[r]:v}),{})); };
  const toggle       = req => setChecked(p => ({ ...p, [req]: !p[req] }));

  const handleSave = async () => {
    if (!userId) {
      onSaveLocal?.(checked);
      onClose();
      return;
    }
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await axios.post(
        `${API_URL}/requirements_and_courses.php?action=saveRequirements`,
        { user_id: userId, requirements: checked },
        { headers: auditHeaders() }
      );
      if (res.data.success) {
        setSaveMsg(res.data.all_complete
          ? '✓ All requirements met — student marked as enrolled!'
          : `Saved (${res.data.submitted_count}/${REQUIREMENTS_LIST.length})`);
        onSaveLocal?.(checked);
        setTimeout(onClose, 1200);
      } else {
        setSaveMsg(res.data.message || 'Failed to save');
      }
    } catch {
      setSaveMsg('Error saving requirements');
    }
    setSaving(false);
  };

  return (
    <div className="manage-students-modal-overlay" onClick={onClose}>
      <div className="manage-students-modal-content" style={{ maxWidth: '24rem' }}
           onClick={e => e.stopPropagation()}>
        <div className="manage-students-modal-body">
          <h2 className="manage-students-modal-title"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckSquare size={20} /> Requirements
          </h2>
          {studentName && (
            <p style={{ color:'#6b7280', fontSize:'0.875rem', marginBottom:'1rem', marginTop:'-0.5rem' }}>
              Student: <strong style={{ color:'#111827' }}>{studentName}</strong>
            </p>
          )}
          {!userId && (
            <p style={{ fontSize:'0.75rem', color:'#f59e0b', marginBottom:'0.75rem', padding:'0.5rem 0.75rem',
                        backgroundColor:'#fffbeb', borderRadius:'0.375rem', border:'1px solid #fde68a' }}>
              ⚠ Selections will be saved when you create the account.
            </p>
          )}

          {loading ? (
            <p style={{ color:'#6b7280', fontSize:'0.875rem', marginBottom:'0.75rem' }}>Loading…</p>
          ) : (
            <>
              {/* Select All */}
              <div onClick={toggleAll}
                style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.75rem',
                         backgroundColor:'#f3f4f6', borderRadius:'0.375rem', marginBottom:'0.75rem',
                         cursor:'pointer', border:'1px solid #e5e7eb' }}>
                <input type="checkbox" checked={allChecked} onChange={toggleAll}
                  style={{ width:'1.125rem', height:'1.125rem', accentColor:'#d10f0f', cursor:'pointer' }}
                  onClick={e => e.stopPropagation()} />
                <span style={{ fontWeight:'600', color:'#374151', fontSize:'0.875rem' }}>Select All</span>
                <span style={{ marginLeft:'auto', fontSize:'0.75rem', color:'#6b7280' }}>
                  {checkedCount}/{REQUIREMENTS_LIST.length}
                </span>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1.5rem' }}>
                {REQUIREMENTS_LIST.map(req => (
                  <div key={req} onClick={() => toggle(req)}
                    style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.75rem',
                             backgroundColor: checked[req] ? '#fef2f2' : 'white', borderRadius:'0.375rem',
                             cursor:'pointer', border:`1px solid ${checked[req] ? '#fca5a5' : '#e5e7eb'}`,
                             transition:'all 0.15s' }}>
                    <input type="checkbox" checked={checked[req]} onChange={() => toggle(req)}
                      style={{ width:'1.125rem', height:'1.125rem', accentColor:'#d10f0f', cursor:'pointer' }}
                      onClick={e => e.stopPropagation()} />
                    <span style={{ color:'#374151', fontSize:'0.875rem' }}>{req}</span>
                    {checked[req] && (
                      <span style={{ marginLeft:'auto', fontSize:'0.75rem', color:'#d10f0f', fontWeight:'500' }}>
                        ✓ Submitted
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {saveMsg && (
            <p style={{ fontSize:'0.875rem', textAlign:'center', marginBottom:'0.5rem',
                        color: saveMsg.startsWith('✓') ? '#16a34a' : '#dc2626' }}>
              {saveMsg}
            </p>
          )}

          <div className="manage-students-modal-actions">
            <button onClick={onClose} className="manage-students-button manage-students-button-secondary">
              Close
            </button>
            <button onClick={handleSave}
              className="manage-students-button manage-students-button-primary"
              disabled={loading || saving}
              style={{ opacity: (loading || saving) ? 0.5 : 1 }}>
              <Save size={16} style={{ marginRight:'0.375rem' }} />
              {saving ? 'Saving…' : `Save (${checkedCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Enrolled Courses Modal ───────────────────────────────────────────────────
const EnrolledCoursesModal = ({
  onClose, studentName, userId,
  initialSelectedIds, onSaveLocal
}) => {
  const [selectedYear,      setSelectedYear]      = useState('1st Year');
  const [selectedTerm,      setSelectedTerm]      = useState('1st Term');
  const [allCourses,        setAllCourses]        = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState(new Set(initialSelectedIds || []));
  const [loadingCourses,    setLoadingCourses]    = useState(true);
  const [coursesError,      setCoursesError]      = useState(false);
  const [saving,            setSaving]            = useState(false);
  const [saveMsg,           setSaveMsg]           = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingCourses(true);
      setCoursesError(false);
      try {
        // Load all approved courses (reuse submit_enrollment endpoint)
        const coursesRes = await axios.get(
          `${API_URL}/submit_enrollment.php?action=getCourses`
        );
        if (coursesRes.data.success && Array.isArray(coursesRes.data.data)) {
          setAllCourses(coursesRes.data.data);
        } else {
          setCoursesError(true);
          return;
        }

        // If student already exists and no local state was passed, load their current courses
        if (userId && !initialSelectedIds) {
          try {
            const enrolledRes = await axios.get(
              `${API_URL}/requirements_and_courses.php`,
              { params: { action: 'getStudentCourses', user_id: userId } }
            );
            if (enrolledRes.data.success && Array.isArray(enrolledRes.data.data)
                && enrolledRes.data.data.length > 0) {
              setSelectedCourseIds(
                new Set(enrolledRes.data.data.map(c => Number(c.course_id)))
              );
            }
          } catch { /* no existing courses — fine */ }
        }
      } catch {
        setCoursesError(true);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchAll();
  }, [API_URL, userId]);

  const filteredCourses = useMemo(
    () => allCourses.filter(c => c.year_level === selectedYear && c.term === selectedTerm),
    [allCourses, selectedYear, selectedTerm]
  );

  const toggleCourse = courseId => {
    const id = Number(courseId);
    setSelectedCourseIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedInView = filteredCourses.filter(c => selectedCourseIds.has(Number(c.id)));
  const totalUnits     = selectedInView.reduce((s, c) => s + (parseInt(c.units_required) || 0), 0);
  const totalSelected  = selectedCourseIds.size;

  const handleSave = async () => {
    const selectedCoursesData = allCourses
      .filter(c => selectedCourseIds.has(Number(c.id)))
      .map(c => ({
        course_id:   c.id,
        course_code: c.course_code,
        course_name: c.course_name,
        units:       c.units_required,
        year_level:  c.year_level,
        term:        c.term,
      }));

    if (!userId) {
      onSaveLocal?.(selectedCourseIds, selectedCoursesData);
      onClose();
      return;
    }

    setSaving(true);
    setSaveMsg('');
    try {
      const res = await axios.post(
        `${API_URL}/requirements_and_courses.php?action=saveCourses`,
        { user_id: userId, courses: selectedCoursesData },
        { headers: auditHeaders() }
      );
      if (res.data.success) {
        onSaveLocal?.(selectedCourseIds, selectedCoursesData);
        setSaveMsg(`✓ ${res.data.courses_saved} course(s) saved & schedules built!`);
        setTimeout(onClose, 1000);
      } else {
        setSaveMsg(res.data.message || 'Failed to save');
      }
    } catch {
      setSaveMsg('Error saving courses');
    }
    setSaving(false);
  };

  return (
    <div className="manage-students-modal-overlay" onClick={onClose}>
      <div className="manage-students-modal-content" style={{ maxWidth: '38rem' }}
           onClick={e => e.stopPropagation()}>
        <div className="manage-students-modal-body">
          <h2 className="manage-students-modal-title"
              style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <BookOpen size={20} /> Enrolled Courses
          </h2>
          {studentName && (
            <p style={{ color:'#6b7280', fontSize:'0.875rem', marginBottom:'0.25rem', marginTop:'-0.5rem' }}>
              Student: <strong style={{ color:'#111827' }}>{studentName}</strong>
            </p>
          )}
          {!userId && (
            <p style={{ fontSize:'0.75rem', color:'#f59e0b', marginBottom:'0.75rem', padding:'0.5rem 0.75rem',
                        backgroundColor:'#fffbeb', borderRadius:'0.375rem', border:'1px solid #fde68a' }}>
              ⚠ Selections will be saved when you create the account.
            </p>
          )}
          {userId && (
            <p style={{ fontSize:'0.75rem', color:'#3b82f6', marginBottom:'0.75rem', padding:'0.5rem 0.75rem',
                        backgroundColor:'#eff6ff', borderRadius:'0.375rem', border:'1px solid #bfdbfe' }}>
              ℹ Saving will bypass the normal enrollment process and directly build the student's schedule.
            </p>
          )}

          {/* Year / Term selectors */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:'600', color:'#374151', marginBottom:'0.3rem' }}>
                Year Level
              </label>
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                className="manage-students-form-select" style={{ fontSize:'0.875rem' }}>
                {YEAR_LEVELS_LABEL.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:'600', color:'#374151', marginBottom:'0.3rem' }}>
                Term
              </label>
              <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
                className="manage-students-form-select" style={{ fontSize:'0.875rem' }}>
                {TERMS.map(t => <option key={t} value={t}>{t.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</option>)}
              </select>
            </div>
          </div>

          {/* Courses table */}
          <div style={{ border:'1px solid #e5e7eb', borderRadius:'0.5rem', overflow:'hidden', marginBottom:'1rem' }}>
            {/* Header */}
            <div style={{ display:'grid', gridTemplateColumns:'2rem 1fr 2fr auto',
                          backgroundColor:'#f9fafb', padding:'0.5rem 0.75rem',
                          borderBottom:'1px solid #e5e7eb',
                          fontSize:'0.75rem', fontWeight:'600', color:'#6b7280',
                          textTransform:'uppercase', letterSpacing:'0.05em' }}>
              <span></span><span>Code</span><span>Course Name</span>
              <span style={{ textAlign:'right' }}>Units</span>
            </div>

            <div style={{ maxHeight:'260px', overflowY:'auto' }}>
              {loadingCourses ? (
                <div style={{ padding:'2rem', textAlign:'center' }}>
                  <div className="manage-students-loading-spinner"
                       style={{ width:'1.5rem', height:'1.5rem', margin:'0 auto 0.5rem' }} />
                  <p style={{ color:'#6b7280', fontSize:'0.875rem', margin:0 }}>Loading courses…</p>
                </div>
              ) : coursesError ? (
                <div style={{ padding:'1.5rem', textAlign:'center', color:'#dc2626', fontSize:'0.875rem' }}>
                  Failed to load courses.
                </div>
              ) : filteredCourses.length === 0 ? (
                <div style={{ padding:'1.5rem', textAlign:'center', color:'#6b7280', fontSize:'0.875rem' }}>
                  No courses for {selectedYear} — {selectedTerm}.
                </div>
              ) : (
                filteredCourses.map((course, idx) => {
                  const isChecked = selectedCourseIds.has(Number(course.id));
                  return (
                    <div key={course.id} onClick={() => toggleCourse(course.id)}
                      style={{ display:'grid', gridTemplateColumns:'2rem 1fr 2fr auto',
                               padding:'0.625rem 0.75rem',
                               borderBottom: idx < filteredCourses.length - 1 ? '1px solid #f3f4f6' : 'none',
                               backgroundColor: isChecked ? '#fef2f2' : (idx % 2 === 0 ? 'white' : '#fafafa'),
                               fontSize:'0.875rem', cursor:'pointer',
                               outline: isChecked ? '1px solid #fca5a5' : 'none',
                               transition:'all 0.12s' }}>
                      <span style={{ display:'flex', alignItems:'center' }}>
                        <input type="checkbox" checked={isChecked}
                          onChange={() => toggleCourse(course.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ width:'1rem', height:'1rem', accentColor:'#d10f0f', cursor:'pointer' }} />
                      </span>
                      <span style={{ fontWeight:'600', color:'#d10f0f', display:'flex', alignItems:'center' }}>
                        {course.course_code}
                      </span>
                      <span style={{ color:'#374151', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        {course.course_name}
                        {course.prerequisite && course.prerequisite !== 'None' && (
                          <span style={{ fontSize:'0.7rem', color:'#9ca3af' }}>Pre-req: {course.prerequisite}</span>
                        )}
                      </span>
                      <span style={{ textAlign:'right', color:'#6b7280', fontWeight:'500',
                                     display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                        {course.units_required}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {!loadingCourses && !coursesError && filteredCourses.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'2rem 1fr 2fr auto',
                            padding:'0.5rem 0.75rem',
                            backgroundColor:'#f3f4f6', borderTop:'2px solid #e5e7eb',
                            fontSize:'0.8rem', fontWeight:'700', color:'#374151' }}>
                <span></span>
                <span style={{ color:'#6b7280', fontWeight:'500' }}>
                  {selectedInView.length}/{filteredCourses.length} in view
                </span>
                <span style={{ color:'#6b7280', fontWeight:'400' }}>
                  Total: {totalSelected} course{totalSelected !== 1 ? 's' : ''}
                </span>
                <span style={{ textAlign:'right', color:'#d10f0f' }}>{totalUnits} units</span>
              </div>
            )}
          </div>

          {saveMsg && (
            <p style={{ fontSize:'0.875rem', textAlign:'center', marginBottom:'0.5rem',
                        color: saveMsg.startsWith('✓') ? '#16a34a' : '#dc2626' }}>
              {saveMsg}
            </p>
          )}

          <div className="manage-students-modal-actions">
            <button onClick={onClose} className="manage-students-button manage-students-button-secondary">
              Cancel
            </button>
            <button onClick={handleSave}
              className="manage-students-button manage-students-button-primary"
              disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
              <Save size={16} style={{ marginRight:'0.375rem' }} />
              {saving ? 'Saving…' : `Save (${totalSelected} course${totalSelected !== 1 ? 's' : ''})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageStudents = () => {
  // ── list state ──────────────────────────────────────────────────────────────
  const [students,         setStudents]         = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [sections,         setSections]         = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [isError,          setIsError]          = useState(false);

  // ── modal state ─────────────────────────────────────────────────────────────
  const [showModal,     setShowModal]     = useState(false);
  const [modalMode,     setModalMode]     = useState('add');
  const [currentStudent, setCurrentStudent] = useState({
    user_id:'', student_number:'', firstName:'', lastName:'',
    yearLevel:'1', program:'', section:'', isEnrolled:false,
    birthday:'', email:'', password:''
  });

  // ── local (pre-save) state for requirements & courses ───────────────────────
  const [localRequirements, setLocalRequirements] = useState(null);
  const [localCourseIds,    setLocalCourseIds]    = useState(new Set());
  const [localCoursesData,  setLocalCoursesData]  = useState([]);
  const [localBluecard,     setLocalBluecard]     = useState(false);

  // ── sub-modal state ─────────────────────────────────────────────────────────
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [showCoursesModal,      setShowCoursesModal]      = useState(false);
  const [subModalStudentName,   setSubModalStudentName]   = useState('');

  // ── filter / search state ───────────────────────────────────────────────────
  const [searchTerm,          setSearchTerm]          = useState('');
  const [sortOrder,           setSortOrder]           = useState('latest');
  const [yearLevelFilter,     setYearLevelFilter]     = useState('all');
  const [programFilter,       setProgramFilter]       = useState('all');
  const [enrollmentFilter,    setEnrollmentFilter]    = useState('all');
  const [showFilterDropdown,  setShowFilterDropdown]  = useState(false);

  // ── misc ────────────────────────────────────────────────────────────────────
  const [deleteId,           setDeleteId]           = useState(null);
  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false);
  const [message,            setMessage]            = useState({ text:'', type:'' });

  // ── fetch students ───────────────────────────────────────────────────────────
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/fetch_accounts.php?role=student`);
      if (Array.isArray(res.data)) { setStudents(res.data); setIsError(false); }
      else { setStudents([]); setIsError(true); }
    } catch { setStudents([]); setIsError(true); }
    finally { setIsLoading(false); }
  };

  // ── fetch sections (filtered by year + program) ──────────────────────────────
  const fetchSections = async (yearLevel = null, program = null) => {
    try {
      const params = new URLSearchParams();
      if (yearLevel) params.append('yearLevel', yearLevel);
      if (program)   params.append('program',   program.toLowerCase());
      const url = `${API_URL}/fetch_sections.php${params.toString() ? '?' + params : ''}`;
      const res = await axios.get(url);
      setSections(Array.isArray(res.data) ? res.data : []);
    } catch { setSections([]); }
  };

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    if (currentStudent.yearLevel && currentStudent.program)
      fetchSections(currentStudent.yearLevel, currentStudent.program);
    else
      setSections([]);
  }, [currentStudent.yearLevel, currentStudent.program]);

  // ── apply filters ─────────────────────────────────────────────────────────────
  const applyFilters = useCallback(() => {
    let f = [...students];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      f = f.filter(st =>
        [st.student_number, st.firstName, st.lastName, st.program, st.section]
          .some(v => (v || '').toLowerCase().includes(s))
      );
    }
    if (yearLevelFilter !== 'all')   f = f.filter(st => st.yearLevel === yearLevelFilter);
    if (programFilter   !== 'all')   f = f.filter(st => (st.program||'').toLowerCase() === programFilter.toLowerCase());
    if (enrollmentFilter !== 'all')  f = f.filter(st => st.isEnrolled === (enrollmentFilter === 'enrolled'));
    f.sort((a,b) => sortOrder === 'latest'
      ? (b.user_id||0) - (a.user_id||0)
      : (a.user_id||0) - (b.user_id||0));
    setFilteredStudents(f);
  }, [students, searchTerm, sortOrder, yearLevelFilter, programFilter, enrollmentFilter]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  // ── password generator ────────────────────────────────────────────────────────
  const generatePassword = useCallback((lastName, birthday) => {
    if (!lastName || !birthday) return '';
    const d = new Date(birthday);
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${lastName.toLowerCase()}${m}${day}${d.getFullYear()}`;
  }, []);

  useEffect(() => {
    if (modalMode === 'add' && currentStudent.lastName && currentStudent.birthday)
      setCurrentStudent(p => ({ ...p, password: generatePassword(p.lastName, p.birthday) }));
  }, [currentStudent.lastName, currentStudent.birthday, modalMode, generatePassword]);

  // ── open modal helpers ────────────────────────────────────────────────────────
  const resetLocalState = () => {
    setLocalRequirements(null);
    setLocalCourseIds(new Set());
    setLocalCoursesData([]);
    setLocalBluecard(false);
  };

  const openAddModal = useCallback(() => {
    setCurrentStudent({ user_id:'', student_number:'', firstName:'', lastName:'',
      yearLevel:'1', program:'', section:'', isEnrolled:false, birthday:'', email:'', password:'' });
    resetLocalState();
    setModalMode('add');
    setShowModal(true);
  }, []);

  const openEditModal = useCallback(student => {
    setCurrentStudent({ ...student, isEnrolled: student.isEnrolled||false, section: student.section||'', password:'' });
    resetLocalState();
    setModalMode('edit');
    setShowModal(true);
  }, []);

  const confirmDelete = useCallback(id => { setDeleteId(id); setShowDeleteConfirm(true); }, []);

  // ── sub-modal openers ─────────────────────────────────────────────────────────
  const openRequirementsModal = () => {
    setSubModalStudentName(
      [currentStudent.firstName, currentStudent.lastName].filter(Boolean).join(' ') || 'New Student'
    );
    setShowRequirementsModal(true);
  };

  const openCoursesModal = () => {
    setSubModalStudentName(
      [currentStudent.firstName, currentStudent.lastName].filter(Boolean).join(' ') || 'New Student'
    );
    setShowCoursesModal(true);
  };

  // ── form input ────────────────────────────────────────────────────────────────
  const handleInputChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    setCurrentStudent(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  // ── submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    const { student_number, firstName, lastName, program, birthday, email } = currentStudent;
    if (!student_number || !firstName || !lastName || !program || !birthday || !email) {
      setMessage({ text:'Please fill all required fields', type:'error' }); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ text:'Please enter a valid email address', type:'error' }); return;
    }
    if (modalMode === 'add' && !currentStudent.password) {
      setMessage({ text:'Password could not be generated. Check last name and birthday.', type:'error' }); return;
    }

    try {
      const url = modalMode === 'add' ? '/add_account.php' : '/update_accounts.php';
      const res = await axios.post(
        `${API_URL}${url}`,
        { ...currentStudent, role:'student' },
        { headers: auditHeaders() }
      );

      if (res.data.success) {
        const savedUserId = res.data.user_id || currentStudent.user_id;

        // Save requirements (if any were set locally before saving student)
        if (localRequirements && savedUserId) {
          try {
            await axios.post(
              `${API_URL}/requirements_and_courses.php?action=saveRequirements`,
              { user_id: savedUserId, requirements: localRequirements, bluecard: false },
              { headers: auditHeaders() }
            );
          } catch { /* non-blocking */ }
        }

        if (savedUserId) {
          try {
            await axios.post(
              `${API_URL}/requirements_and_courses.php?action=saveBluecard`,
              { user_id: savedUserId, bluecard: localBluecard },
              { headers: auditHeaders() }
            );
          } catch { /* non-blocking */ }
        }

        // Save courses (admin bypass — builds schedule too)
        if (localCoursesData.length > 0 && savedUserId) {
          try {
            await axios.post(
              `${API_URL}/requirements_and_courses.php?action=saveCourses`,
              { user_id: savedUserId, courses: localCoursesData },
              { headers: auditHeaders() }
            );
          } catch { /* non-blocking */ }
        }

        setMessage({ text: res.data.message, type:'success' });
        setShowModal(false);
        fetchStudents();
      } else {
        setMessage({ text: res.data.message || `Failed to ${modalMode} student`, type:'error' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || `Error ${modalMode}ing student`, type:'error' });
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/delete_account.php`,
        { user_id: deleteId },
        { headers: auditHeaders() }
      );
      if (res.data.success) { setMessage({ text: res.data.message, type:'success' }); fetchStudents(); }
      else setMessage({ text: res.data.message || 'Failed to delete student', type:'error' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error deleting student', type:'error' });
    } finally { setShowDeleteConfirm(false); setDeleteId(null); }
  };

  // ── misc helpers ──────────────────────────────────────────────────────────────
  const getYearLevelBadgeClass = useCallback(yl => ({
    '1':'manage-students-year-1','2':'manage-students-year-2',
    '3':'manage-students-year-3','4':'manage-students-year-4'
  }[yl] || 'manage-students-year-1'), []);

  const handleFilterChange = useCallback((type, val) => {
    if (type==='sort') setSortOrder(val);
    else if (type==='yearLevel') setYearLevelFilter(val);
    else if (type==='program')   setProgramFilter(val);
    else if (type==='enrollment') setEnrollmentFilter(val);
    setShowFilterDropdown(false);
  }, []);

  const getFilterDisplayText = useMemo(() => {
    const s = sortOrder === 'latest' ? 'Latest' : 'Oldest';
    const y = yearLevelFilter === 'all' ? 'All Years' : `Year ${yearLevelFilter}`;
    const p = programFilter   === 'all' ? 'All Programs' : programFilter.toUpperCase();
    const e = enrollmentFilter === 'all' ? 'All Status'
            : enrollmentFilter === 'enrolled' ? 'Enrolled' : 'Not Enrolled';
    return `${s} • ${y} • ${p} • ${e}`;
  }, [sortOrder, yearLevelFilter, programFilter, enrollmentFilter]);

  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(() => setMessage({ text:'', type:'' }), 5000);
    return () => clearTimeout(t);
  }, [message]);

  // ── filter dropdown ───────────────────────────────────────────────────────────
  const FilterDropdown = () => (
    <div className="manage-students-filter-dropdown">
      {[
        { label:'Sort', type:'sort',
          options:[{v:'latest',l:'Latest'},{v:'oldest',l:'Oldest'}], current:sortOrder },
        { label:'Year Level', type:'yearLevel',
          options:[{v:'all',l:'All Years'},{v:'1',l:'Year 1'},{v:'2',l:'Year 2'},{v:'3',l:'Year 3'},{v:'4',l:'Year 4'}],
          current:yearLevelFilter },
        { label:'Program', type:'program',
          options:[{v:'all',l:'All Programs'},{v:'bscs',l:'BSCS'},{v:'bsit',l:'BSIT'},{v:'bsis',l:'BSIS'}],
          current:programFilter },
        { label:'Enrollment', type:'enrollment',
          options:[{v:'all',l:'All Status'},{v:'enrolled',l:'Enrolled'},{v:'not_enrolled',l:'Not Enrolled'}],
          current:enrollmentFilter },
      ].map(({ label, type, options, current }) => (
        <div key={type} className="manage-students-filter-section">
          <h4 className="manage-students-filter-section-title">{label}</h4>
          {options.map(({ v, l }) => (
            <button key={v}
              className={`manage-students-filter-option ${current===v ? 'manage-students-filter-option-active':''}`}
              onClick={() => handleFilterChange(type, v)}>{l}</button>
          ))}
        </div>
      ))}
    </div>
  );

  const FilterButton = ({ onClick }) => (
    <button className="manage-students-filter-button" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd"
          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
          clipRule="evenodd" />
      </svg>
      <span className="manage-students-filter-text">{getFilterDisplayText}</span>
      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"
        className={`manage-students-filter-chevron ${showFilterDropdown?'manage-students-filter-chevron-open':''}`}>
        <path fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd" />
      </svg>
    </button>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="manage-students-container">
      <div className="manage-students-content-wrapper">

        {/* ── Header ── */}
        <div className="manage-students-header-card">
          <div className="manage-students-header-content">
            <h1 className="manage-students-page-title">Manage Student Accounts</h1>
            <div className="manage-students-header-actions">
              <div className="manage-students-search-container">
                <input type="text" placeholder="Search students…"
                  className="manage-students-search-input"
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <Search className="manage-students-search-icon" size={18} />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="manage-students-search-clear">
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="manage-students-mobile-filter-container">
                <FilterButton onClick={() => setShowFilterDropdown(v => !v)} />
                {showFilterDropdown && <FilterDropdown />}
              </div>
              <button onClick={openAddModal} className="manage-students-add-button">
                <PlusCircle size={18} className="manage-students-button-icon" /> Add Account
              </button>
            </div>
          </div>
        </div>

        {/* ── Alert ── */}
        {message.text && (
          <div className={`manage-students-message ${
            message.type==='success' ? 'manage-students-message-success' : 'manage-students-message-error'}`}>
            <AlertCircle size={20} className="manage-students-message-icon" />
            <span>{message.text}</span>
          </div>
        )}

        {/* ── Table ── */}
        <div className="manage-students-table-container">
          {isLoading ? (
            <div className="manage-students-loading-container">
              <div className="manage-students-loading-spinner"></div>
              <p className="manage-students-loading-text">Loading students…</p>
            </div>
          ) : isError ? (
            <div className="manage-students-error-container">
              <AlertCircle size={40} className="manage-students-error-icon" />
              <p className="manage-students-error-text">Failed to load students</p>
              <button onClick={fetchStudents} className="manage-students-retry-button">Try Again</button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="manage-students-empty-container">
              {searchTerm || yearLevelFilter!=='all' || programFilter!=='all' || enrollmentFilter!=='all' ? (
                <>
                  <p className="manage-students-empty-text">No students match the current filters</p>
                  <button className="manage-students-empty-action"
                    onClick={() => { setSearchTerm(''); setYearLevelFilter('all'); setProgramFilter('all'); setEnrollmentFilter('all'); }}>
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="manage-students-empty-text">No students available</p>
                  <button onClick={openAddModal} className="manage-students-empty-action">
                    <PlusCircle size={16} className="manage-students-button-icon-small" /> Add your first student
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="manage-students-table-scroll">
              <table className="manage-students-table">
                <thead>
                  <tr>
                    <th>Student Number</th><th>Name</th><th>Year Level</th>
                    <th>Program</th><th>Section</th><th>Enrollment Status</th><th>Birthday</th>
                    <th className="manage-students-actions-header">
                      <div className="manage-students-filter-header">
                        Actions
                        <div className="manage-students-filter-container">
                          <FilterButton onClick={() => setShowFilterDropdown(v => !v)} />
                          {showFilterDropdown && <FilterDropdown />}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <StudentRow key={student.user_id} student={student}
                      onEdit={openEditModal} onDelete={confirmDelete}
                      getYearLevelBadgeClass={getYearLevelBadgeClass} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="manage-students-modal-overlay">
          <div className="manage-students-modal-content" onClick={e => e.stopPropagation()}>
            <div className="manage-students-modal-body">
              <h2 className="manage-students-modal-title">
                {modalMode === 'add' ? 'Add New Student' : 'Edit Student'}
              </h2>
              <form onSubmit={handleSubmit}>

                {/* Student Number */}
                <div className="manage-students-form-group">
                  <label htmlFor="student_number" className="manage-students-form-label">Student Number*</label>
                  <input type="text" id="student_number" name="student_number"
                    value={currentStudent.student_number} onChange={handleInputChange}
                    className="manage-students-form-input" placeholder="e.g. 2024-00001" required />
                </div>

                {/* Name row */}
                <div className="manage-students-form-row">
                  <div className="manage-students-form-group">
                    <label htmlFor="firstName" className="manage-students-form-label">First Name*</label>
                    <input type="text" id="firstName" name="firstName"
                      value={currentStudent.firstName} onChange={handleInputChange}
                      className="manage-students-form-input" required />
                  </div>
                  <div className="manage-students-form-group">
                    <label htmlFor="lastName" className="manage-students-form-label">Last Name*</label>
                    <input type="text" id="lastName" name="lastName"
                      value={currentStudent.lastName} onChange={handleInputChange}
                      className="manage-students-form-input" required />
                  </div>
                </div>

                {/* Year / Program row */}
                <div className="manage-students-form-row">
                  <div className="manage-students-form-group">
                    <label htmlFor="yearLevel" className="manage-students-form-label">Year Level*</label>
                    <select id="yearLevel" name="yearLevel" value={currentStudent.yearLevel}
                      onChange={handleInputChange} className="manage-students-form-select" required>
                      <option value="1">Year 1</option><option value="2">Year 2</option>
                      <option value="3">Year 3</option><option value="4">Year 4</option>
                    </select>
                  </div>
                  <div className="manage-students-form-group">
                    <label htmlFor="program" className="manage-students-form-label">Program*</label>
                    <select id="program" name="program" value={currentStudent.program}
                      onChange={handleInputChange} className="manage-students-form-select" required>
                      <option value="">Select Program</option>
                      <option value="bscs">BSCS – Computer Science</option>
                      <option value="bsit">BSIT – Information Technology</option>
                      <option value="bsis">BSIS – Information Systems</option>
                    </select>
                  </div>
                </div>

                {/* Section */}
                <div className="manage-students-form-group">
                  <label htmlFor="section" className="manage-students-form-label">
                    Section {sections.length > 0 && `(${sections.length} available)`}
                  </label>
                  <select id="section" name="section" value={currentStudent.section}
                    onChange={handleInputChange} className="manage-students-form-select"
                    disabled={!currentStudent.yearLevel || !currentStudent.program}>
                    <option value="">
                      {!currentStudent.yearLevel || !currentStudent.program
                        ? 'Select year level and program first'
                        : sections.length === 0 ? 'No sections available' : 'Select Section'}
                    </option>
                    {sections.map(sec => (
                      <option key={sec.id} value={sec.section}>
                       {sec.section} – {sec.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')} ({sec.current_students}/{sec.max_students} students)
                      </option>
                    ))}
                  </select>
                  {currentStudent.yearLevel && currentStudent.program && sections.length === 0 && (
                    <p className="manage-students-form-hint" style={{ color:'#dc2626' }}>
                      No sections for Year {currentStudent.yearLevel} – {currentStudent.program.toUpperCase()}.
                    </p>
                  )}
                </div>

                {/* ── Requirements & Courses action buttons ── */}
                <div className="manage-students-form-group">
                  <label className="manage-students-form-label">Student Setup</label>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.6rem',
                                padding:'0.5rem 0.75rem', border:'1px solid #e5e7eb', borderRadius:'0.375rem',
                                backgroundColor: localBluecard ? '#fef2f2' : 'white',
                                borderColor: localBluecard ? '#fca5a5' : '#e5e7eb', cursor:'pointer' }}
                       onClick={() => setLocalBluecard(v => !v)}>
                    <input type="checkbox" checked={localBluecard} onChange={() => setLocalBluecard(v => !v)}
                      onClick={e => e.stopPropagation()}
                      style={{ width:'1.125rem', height:'1.125rem', accentColor:'#d10f0f', cursor:'pointer' }} />
                    <span style={{ fontSize:'0.875rem', fontWeight:'600', color: localBluecard ? '#d10f0f' : '#374151' }}>
                      Bluecard Issued
                    </span>
                    {localBluecard && (
                      <span style={{ fontSize:'0.75rem', color:'#16a34a', fontWeight:'500', marginLeft:'0.25rem' }}>
                        ✓ Student will be marked as enrolled
                      </span>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>

                    {/* Requirements button */}
                    {(() => {
                      const count = localRequirements
                        ? Object.values(localRequirements).filter(Boolean).length : 0;
                      const active = count > 0;
                      return (
                        <button type="button" onClick={openRequirementsModal}
                          style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem',
                                   padding:'0.5rem 1rem', borderRadius:'0.375rem',
                                   border: active ? '1px solid #fca5a5' : '1px solid #d1d5db',
                                   backgroundColor: active ? '#fef2f2' : 'white',
                                   color: active ? '#d10f0f' : '#374151',
                                   fontSize:'0.875rem', fontWeight:'500', cursor:'pointer',
                                   flex:'1', justifyContent:'center', minWidth:'130px',
                                   transition:'all 0.2s' }}>
                          <CheckSquare size={16} />
                          Requirements
                          {active && (
                            <span style={{ marginLeft:'0.25rem', backgroundColor:'#d10f0f', color:'white',
                                           borderRadius:'9999px', fontSize:'0.7rem', padding:'0 0.4rem', fontWeight:'700' }}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })()}

                    {/* Courses button */}
                    {(() => {
                      const count = localCourseIds.size;
                      const active = count > 0;
                      return (
                        <button type="button" onClick={openCoursesModal}
                          style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem',
                                   padding:'0.5rem 1rem', borderRadius:'0.375rem',
                                   border: active ? '1px solid #fca5a5' : '1px solid #d1d5db',
                                   backgroundColor: active ? '#fef2f2' : 'white',
                                   color: active ? '#d10f0f' : '#374151',
                                   fontSize:'0.875rem', fontWeight:'500', cursor:'pointer',
                                   flex:'1', justifyContent:'center', minWidth:'130px',
                                   transition:'all 0.2s' }}>
                          <BookOpen size={16} />
                          Enrolled Courses
                          {active && (
                            <span style={{ marginLeft:'0.25rem', backgroundColor:'#d10f0f', color:'white',
                                           borderRadius:'9999px', fontSize:'0.7rem', padding:'0 0.4rem', fontWeight:'700' }}>
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                  <p style={{ fontSize:'0.72rem', color:'#6b7280', marginTop:'0.35rem' }}>
                    Setting courses will bypass the normal enrollment flow and directly build the student's schedule.
                    Setting all requirements marks the student as enrolled.
                  </p>
                </div>

                {/* Birthday */}
                <div className="manage-students-form-group">
                  <label htmlFor="birthday" className="manage-students-form-label">Birthday*</label>
                  <input type="date" id="birthday" name="birthday"
                    value={currentStudent.birthday} onChange={handleInputChange}
                    className="manage-students-form-input" required />
                </div>

                {/* Email */}
                <div className="manage-students-form-group">
                  <label htmlFor="email" className="manage-students-form-label">Email Address*</label>
                  <input type="email" id="email" name="email"
                    value={currentStudent.email} onChange={handleInputChange}
                    className="manage-students-form-input" required />
                </div>

                {/* Generated password (add mode) */}
                {modalMode === 'add' && currentStudent.password && (
                  <div className="manage-students-form-group">
                    <label className="manage-students-form-label">Generated Password</label>
                    <input type="text" value={currentStudent.password}
                      className="manage-students-form-input" readOnly
                      style={{ backgroundColor:'#f5f5f5', cursor:'not-allowed' }} />
                    <p className="manage-students-form-hint">
                      Format: lastname + birthday (MMDDYYYY). Will be sent to the student's email.
                    </p>
                  </div>
                )}

                {/* Password change (edit mode) */}
                {modalMode === 'edit' && (
                  <div className="manage-students-form-group">
                    <label htmlFor="password" className="manage-students-form-label">
                      New Password (leave blank to keep current)
                    </label>
                    <input type="password" id="password" name="password"
                      value={currentStudent.password} onChange={handleInputChange}
                      className="manage-students-form-input" placeholder="Enter new password or leave blank" />
                  </div>
                )}

                <div className="manage-students-modal-actions">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="manage-students-button manage-students-button-secondary">Cancel</button>
                  <button type="submit" className="manage-students-button manage-students-button-primary">
                    <Save size={18} className="manage-students-button-icon" />
                    {modalMode === 'add' ? 'Create Student' : 'Update Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {showDeleteConfirm && (
        <div className="manage-students-modal-overlay">
          <div className="manage-students-confirm-modal">
            <h3 className="manage-students-confirm-title">Confirm Delete</h3>
            <p className="manage-students-confirm-text">
              Are you sure you want to delete this student? This action cannot be undone.
            </p>
            <div className="manage-students-confirm-actions">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="manage-students-button manage-students-button-secondary">Cancel</button>
              <button onClick={handleDelete}
                className="manage-students-button manage-students-button-danger">
                <Trash2 size={18} className="manage-students-button-icon" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Requirements Sub-Modal ── */}
      {showRequirementsModal && (
        <RequirementsModal
          onClose={() => setShowRequirementsModal(false)}
          studentName={subModalStudentName}
          userId={currentStudent.user_id || null}
          initialChecked={localRequirements}
          onSaveLocal={checked => setLocalRequirements(checked)}
        />
      )}

      {/* ── Enrolled Courses Sub-Modal ── */}
      {showCoursesModal && (
        <EnrolledCoursesModal
          onClose={() => setShowCoursesModal(false)}
          studentName={subModalStudentName}
          userId={currentStudent.user_id || null}
          initialSelectedIds={localCourseIds.size > 0 ? [...localCourseIds] : null}
          onSaveLocal={(ids, data) => { setLocalCourseIds(ids); setLocalCoursesData(data); }}
        />
      )}
    </div>
  );
};

export default ManageStudents;