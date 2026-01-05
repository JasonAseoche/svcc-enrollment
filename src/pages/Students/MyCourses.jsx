import React, { useState } from 'react';
import '../../components/StudentLayout/MyCourses.css';

const MyCourses = () => {
  const [selectedYearTerm, setSelectedYearTerm] = useState('1st Year - 1st Term');

  const program = 'Bachelor of Science in Information Technology';

  // Sample curriculum data - replace with actual data later
  const courses = [
    {
      id: 1,
      courseCode: 'IT 111',
      courseName: 'Introduction to Computing',
      unitsRequired: 3,
      unitsTaken: 3,
      grade: 1.75,
      preRequisite: 'None',
      status: 'Taken'
    },
    {
      id: 2,
      courseCode: 'IT 112',
      courseName: 'Computer Programming 1',
      unitsRequired: 3,
      unitsTaken: 3,
      grade: 1.50,
      preRequisite: 'IT 111',
      status: 'Taken'
    },
    {
      id: 3,
      courseCode: 'IT 121',
      courseName: 'Data Structures and Algorithms',
      unitsRequired: 3,
      unitsTaken: 3,
      grade: null,
      preRequisite: 'IT 112',
      status: 'In-Progress'
    },
    {
      id: 4,
      courseCode: 'IT 122',
      courseName: 'Object-Oriented Programming',
      unitsRequired: 3,
      unitsTaken: 3,
      grade: null,
      preRequisite: 'IT 112',
      status: 'In-Progress'
    },
    {
      id: 5,
      courseCode: 'IT 211',
      courseName: 'Database Management Systems',
      unitsRequired: 3,
      unitsTaken: 0,
      grade: null,
      preRequisite: 'IT 121',
      status: 'Not Yet Taken'
    },
    {
      id: 6,
      courseCode: 'IT 212',
      courseName: 'Web Development',
      unitsRequired: 3,
      unitsTaken: 0,
      grade: null,
      preRequisite: 'IT 122',
      status: 'Not Yet Taken'
    },
    {
      id: 7,
      courseCode: 'EUTH 2',
      courseName: 'Euthenics 2',
      unitsRequired: 1,
      unitsTaken: 1,
      grade: 2.00,
      preRequisite: 'EUTH 1',
      status: 'Taken'
    },
    {
      id: 8,
      courseCode: 'PE 101',
      courseName: 'Physical Education 1',
      unitsRequired: 2,
      unitsTaken: 2,
      grade: 1.25,
      preRequisite: 'None',
      status: 'Taken'
    }
  ];

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

  return (
    <div className="svcc-mycourses-container">
      <div className="svcc-mycourses-header">
        <div className="svcc-mycourses-header-left">
          <select 
            className="svcc-mycourses-select"
            value={selectedYearTerm}
            onChange={(e) => setSelectedYearTerm(e.target.value)}
          >
            <option>1st Year - 1st Term</option>
            <option>1st Year - 2nd Term</option>
            <option>2nd Year - 1st Term</option>
            <option>2nd Year - 2nd Term</option>
            <option>3rd Year - 1st Term</option>
            <option>3rd Year - 2nd Term</option>
            <option>4th Year - 1st Term</option>
            <option>4th Year - 2nd Term</option>
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
      </div>

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
    </div>
  );
};

export default MyCourses;