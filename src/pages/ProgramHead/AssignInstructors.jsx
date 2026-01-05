import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Settings, ArrowLeft, Search, X, AlertCircle, ChevronDown } from 'lucide-react';
import '../../components/HeadLayout/AssignInstructors.css';

// Mock data for sections
const MOCK_SECTIONS = [
  { 
    id: 1, 
    section: 'BSIT-301', 
    program: 'Bachelor of Science in Information Technology',
    yearLevel: '3rd Year', 
    term: '1st Term',
    enrolledStudents: 35,
    totalClasses: 8,
    assignedInstructors: 6
  },
  { 
    id: 2, 
    section: 'BSIT-302', 
    program: 'Bachelor of Science in Information Technology',
    yearLevel: '3rd Year', 
    term: '1st Term',
    enrolledStudents: 32,
    totalClasses: 8,
    assignedInstructors: 7
  },
  { 
    id: 3, 
    section: 'BSIT-201', 
    program: 'Bachelor of Science in Information Technology',
    yearLevel: '2nd Year', 
    term: '1st Term',
    enrolledStudents: 40,
    totalClasses: 7,
    assignedInstructors: 5
  },
  { 
    id: 4, 
    section: 'BSIT-202', 
    program: 'Bachelor of Science in Information Technology',
    yearLevel: '2nd Year', 
    term: '1st Term',
    enrolledStudents: 38,
    totalClasses: 7,
    assignedInstructors: 7
  }
];

// Mock data for courses/classes per section
const MOCK_COURSES = {
  1: [
    { id: 1, courseCode: 'IT 311', courseName: 'Web Development', section: 'BSIT-301', day: 'Monday', schedule: '08:00 - 10:00', assignedInstructor: 'Prof. Maria Santos' },
    { id: 2, courseCode: 'IT 312', courseName: 'Software Engineering', section: 'BSIT-301', day: 'Monday', schedule: '10:00 - 12:00', assignedInstructor: 'Prof. Juan Cruz' },
    { id: 3, courseCode: 'IT 313', courseName: 'Database Management Systems', section: 'BSIT-301', day: 'Tuesday', schedule: '13:00 - 15:00', assignedInstructor: 'Prof. Pedro Reyes' },
    { id: 4, courseCode: 'IT 314', courseName: 'Data Structures and Algorithms', section: 'BSIT-301', day: 'Wednesday', schedule: '08:00 - 10:00', assignedInstructor: 'Prof. Ana Garcia' },
    { id: 5, courseCode: 'IT 315', courseName: 'System Analysis and Design', section: 'BSIT-301', day: 'Thursday', schedule: '15:00 - 17:00', assignedInstructor: 'Prof. Jose Mendoza' },
    { id: 6, courseCode: 'IT 316', courseName: 'Information Security', section: 'BSIT-301', day: 'Friday', schedule: '10:00 - 12:00', assignedInstructor: 'Prof. Rosa Cruz' },
    { id: 7, courseCode: 'IT 317', courseName: 'Mobile Application Development', section: 'BSIT-301', day: 'Tuesday', schedule: '08:00 - 10:00', assignedInstructor: '' },
    { id: 8, courseCode: 'IT 318', courseName: 'Computer Networks', section: 'BSIT-301', day: 'Friday', schedule: '13:00 - 15:00', assignedInstructor: '' }
  ],
  2: [
    { id: 9, courseCode: 'IT 311', courseName: 'Web Development', section: 'BSIT-302', day: 'Monday', schedule: '13:00 - 15:00', assignedInstructor: 'Prof. Maria Santos' },
    { id: 10, courseCode: 'IT 312', courseName: 'Software Engineering', section: 'BSIT-302', day: 'Tuesday', schedule: '10:00 - 12:00', assignedInstructor: '' }
  ],
  3: [
    { id: 11, courseCode: 'IT 211', courseName: 'Object-Oriented Programming', section: 'BSIT-201', day: 'Monday', schedule: '08:00 - 10:00', assignedInstructor: 'Prof. Juan Cruz' }
  ],
  4: []
};

// Mock data for instructors
const MOCK_INSTRUCTORS = [
  { id: 1, name: 'Prof. Maria Santos', department: 'IT Department', specialization: 'Web Development' },
  { id: 2, name: 'Prof. Juan Cruz', department: 'IT Department', specialization: 'Software Engineering' },
  { id: 3, name: 'Prof. Pedro Reyes', department: 'IT Department', specialization: 'Database Systems' },
  { id: 4, name: 'Prof. Ana Garcia', department: 'IT Department', specialization: 'Data Structures' },
  { id: 5, name: 'Prof. Jose Mendoza', department: 'IT Department', specialization: 'System Analysis' },
  { id: 6, name: 'Prof. Rosa Cruz', department: 'IT Department', specialization: 'Information Security' },
  { id: 7, name: 'Prof. Carlos Ramos', department: 'IT Department', specialization: 'Mobile Development' },
  { id: 8, name: 'Prof. Linda Torres', department: 'IT Department', specialization: 'Computer Networks' },
  { id: 9, name: 'Prof. Miguel Flores', department: 'IT Department', specialization: 'Artificial Intelligence' },
  { id: 10, name: 'Prof. Elena Bautista', department: 'IT Department', specialization: 'Cybersecurity' }
];

const AssignInstructors = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'courses'
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructors, setInstructors] = useState([]);
  
  // Modal state
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  
  // Message
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setSections(MOCK_SECTIONS);
    setCourses(MOCK_COURSES);
    setInstructors(MOCK_INSTRUCTORS);
  }, []);

  useEffect(() => {
    if (instructorSearch) {
      const filtered = instructors.filter(instructor =>
        instructor.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
        instructor.specialization.toLowerCase().includes(instructorSearch.toLowerCase())
      );
      setFilteredInstructors(filtered);
      setShowInstructorDropdown(true);
    } else {
      setFilteredInstructors(instructors);
      setShowInstructorDropdown(false);
    }
  }, [instructorSearch, instructors]);

  const handleViewSection = (section) => {
    setSelectedSection(section);
    setCurrentView('courses');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedSection(null);
  };

  const handleOpenAssignModal = (course) => {
    setSelectedCourse(course);
    setInstructorSearch(course.assignedInstructor || '');
    setShowInstructorModal(true);
  };

  const handleSelectInstructor = (instructor) => {
    setInstructorSearch(instructor.name);
    setShowInstructorDropdown(false);
  };

  const handleAssignInstructor = () => {
    if (!instructorSearch.trim()) {
      setMessage({ text: 'Please select an instructor', type: 'error' });
      return;
    }

    // Update the course with the assigned instructor
    const updatedCourses = { ...courses };
    updatedCourses[selectedSection.id] = updatedCourses[selectedSection.id].map(course =>
      course.id === selectedCourse.id
        ? { ...course, assignedInstructor: instructorSearch }
        : course
    );
    setCourses(updatedCourses);

    // Update section stats
    const assignedCount = updatedCourses[selectedSection.id].filter(c => c.assignedInstructor).length;
    setSections(sections.map(section =>
      section.id === selectedSection.id
        ? { ...section, assignedInstructors: assignedCount }
        : section
    ));

    setMessage({ text: 'Instructor assigned successfully', type: 'success' });
    setShowInstructorModal(false);
    setInstructorSearch('');
    setSelectedCourse(null);
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Render Sections List View
  const renderListView = () => (
    <div className="assign-instructors-container">
      <div className="assign-instructors-header-card">
        <div className="assign-instructors-header-content">
          <h1 className="assign-instructors-page-title">Assign Instructors</h1>
        </div>
      </div>

      {message.text && (
        <div className={`assign-instructors-message ${message.type === 'success' ? 'assign-instructors-message-success' : 'assign-instructors-message-error'}`}>
          <AlertCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      <div className="assign-instructors-cards-grid">
        {sections.map(section => (
          <div key={section.id} className="assign-instructors-card">
            <div className="assign-instructors-card-header">
              <div className="assign-instructors-section-badge">{section.section}</div>
              <button onClick={() => handleViewSection(section)} className="assign-instructors-view-btn" title="View Classes">
                <Eye size={18} />
              </button>
            </div>

            <div className="assign-instructors-card-body">
              <h3 className="assign-instructors-card-title">{section.program}</h3>
              
              <div className="assign-instructors-card-info">
                <span className="assign-instructors-info-label">Year Level:</span>
                <span className="assign-instructors-info-value">{section.yearLevel}</span>
              </div>

              <div className="assign-instructors-card-info">
                <span className="assign-instructors-info-label">Term:</span>
                <span className="assign-instructors-info-value">{section.term}</span>
              </div>

              <div className="assign-instructors-card-info">
                <span className="assign-instructors-info-label">Enrolled Students:</span>
                <span className="assign-instructors-info-value">{section.enrolledStudents}</span>
              </div>

              <div className="assign-instructors-card-info">
                <span className="assign-instructors-info-label">Total Classes:</span>
                <span className="assign-instructors-info-value">{section.totalClasses}</span>
              </div>

              <div className="assign-instructors-card-info">
                <span className="assign-instructors-info-label">Assigned Instructors:</span>
                <span className={`assign-instructors-info-value ${section.assignedInstructors === section.totalClasses ? 'complete' : 'incomplete'}`}>
                  {section.assignedInstructors}/{section.totalClasses}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Courses View
  const renderCoursesView = () => {
    const sectionCourses = courses[selectedSection?.id] || [];

    return (
      <div className="assign-instructors-container">
        <div className="assign-instructors-header-card">
          <div className="assign-instructors-header-content">
            <div className="assign-instructors-title-with-back">
              <button onClick={handleBackToList} className="assign-instructors-back-btn">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="assign-instructors-page-title">{selectedSection?.section}</h1>
                <p className="assign-instructors-subtitle">
                  {selectedSection?.yearLevel} - {selectedSection?.term} • {selectedSection?.enrolledStudents} Students
                </p>
              </div>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`assign-instructors-message ${message.type === 'success' ? 'assign-instructors-message-success' : 'assign-instructors-message-error'}`}>
            <AlertCircle size={20} />
            <span>{message.text}</span>
          </div>
        )}

        <div className="assign-instructors-table-container">
          <table className="assign-instructors-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Section</th>
                <th>Day</th>
                <th>Schedule</th>
                <th>Assigned Instructor</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sectionCourses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="assign-instructors-empty">No classes found</td>
                </tr>
              ) : (
                sectionCourses.map(course => (
                  <tr key={course.id}>
                    <td data-label="Course Code">
                      <span className="assign-instructors-course-code">{course.courseCode}</span>
                    </td>
                    <td data-label="Course Name">{course.courseName}</td>
                    <td data-label="Section">{course.section}</td>
                    <td data-label="Day">{course.day}</td>
                    <td data-label="Schedule">{course.schedule}</td>
                    <td data-label="Assigned Instructor">
                      {course.assignedInstructor ? (
                        <span className="assign-instructors-instructor-name">{course.assignedInstructor}</span>
                      ) : (
                        <span className="assign-instructors-unassigned">Not Assigned</span>
                      )}
                    </td>
                    <td data-label="Action" className="assign-instructors-action-cell">
                      <button 
                        onClick={() => handleOpenAssignModal(course)} 
                        className="assign-instructors-manage-btn"
                        title="Manage Instructor"
                      >
                        <Settings size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      {currentView === 'list' ? renderListView() : renderCoursesView()}

      {/* Assign Instructor Modal */}
      {showInstructorModal && (
        <div className="assign-instructors-modal-overlay">
          <div className="assign-instructors-modal">
            <h3 className="assign-instructors-modal-title">Select Instructor</h3>
            <p className="assign-instructors-modal-text">
              Assign an instructor for {selectedCourse?.courseCode} - {selectedCourse?.courseName}
            </p>

            <div className="assign-instructors-form-group">
              <label className="assign-instructors-form-label">Instructor*</label>
              <div className="assign-instructors-search-container">
                <input
                  type="text"
                  value={instructorSearch}
                  onChange={(e) => setInstructorSearch(e.target.value)}
                  onFocus={() => setShowInstructorDropdown(true)}
                  className="assign-instructors-form-input"
                  placeholder="Type to search or select an instructor..."
                />
                <Search className="assign-instructors-search-icon" size={16} />
                {instructorSearch && (
                  <button 
                    onClick={() => { setInstructorSearch(''); setShowInstructorDropdown(false); }} 
                    className="assign-instructors-clear-btn"
                  >
                    <X size={16} />
                  </button>
                )}

                {showInstructorDropdown && (
                  <div className="assign-instructors-instructor-dropdown">
                    {filteredInstructors.length === 0 ? (
                      <div className="assign-instructors-dropdown-empty">No instructors found</div>
                    ) : (
                      filteredInstructors.map(instructor => (
                        <div
                          key={instructor.id}
                          onClick={() => handleSelectInstructor(instructor)}
                          className="assign-instructors-instructor-item"
                        >
                          <div className="assign-instructors-instructor-name">{instructor.name}</div>
                          <div className="assign-instructors-instructor-details">
                            {instructor.department} • {instructor.specialization}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="assign-instructors-modal-actions">
              <button 
                onClick={() => { 
                  setShowInstructorModal(false); 
                  setInstructorSearch(''); 
                  setShowInstructorDropdown(false); 
                }} 
                className="assign-instructors-btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleAssignInstructor} className="assign-instructors-btn-primary">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignInstructors;