import React, { useState, useEffect } from 'react';
import '../../components/StudentLayout/MyCourses.css';

const MyCourses = () => {
  const [selectedYearTerm, setSelectedYearTerm] = useState('');
  const [program, setProgram] = useState('Bachelor of Science in Information Technology');
  const [courses, setCourses] = useState([]);
  const [totalUnitsRequired, setTotalUnitsRequired] = useState(0);
  const [totalUnitsTaken, setTotalUnitsTaken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Get user_id from localStorage
  const getUserId = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.user_id;
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  };

  // Fetch student's current year and term on initial load
  useEffect(() => {
    const fetchCurrentYearTerm = async () => {
      const userId = getUserId();
      
      if (!userId) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost/svcc-enrollment/mycourses_api.php?action=get_current_year_term&user_id=${userId}`
        );
        
        const data = await response.json();
        
        if (data.success) {
          setSelectedYearTerm(data.data.display);
          setInitialized(true);
        } else {
          // Fallback to 1st Year - 1st Term if not found
          setSelectedYearTerm('1st Year - 1st Term');
          setInitialized(true);
        }
      } catch (err) {
        console.error('Error fetching current year/term:', err);
        // Fallback to 1st Year - 1st Term on error
        setSelectedYearTerm('1st Year - 1st Term');
        setInitialized(true);
      }
    };

    fetchCurrentYearTerm();
  }, []);

  // Fetch curriculum data from API
  const fetchCurriculum = async (yearTerm) => {
    const userId = getUserId();
    
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Split year_level and term
      const [yearLevel, term] = yearTerm.split(' - ');
      
      const response = await fetch(
        `http://localhost/svcc-enrollment/mycourses_api.php?action=get_curriculum&user_id=${userId}&year_level=${encodeURIComponent(yearLevel)}&term=${encodeURIComponent(term)}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setProgram(data.data.program);
        setCourses(data.data.courses);
        setTotalUnitsRequired(data.data.totalUnitsRequired || 0);
        setTotalUnitsTaken(data.data.totalUnitsTaken || 0);
      } else {
        setError(data.message || 'Failed to load curriculum');
      }
    } catch (err) {
      console.error('Error fetching curriculum:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch curriculum on component mount and when selected year/term changes
  useEffect(() => {
    if (initialized && selectedYearTerm) {
      fetchCurriculum(selectedYearTerm);
    }
  }, [selectedYearTerm, initialized]);

  const handleYearTermChange = (e) => {
    setSelectedYearTerm(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Taken':
        return '#10b981'; // Green
      case 'In-Progress':
        return '#f59e0b'; // Orange
      case 'Not Yet Taken':
        return '#6b7280'; // Gray
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Taken':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'In-Progress':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case 'Not Yet Taken':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="svcc-mycourses-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          fontSize: '16px',
          color: '#6b7280'
        }}>
          Loading curriculum...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="svcc-mycourses-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          fontSize: '16px',
          color: '#d10f0f'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="svcc-mycourses-container">
      <div className="svcc-mycourses-header">
        <div className="svcc-mycourses-header-left">
          <select 
            className="svcc-mycourses-select"
            value={selectedYearTerm}
            onChange={handleYearTermChange}
          >
            <option value="1st Year - 1st Term">1st Year - 1st Sem</option>
            <option value="1st Year - 2nd Term">1st Year - 2nd Sem</option>
            <option value="2nd Year - 1st Term">2nd Year - 1st Sem</option>
            <option value="2nd Year - 2nd Term">2nd Year - 2nd Sem</option>
            <option value="3rd Year - 1st Term">3rd Year - 1st Sem</option>
            <option value="3rd Year - 2nd Term">3rd Year - 2nd Sem</option>
            <option value="4th Year - 1st Term">4th Year - 1st Sem</option>
            <option value="4th Year - 2nd Term">4th Year - 2nd Sem</option>
          </select>
        </div>
        <div className="svcc-mycourses-header-right">
          <div className="svcc-mycourses-program">
            <svg className="svcc-mycourses-program-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
            <span className="svcc-mycourses-program-text">{program}</span>
          </div>
        </div>
      </div>

      <div className="svcc-mycourses-legend">
        <div className="svcc-mycourses-legend-item">
          <div className="svcc-mycourses-legend-icon" style={{ color: getStatusColor('Taken') }}>
            {getStatusIcon('Taken')}
          </div>
          <span className="svcc-mycourses-legend-text">Taken</span>
        </div>
        <div className="svcc-mycourses-legend-item">
          <div className="svcc-mycourses-legend-icon" style={{ color: getStatusColor('In-Progress') }}>
            {getStatusIcon('In-Progress')}
          </div>
          <span className="svcc-mycourses-legend-text">In-Progress</span>
        </div>
        <div className="svcc-mycourses-legend-item">
          <div className="svcc-mycourses-legend-icon" style={{ color: getStatusColor('Not Yet Taken') }}>
            {getStatusIcon('Not Yet Taken')}
          </div>
          <span className="svcc-mycourses-legend-text">Not Yet Taken</span>
        </div>
        <div className="svcc-mycourses-legend-divider"></div>
        <div className="svcc-mycourses-legend-item">
          <span className="svcc-mycourses-legend-text">
            <strong>Units Required:</strong> {totalUnitsRequired}
          </span>
        </div>
        <div className="svcc-mycourses-legend-item">
          <span className="svcc-mycourses-legend-text">
            <strong>Units Taken:</strong> {totalUnitsTaken}
          </span>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="svcc-mycourses-empty">
          <p>No courses found for this term.</p>
        </div>
      ) : (
        <div className="svcc-mycourses-list">
          {courses.map((course) => (
            <div key={course.id} className="svcc-mycourses-card">
              <div className="svcc-mycourses-card-header">
                <div className="svcc-mycourses-card-title">
                  <span className="svcc-mycourses-code">{course.courseCode}</span>
                  <h3 className="svcc-mycourses-name">{course.courseName}</h3>
                </div>
                <div 
                  className="svcc-mycourses-status-badge" 
                  style={{ 
                    backgroundColor: `${getStatusColor(course.status)}15`,
                    color: getStatusColor(course.status)
                  }}
                >
                  <div className="svcc-mycourses-status-icon">
                    {getStatusIcon(course.status)}
                  </div>
                  <span>{course.status}</span>
                </div>
              </div>

              <div className="svcc-mycourses-card-grid">
                <div className="svcc-mycourses-info-item">
                  <span className="svcc-mycourses-info-label">Units Required</span>
                  <span className="svcc-mycourses-info-value">{course.unitsRequired}</span>
                </div>
                <div className="svcc-mycourses-info-item">
                  <span className="svcc-mycourses-info-label">Units Taken</span>
                  <span className="svcc-mycourses-info-value">{course.unitsTaken}</span>
                </div>
                <div className="svcc-mycourses-info-item">
                  <span className="svcc-mycourses-info-label">Grade</span>
                  <span className="svcc-mycourses-info-value">
                    {course.grade ? course.grade.toFixed(2) : '—'}
                  </span>
                </div>
                <div className="svcc-mycourses-info-item svcc-mycourses-prereq">
                  <span className="svcc-mycourses-info-label">Pre-Requisite/Co-Requisite</span>
                  <span className="svcc-mycourses-info-value">{course.preRequisite}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;