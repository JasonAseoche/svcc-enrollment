import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import '../../components/StudentLayout/DashboardStudents.css';
import { getCurrentUser } from '../../utils/auth';

const DashboardStudents = () => {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestGrade, setLatestGrade] = useState(null);
  const [allSchedules, setAllSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState('today');
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState({
    isEnrolled: false,
    status: 'unenrolled',
    steps: [],
    currentStep: 0,
    message: '',
    application_status: '',
    section_name: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchDashboardData = useCallback(async (dayFilter = null) => {
    if (!user || !user.user_id) {
      setError('User not found');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching dashboard data for user:', user.user_id);
      
      // FIXED: Always fetch ALL schedules first to populate the dropdown
      // Then filter on frontend based on selected day
      let url = `http://localhost/svcc-enrollment/dashboard_students.php?user_id=${user.user_id}`;
      // Don't pass day filter to API - we'll filter on frontend
      
      const response = await fetch(url);
      const result = await response.json();

      console.log('Dashboard API Response:', result);

      if (result.success) {
        const { data } = result;

        // Set latest grade
        if (data.latestGrade) {
          setLatestGrade(data.latestGrade);
        }

        // Set schedules - always store ALL schedules
        if (data.schedules && data.schedules.length > 0) {
          setAllSchedules(data.schedules);
        } else {
          setAllSchedules([]);
        }

        // Set enrollment status
        const newEnrollmentStatus = {
          isEnrolled: data.enrollment.isEnrolled,
          status: data.enrollment.status,
          section_name: data.enrollment.section_name || '',
          steps: data.applicationProgress?.steps || [],
          currentStep: data.applicationProgress?.currentStep || 0,
          message: data.applicationProgress?.message || '',
          application_status: data.applicationProgress?.application_status || ''
        };

        setEnrollmentStatus(newEnrollmentStatus);
        setSelectedCourses(data.selectedCourses || []);
        console.log('Enrollment Status Set:', newEnrollmentStatus);
        console.log('Schedules loaded:', data.schedules?.length || 0);

        // Only redirect if truly unenrolled with no pending application
        const noActiveApplication = !data.applicationProgress;
        const safeStatuses = ['pending', 'in_progress', 'evaluated', 'advising_approved'];
        const isSafeStatus = safeStatuses.includes(data.enrollment.status);

        if (!data.enrollment.isEnrolled && noActiveApplication && !isSafeStatus) {
          console.log('No enrollment and no application - redirecting to enrollment page');
          navigate('/exist-enroll');
        }
      } else {
        setError(result.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  // Fetch data once when component mounts
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDayChange = (day) => {
    setSelectedDay(day);
    setShowDayDropdown(false);
  };

  // Get current day name
  const getCurrentDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const today = new Date();
    const dayName = days[today.getDay()];
    const monthName = months[today.getMonth()];
    const day = today.getDate();
    const year = today.getFullYear();
    return `${dayName} | ${monthName} ${day}, ${year}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return '#ffa500';
      case 'In Progress':
        return '#2196F3';
      case 'For Approval':
        return '#ff9800';
      case 'Completed':
        return '#4caf50';
      case 'Rejected':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  // Group schedules by day
  const groupedSchedules = allSchedules.reduce((acc, schedule) => {
    const day = schedule.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {});

  // Get display schedules based on selected filter
  const getDisplaySchedules = () => {
    if (selectedDay === 'all') {
      return allSchedules;
    } else if (selectedDay === 'today') {
      const today = getCurrentDayName();
      return groupedSchedules[today] || [];
    } else {
      return groupedSchedules[selectedDay] || [];
    }
  };

  const displaySchedules = getDisplaySchedules();

  // Get display label for selected day
  const getSelectedDayLabel = () => {
    if (selectedDay === 'all') return 'All Days';
    if (selectedDay === 'today') return `Today (${getCurrentDayName()})`;
    return selectedDay;
  };

  // FIXED: Check if student is enrolled to show filter (not if schedules exist)
  const hasScheduleData = enrollmentStatus.isEnrolled;

  if (loading) {
    return (
      <div className="svcc-dashboard-students-container">
        <div className="svcc-dashboard-students-loading">
          <div className="svcc-dashboard-students-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="svcc-dashboard-students-container">
        <div className="svcc-dashboard-students-error">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={() => fetchDashboardData()} className="svcc-dashboard-students-retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isEnrolled = enrollmentStatus.isEnrolled;
  const hasPendingApplication = enrollmentStatus.steps && enrollmentStatus.steps.length > 0;

  return (
    <div className="svcc-dashboard-students-container">
      <div className={`svcc-dashboard-students-main ${isEnrolled ? 'svcc-enrolled' : ''}`}>
        {/* Left Section - Grades and Schedule */}
        <div className="svcc-dashboard-students-left">
          {/* Latest Grade Card */}
          {latestGrade ? (
            <div className="svcc-dashboard-students-grade-card">
              <div className="svcc-dashboard-students-grade-header">
                <div>
                  <h2 className="svcc-dashboard-students-grade-title">Latest Grade</h2>
                  <p className="svcc-dashboard-students-grade-date">AS OF {latestGrade.date}</p>
                </div>
                <button className="svcc-dashboard-students-view-all-btn">VIEW ALL</button>
              </div>
              <div className="svcc-dashboard-students-grade-divider"></div>
              <div className="svcc-dashboard-students-grade-content">
                <div className="svcc-dashboard-students-grade-info">
                  <h3 className="svcc-dashboard-students-subject-name">{latestGrade.subject}</h3>
                  <p className="svcc-dashboard-students-instructor-name">{latestGrade.instructor}</p>
                </div>
                <div className="svcc-dashboard-students-grade-value">
                  <span className="svcc-dashboard-students-grade-number">{latestGrade.grade}</span>
                  <span className="svcc-dashboard-students-grade-type">{latestGrade.gradeType}</span>
                </div>
              </div>
            </div>
          ) : isEnrolled && (
            <div className="svcc-dashboard-students-grade-card">
              <div className="svcc-dashboard-students-grade-header">
                <div>
                  <h2 className="svcc-dashboard-students-grade-title">Latest Grade</h2>
                  <p className="svcc-dashboard-students-grade-date">NO GRADES YET</p>
                </div>
              </div>
              <div className="svcc-dashboard-students-grade-divider"></div>
              <div className="svcc-dashboard-students-no-schedule">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No grades posted yet</p>
              </div>
            </div>
          )}

          {/* Class Schedule Card */}
          <div className="svcc-dashboard-students-schedule-card">
            <div className="svcc-dashboard-students-schedule-header">
              <div>
                <h2 className="svcc-dashboard-students-schedule-title">Class Schedule</h2>
                <p className="svcc-dashboard-students-schedule-date">
                  {enrollmentStatus.section_name ? `Section: ${enrollmentStatus.section_name}` : getCurrentDate()}
                </p>
              </div>
              <div className="svcc-dashboard-students-schedule-actions">
                {/* FIXED: Show filter if enrolled, regardless of schedule count */}
                {hasScheduleData && (
                  <div className="svcc-dashboard-students-day-filter">
                    <button 
                      className="svcc-dashboard-students-day-filter-btn"
                      onClick={() => setShowDayDropdown(!showDayDropdown)}
                    >
                      <span>{getSelectedDayLabel()}</span>
                      <ChevronDown size={16} className={showDayDropdown ? 'rotated' : ''} />
                    </button>
                    {showDayDropdown && (
                      <div className="svcc-dashboard-students-day-dropdown">
                        <button 
                          onClick={() => handleDayChange('today')}
                          className={selectedDay === 'today' ? 'active' : ''}
                        >
                          Today ({getCurrentDayName()})
                          {groupedSchedules[getCurrentDayName()] && ` (${groupedSchedules[getCurrentDayName()].length})`}
                        </button>
                        <button 
                          onClick={() => handleDayChange('all')}
                          className={selectedDay === 'all' ? 'active' : ''}
                        >
                          All Days {allSchedules.length > 0 && `(${allSchedules.length})`}
                        </button>
                        <div className="svcc-dashboard-students-dropdown-divider"></div>
                        {daysOfWeek.map(day => (
                          <button 
                            key={day}
                            onClick={() => handleDayChange(day)}
                            className={selectedDay === day ? 'active' : ''}
                            disabled={!groupedSchedules[day] || groupedSchedules[day].length === 0}
                          >
                            {day}
                            {groupedSchedules[day] && ` (${groupedSchedules[day].length})`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="svcc-dashboard-students-schedule-divider"></div>
            {displaySchedules.length > 0 ? (
              <div className="svcc-dashboard-students-schedule-table">
                <table>
                  <thead>
                    <tr>
                      {selectedDay === 'all' && <th>DAY</th>}
                      <th>SUBJECT</th>
                      <th>TIME</th>
                      <th>ROOM</th>
                      <th>PROFESSOR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displaySchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        {selectedDay === 'all' && (
                          <td className="svcc-dashboard-students-day-cell">{schedule.day}</td>
                        )}
                        <td className="svcc-dashboard-students-subject-cell">
                          <div className="svcc-dashboard-students-subject-info">
                            <span className="svcc-dashboard-students-course-code">{schedule.courseCode}</span>
                            <span className="svcc-dashboard-students-course-name">{schedule.subject}</span>
                          </div>
                        </td>
                        <td>{schedule.time}</td>
                        <td>{schedule.room}</td>
                        <td className="svcc-dashboard-students-professor-cell">{schedule.professor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="svcc-dashboard-students-no-schedule">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>
                  {isEnrolled 
                    ? (selectedDay === 'all' 
                        ? 'No classes scheduled yet' 
                        : selectedDay === 'today' 
                          ? `No classes scheduled for today (${getCurrentDayName()})` 
                          : `No classes scheduled for ${selectedDay}`)
                    : 'Enroll to view class schedule'}
                </p>
                {isEnrolled && allSchedules.length === 0 && (
                  <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                    Schedule details will appear once your section schedules are set up
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        

        {/* Right Section - Enrollment Progress */}
        {hasPendingApplication && (
          <div className="svcc-dashboard-students-right">
            <div className="svcc-dashboard-students-enrollment-card">
              <div className="svcc-dashboard-students-enrollment-header">
                <h2 className="svcc-dashboard-students-enrollment-title">Enrollment Application</h2>
                <span 
                  className="svcc-dashboard-students-enrollment-status1"
                >
                  {enrollmentStatus.status}
                </span>
              </div>

              <div className="svcc-dashboard-students-enrollment-progress">
                {enrollmentStatus.steps.map((step, index) => (
                  <div key={step.id} className="svcc-dashboard-students-progress-step">
                    <div className="svcc-dashboard-students-progress-indicator">
                      <div 
                        className={`svcc-dashboard-students-progress-circle ${
                          step.completed ? 'svcc-completed' : 
                          enrollmentStatus.currentStep === index ? 'svcc-current' : ''
                        }`}
                      >
                        {step.completed ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <span>{step.id}</span>
                        )}
                      </div>
                      {index < enrollmentStatus.steps.length - 1 && (
                        <div 
                          className={`svcc-dashboard-students-progress-line ${
                            step.completed ? 'svcc-completed' : ''
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="svcc-dashboard-students-progress-content">
                      <h4 className={step.completed ? 'svcc-completed-text' : ''}>{step.name}</h4>
                      {step.completed && (
                        <p className="svcc-dashboard-students-progress-completed">Completed</p>
                      )}
                      {!step.completed && enrollmentStatus.currentStep === index && (
                        <p className="svcc-dashboard-students-progress-current">In Progress</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {enrollmentStatus.application_status === 'advising_approved' && (
                <div className="svcc-dashboard-students-enrollment-message" style={{flexDirection:'column', alignItems:'flex-start', gap:'10px'}}>
                  <p style={{margin:0}}>Your advising is complete. Please upload your <strong>payment receipt</strong> (optional) to finalize enrollment.</p>
                  <input type="file" accept="image/*,application/pdf" id="receiptFile" style={{display:'none'}} onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('user_id', user.user_id);
                    fd.append('receipt', file);
                    const res = await fetch('http://localhost/svcc-enrollment/upload_payment_receipt.php', { method: 'POST', body: fd });
                    const json = await res.json();
                    if (json.success) { alert('Receipt uploaded! Awaiting admin verification.'); setTimeout(() => fetchDashboardData(), 500); }
                    else alert('Upload failed: ' + json.error);
                  }} />
                  <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                    <button
                      className="svcc-dashboard-students-view-details-btn"
                      onClick={() => document.getElementById('receiptFile').click()}
                    >
                      Submit with Receipt
                    </button>
                    <button
                      className="svcc-dashboard-students-contact-btn"
                      onClick={async () => {
                        const fd = new FormData();
                        fd.append('user_id', user.user_id);
                        fd.append('skip_receipt', '1');
                        const res = await fetch('http://localhost/svcc-enrollment/upload_payment_receipt.php', { method: 'POST', body: fd });
                        const json = await res.json();
                        if (json.success) { alert('Submitted! Awaiting admin approval.'); setTimeout(() => fetchDashboardData(), 500); }
                        else alert('Failed: ' + json.error);
                      }}
                    >
                      Submit Without Receipt
                    </button>
                  </div>
                </div>
              )}
              {enrollmentStatus.message && enrollmentStatus.application_status !== 'head_approved' && enrollmentStatus.application_status !== 'advising_approved' && (
                <div className="svcc-dashboard-students-enrollment-message">
                  <div className="svcc-dashboard-students-message-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#2196F3" strokeWidth="2"/>
                      <path d="M10 6V10" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M10 14H10.01" stroke="#2196F3" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p>{enrollmentStatus.message}</p>
                </div>
              )}

              <div className="svcc-dashboard-students-enrollment-actions">
                <button className="svcc-dashboard-students-view-details-btn">
                  View Details
                </button>
                <button className="svcc-dashboard-students-contact-btn">
                  Contact Registrar
                </button>
              </div>
            </div>
          </div>
        )}

            {/* Selected Courses — below schedule inside left card */}
            {!enrollmentStatus.isEnrolled && selectedCourses.length > 0 && (
              <div className="svcc-dashboard-selected-courses">
                <div className="svcc-dashboard-students-schedule-divider"></div>
                <h3 className="svcc-dashboard-selected-courses-title">Selected Courses</h3>
                <div className="svcc-dashboard-courses-table-wrap">
                  <table className="svcc-dashboard-courses-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Course Name</th>
                        <th>Units</th>
                        <th>Status</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCourses.map(c => (
                        <tr key={c.selectionId}>
                          <td className="svcc-dashboard-course-code">{c.courseCode}</td>
                          <td>{c.courseName}</td>
                          <td className="svcc-dashboard-course-units">{c.units}</td>
                          <td>
                            <span className={`svcc-dashboard-course-status svcc-dashboard-course-status--${c.status}`}>
                              {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                            </span>
                          </td>
                          <td className="svcc-dashboard-course-note">
                            {c.status === 'changed' && c.replacedByCourse
                              ? `→ ${c.replacedByCourseCode} - ${c.replacedByCourse}`
                              : c.replacedByCourse ? `→ ${c.replacedByCourse}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
  );
};

export default DashboardStudents;