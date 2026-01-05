import React, { useState } from 'react';
import '../../components/InstructorLayout/ViewStudents.css';

const ViewStudents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('All Sections');

  // Sample students data - replace with actual data later
  const students = [
    {
      id: 1,
      name: 'Maria Santos',
      yearLevel: '3rd Year',
      section: 'BSIT-301',
      termEnrolled: '2025-2026 1st Term',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Juan Dela Cruz',
      yearLevel: '3rd Year',
      section: 'BSIT-301',
      termEnrolled: '2025-2026 1st Term',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Ana Reyes',
      yearLevel: '3rd Year',
      section: 'BSIT-302',
      termEnrolled: '2025-2026 1st Term',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Carlos Mendez',
      yearLevel: '2nd Year',
      section: 'BSIT-201',
      termEnrolled: '2025-2026 1st Term',
      status: 'Active'
    },
    {
      id: 5,
      name: 'Lisa Garcia',
      yearLevel: '3rd Year',
      section: 'BSIT-301',
      termEnrolled: '2025-2026 1st Term',
      status: 'Inactive'
    },
    {
      id: 6,
      name: 'Robert Torres',
      yearLevel: '3rd Year',
      section: 'BSIT-302',
      termEnrolled: '2025-2026 1st Term',
      status: 'Active'
    },
    {
      id: 7,
      name: 'Elena Martinez',
      yearLevel: '2nd Year',
      section: 'BSIT-201',
      termEnrolled: '2025-2026 1st Term',
      status: 'Active'
    },
    {
      id: 8,
      name: 'Pedro Gonzales',
      yearLevel: '3rd Year',
      section: 'BSIT-301',
      termEnrolled: '2025-2026 1st Term',
      status: 'Active'
    }
  ];

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
                      No students found
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