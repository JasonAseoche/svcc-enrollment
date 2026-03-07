import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUser, getInstructorId, getUserId } from '../../utils/auth';
import '../../components/InstructorLayout/ViewStudents.css';

const ViewStudents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost/svcc-enrollment';

  // Fetch students assigned to the instructor
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const currentUser = getCurrentUser();
        console.log('Current User:', currentUser);
        
        // Try to get instructor_id, fallback to user_id
        let instructorId = getInstructorId();
        
        // If instructor_id is not set, use user_id (for instructors, user_id might be the identifier)
        if (!instructorId) {
          instructorId = getUserId();
          console.log('Using user_id as instructor_id:', instructorId);
        }
        
        if (!instructorId) {
          setError('Instructor ID not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching students for instructor_id:', instructorId);
        
        const response = await axios.get(
          `${API_URL}/fetch_students.php?instructor_id=${instructorId}`
        );

        console.log('Response:', response.data);

        if (response.data.success) {
          setStudents(response.data.students || []);
        } else {
          setError(response.data.message || 'Failed to fetch students');
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        if (err.response) {
          // Server responded with error
          console.error('Server error:', err.response.data);
          setError(err.response.data.message || 'Failed to load students');
        } else if (err.request) {
          // Request made but no response
          setError('Unable to connect to server. Please check your connection.');
        } else {
          // Other errors
          setError('An error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []); // Empty dependency array means this runs once on mount

  // Filter students based on search and section
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = selectedSection === 'All Sections' || student.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  // Get unique sections for dropdown
  const sections = ['All Sections', ...new Set(students.map(s => s.section))];

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="viewstudents-container">
        <div className="viewstudents-content-wrapper">
          <div className="viewstudents-loading">
            <div className="viewstudents-spinner"></div>
            <p>Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="viewstudents-container">
        <div className="viewstudents-content-wrapper">
          <div className="viewstudents-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="viewstudents-retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="viewstudents-container">
      <div className="viewstudents-content-wrapper">
        <div className="viewstudents-header-card">
          <div className="viewstudents-header-content">
            <h1 className="viewstudents-page-title">List of Students</h1>
            <div className="viewstudents-header-actions">
              <div className="viewstudents-search-container">
                <svg 
                  className="viewstudents-search-icon" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  className="viewstudents-search-input"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="viewstudents-search-clear"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
              <select
                className="viewstudents-filter-select"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="viewstudents-table-container">
          <div className="viewstudents-table-scroll">
            <table className="viewstudents-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Year Level</th>
                  <th>Section</th>
                  <th>Term Enrolled</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td data-label="Name:" className="viewstudents-name">{student.name}</td>
                      <td data-label="Year Level:">{student.yearLevel}</td>
                      <td data-label="Section:">
                        <span className="viewstudents-section-badge">
                          {student.section}
                        </span>
                      </td>
                      <td data-label="Term Enrolled:">{student.termEnrolled}</td>
                      <td data-label="Status:">
                        <span className={`viewstudents-status-badge ${student.status.toLowerCase()}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="viewstudents-no-data">
                      {students.length === 0 ? 'No students assigned to you yet' : 'No students found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudents;