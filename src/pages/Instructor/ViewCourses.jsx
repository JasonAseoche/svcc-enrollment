import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, ArrowLeft, AlertCircle } from 'lucide-react';
import '../../components/InstructorLayout/ViewCourses.css';

// Mock data for courses
const MOCK_COURSES = [
  {
    id: 1,
    courseName: 'Data Structures and Algorithms',
    enrolledStudents: 35,
    time: '7:00 AM - 9:00 AM',
    schedule: 'Monday, Wednesday',
    section: 'BSIT-301'
  },
  {
    id: 2,
    courseName: 'Web Development 2',
    enrolledStudents: 28,
    time: '9:00 AM - 11:00 AM',
    schedule: 'Monday, Wednesday',
    section: 'BSIT-301'
  },
  {
    id: 3,
    courseName: 'Database Management Systems',
    enrolledStudents: 32,
    time: '1:00 PM - 3:00 PM',
    schedule: 'Tuesday, Thursday',
    section: 'BSIT-302'
  },
  {
    id: 4,
    courseName: 'Software Engineering',
    enrolledStudents: 30,
    time: '8:00 AM - 10:00 AM',
    schedule: 'Tuesday, Thursday',
    section: 'BSIT-201'
  },
  {
    id: 5,
    courseName: 'Mobile Application Development',
    enrolledStudents: 25,
    time: '10:00 AM - 12:00 PM',
    schedule: 'Friday',
    section: 'BSIT-302'
  },
  {
    id: 6,
    courseName: 'Computer Networks',
    enrolledStudents: 27,
    time: '2:00 PM - 4:00 PM',
    schedule: 'Wednesday, Friday',
    section: 'BSIT-201'
  }
];

// Mock data for students enrolled in courses
const MOCK_ENROLLED_STUDENTS = {
  1: [
    { id: 1, studentNumber: 'STU-2024-001', name: 'Maria Santos', yearLevel: '3rd Year', status: 'Active' },
    { id: 2, studentNumber: 'STU-2024-002', name: 'Juan Dela Cruz', yearLevel: '3rd Year', status: 'Active' },
    { id: 3, studentNumber: 'STU-2024-003', name: 'Ana Reyes', yearLevel: '3rd Year', status: 'Active' },
    { id: 4, studentNumber: 'STU-2024-004', name: 'Carlos Mendez', yearLevel: '3rd Year', status: 'Active' },
    { id: 5, studentNumber: 'STU-2024-005', name: 'Lisa Garcia', yearLevel: '3rd Year', status: 'Inactive' }
  ],
  2: [
    { id: 6, studentNumber: 'STU-2024-006', name: 'Robert Torres', yearLevel: '3rd Year', status: 'Active' },
    { id: 7, studentNumber: 'STU-2024-007', name: 'Elena Martinez', yearLevel: '3rd Year', status: 'Active' },
    { id: 8, studentNumber: 'STU-2024-008', name: 'Pedro Gonzales', yearLevel: '3rd Year', status: 'Active' }
  ],
  3: [
    { id: 9, studentNumber: 'STU-2024-009', name: 'Sofia Ramirez', yearLevel: '3rd Year', status: 'Active' },
    { id: 10, studentNumber: 'STU-2024-010', name: 'Diego Rivera', yearLevel: '3rd Year', status: 'Active' },
    { id: 11, studentNumber: 'STU-2024-011', name: 'Carmen Lopez', yearLevel: '3rd Year', status: 'Active' }
  ],
  4: [
    { id: 12, studentNumber: 'STU-2024-012', name: 'Miguel Fernandez', yearLevel: '2nd Year', status: 'Active' },
    { id: 13, studentNumber: 'STU-2024-013', name: 'Isabel Cruz', yearLevel: '2nd Year', status: 'Active' }
  ],
  5: [
    { id: 14, studentNumber: 'STU-2024-014', name: 'Antonio Morales', yearLevel: '3rd Year', status: 'Active' },
    { id: 15, studentNumber: 'STU-2024-015', name: 'Lucia Hernandez', yearLevel: '3rd Year', status: 'Active' }
  ],
  6: [
    { id: 16, studentNumber: 'STU-2024-016', name: 'Fernando Castro', yearLevel: '2nd Year', status: 'Active' },
    { id: 17, studentNumber: 'STU-2024-017', name: 'Gabriela Diaz', yearLevel: '2nd Year', status: 'Active' }
  ]
};

const ViewCourses = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'students'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Search states
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Initialize with mock data
  useEffect(() => {
    setCourses(MOCK_COURSES);
  }, []);

  // Filter courses by search term
  const filteredCourses = useMemo(() => {
    const courseArray = Array.isArray(courses) ? courses : [];
    if (!courseSearchTerm) return courseArray;
    const searchLower = courseSearchTerm.toLowerCase();
    return courseArray.filter(course => 
      course.courseName.toLowerCase().includes(searchLower) ||
      course.section.toLowerCase().includes(searchLower) ||
      course.schedule.toLowerCase().includes(searchLower)
    );
  }, [courses, courseSearchTerm]);

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    const studentArray = Array.isArray(students) ? students : [];
    if (!studentSearchTerm) return studentArray;
    const searchLower = studentSearchTerm.toLowerCase();
    return studentArray.filter(student => 
      student.name.toLowerCase().includes(searchLower) ||
      student.studentNumber.toLowerCase().includes(searchLower)
    );
  }, [students, studentSearchTerm]);

  // View handlers
  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setCurrentView('students');
    // Load students from mock data
    const enrolledStudents = MOCK_ENROLLED_STUDENTS[course.id] || [];
    setStudents(enrolledStudents);
    setStudentSearchTerm('');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedCourse(null);
    setStudentSearchTerm('');
  };

  // Render course list view
  const renderListView = () => (
    <div className="viewcourses-container">
      <div className="viewcourses-header-card">
        <div className="viewcourses-header-content">
          <h1 className="viewcourses-page-title">List of Class/Courses</h1>
          <div className="viewcourses-header-actions">
            <div className="viewcourses-search-container">
              <input
                type="text"
                placeholder="Search courses..."
                className="viewcourses-search-input"
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
              />
              <Search className="viewcourses-search-icon" size={18} />
              {courseSearchTerm && (
                <button 
                  onClick={() => setCourseSearchTerm('')}
                  className="viewcourses-search-clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="viewcourses-courses-container">
        {isLoading ? (
          <div className="viewcourses-loading-container">
            <div className="viewcourses-loading-spinner"></div>
            <p className="viewcourses-loading-text">Loading courses...</p>
          </div>
        ) : isError ? (
          <div className="viewcourses-error-container">
            <AlertCircle size={40} className="viewcourses-error-icon" />
            <p className="viewcourses-error-text">Failed to load courses</p>
            <button 
              onClick={() => {
                setIsError(false);
                setCourses(MOCK_COURSES);
              }}
              className="viewcourses-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="viewcourses-empty-container">
            {courseSearchTerm ? (
              <>
                <p className="viewcourses-empty-text">No courses found matching "{courseSearchTerm}"</p>
                <button 
                  onClick={() => setCourseSearchTerm('')}
                  className="viewcourses-empty-action"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="viewcourses-empty-text">No courses available</p>
            )}
          </div>
        ) : (
          <div className="viewcourses-courses-grid">
            {filteredCourses.map((course) => (
              <div key={course.id} className="viewcourses-course-card">
                <div className="viewcourses-card-header">
                  <h3 className="viewcourses-course-name">{course.courseName}</h3>
                  <div className="viewcourses-card-actions">
                    <button
                      onClick={() => handleViewCourse(course)}
                      className="viewcourses-btn viewcourses-btn-view"
                    >
                      View
                    </button>
                  </div>
                </div>
                <div className="viewcourses-card-content">
                  <div className="viewcourses-info-item">
                    <span className="viewcourses-info-label">No. of Enrolled Students:</span>
                    <span className="viewcourses-info-value">{course.enrolledStudents}</span>
                  </div>
                  <div className="viewcourses-info-item">
                    <span className="viewcourses-info-label">Time:</span>
                    <span className="viewcourses-info-value">{course.time}</span>
                  </div>
                  <div className="viewcourses-info-item">
                    <span className="viewcourses-info-label">Schedule:</span>
                    <span className="viewcourses-info-value">{course.schedule}</span>
                  </div>
                  <div className="viewcourses-info-item">
                    <span className="viewcourses-info-label">Section:</span>
                    <span className="viewcourses-info-value">{course.section}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render students view
  const renderStudentsView = () => (
    <div className="viewcourses-container">
      <div className="viewcourses-header-card">
        <div className="viewcourses-header-content">
          <div className="viewcourses-title-with-back">
            <button
              onClick={handleBackToList}
              className="viewcourses-back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="viewcourses-page-title">{selectedCourse?.courseName}</h1>
          </div>
          <div className="viewcourses-header-actions">
            <div className="viewcourses-search-container">
              <input
                type="text"
                placeholder="Search students..."
                className="viewcourses-search-input"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
              />
              <Search className="viewcourses-search-icon" size={18} />
              {studentSearchTerm && (
                <button 
                  onClick={() => setStudentSearchTerm('')}
                  className="viewcourses-search-clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="viewcourses-table-container">
        {isLoading ? (
          <div className="viewcourses-loading-container">
            <div className="viewcourses-loading-spinner"></div>
            <p className="viewcourses-loading-text">Loading students...</p>
          </div>
        ) : isError ? (
          <div className="viewcourses-error-container">
            <AlertCircle size={40} className="viewcourses-error-icon" />
            <p className="viewcourses-error-text">Failed to load students</p>
            <button 
              onClick={() => {
                setIsError(false);
                const enrolledStudents = MOCK_ENROLLED_STUDENTS[selectedCourse.id] || [];
                setStudents(enrolledStudents);
              }}
              className="viewcourses-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="viewcourses-empty-container">
            {studentSearchTerm ? (
              <>
                <p className="viewcourses-empty-text">No students found matching "{studentSearchTerm}"</p>
                <button 
                  onClick={() => setStudentSearchTerm('')}
                  className="viewcourses-empty-action"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="viewcourses-empty-text">No students enrolled</p>
            )}
          </div>
        ) : (
          <div className="viewcourses-table-scroll">
            <table className="viewcourses-table">
              <thead>
                <tr>
                  <th>Student Number</th>
                  <th>Name</th>
                  <th>Year Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td data-label="Student Number:">
                      <div className="viewcourses-student-number">{student.studentNumber}</div>
                    </td>
                    <td data-label="Name:">
                      <div className="viewcourses-student-name">{student.name}</div>
                    </td>
                    <td data-label="Year Level:">{student.yearLevel}</td>
                    <td data-label="Status:">
                      <span className={`viewcourses-status-badge ${student.status.toLowerCase()}`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return currentView === 'list' ? renderListView() : renderStudentsView();
};

export default ViewCourses;