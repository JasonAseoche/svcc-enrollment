// AssignAdvising_UPDATED.jsx
// ADMIN COMPONENT - Corrected API integration
// Assigns instructors to sections for advising

import React, { useState, useEffect } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser } from '../../utils/auth';
import '../../components/AdminLayout/AssignAdvising.css';

const AssignAdvising = () => {
  const currentUser = getCurrentUser();
  
  const [sections, setSections] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setMessage({ text: 'Unauthorized access', type: 'error' });
      return;
    }
    fetchSections();
    fetchInstructors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, sections]);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        'http://localhost/svcc-enrollment/assign_advising.php?action=getSections'
      );
      
      if (response.data.success) {
        setSections(response.data.data || []);
      } else {
        setMessage({ text: response.data.error || 'Failed to load sections', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setMessage({ text: 'Failed to load sections', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(
        'http://localhost/svcc-enrollment/assign_advising.php?action=getInstructors'
      );
      
      if (response.data.success) {
        setInstructors(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...sections];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(section =>
        (section.section || '').toLowerCase().includes(searchLower) ||
        (section.program || '').toLowerCase().includes(searchLower) ||
        (section.yearLevel || '').toLowerCase().includes(searchLower) ||
        (section.assignedAdviserName || '').toLowerCase().includes(searchLower)
      );
    }

    setFilteredSections(filtered);
  };

  const handleAssign = (section) => {
    setSelectedSection(section);
    setSelectedInstructor(section.assignedAdviserId || '');
    setShowModal(true);
  };

  const handleUnassign = async (section) => {
    if (!window.confirm('Are you sure you want to unassign this instructor?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.delete(
        `http://localhost/svcc-enrollment/assign_advising.php?action=removeAssignment&assignmentId=${section.assignmentId}`,
        { headers: auditHeaders }
      );
      if (response.data.success) {
        setMessage({ text: 'Instructor unassigned successfully', type: 'success' });
        await fetchSections();
      } else {
        setMessage({ text: response.data.error || 'Failed to unassign instructor', type: 'error' });
      }
    } catch (error) {
      console.error('Error unassigning instructor:', error);
      setMessage({ text: 'Failed to unassign instructor', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedInstructor || !selectedSection) {
      setMessage({ text: 'Please select an instructor', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost/svcc-enrollment/assign_advising.php?action=assignAdviser',
        {
          instructorId: parseInt(selectedInstructor),
          sectionId: selectedSection.id,
          assignedBy: currentUser.user_id
        },
        { headers: auditHeaders }
      );

      if (response.data.success) {
        setMessage({ text: 'Instructor assigned successfully', type: 'success' });
        setShowModal(false);
        setSelectedSection(null);
        setSelectedInstructor('');
        await fetchSections();
      } else {
        setMessage({ text: response.data.error || 'Failed to assign instructor', type: 'error' });
      }
    } catch (error) {
      console.error('Error assigning instructor:', error);
      setMessage({ text: 'Failed to assign instructor', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSection(null);
    setSelectedInstructor('');
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <>
      <div className="svcc-assign-advising-container">
        <div className="svcc-assign-advising-header-card">
          <div className="svcc-assign-advising-header-content">
            <h1 className="svcc-assign-advising-page-title">Assign Advising</h1>
            <div className="svcc-assign-advising-header-actions">
              <div className="svcc-assign-advising-search-container">
                <input
                  type="text"
                  placeholder="Search by section, program, year level, or instructor..."
                  className="svcc-assign-advising-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="svcc-assign-advising-search-icon" size={18} />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="svcc-assign-advising-search-clear">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`svcc-assign-advising-message ${message.type === 'success' ? 'svcc-assign-advising-message-success' : 'svcc-assign-advising-message-error'}`}>
            <AlertCircle size={20} className="svcc-assign-advising-message-icon" />
            <span>{message.text}</span>
          </div>
        )}

        <div className="svcc-assign-advising-table-container">
          {isLoading ? (
            <div className="svcc-assign-advising-loading">
              <div className="svcc-assign-advising-spinner"></div>
              <p>Loading sections...</p>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="svcc-assign-advising-empty-container">
              <p className="svcc-assign-advising-empty-text">No sections found</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="svcc-assign-advising-empty-action">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="svcc-assign-advising-table-scroll">
              <table className="svcc-assign-advising-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Program</th>
                    <th>Year Level</th>
                    <th>No. of Students</th>
                    <th>Assigned Instructor</th>
                    <th className="svcc-assign-advising-actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSections.map((section) => (
                    <tr key={section.id}>
                      <td data-label="Section: ">
                        <div className="svcc-assign-advising-section">{section.section}</div>
                      </td>
                      <td data-label="Program: ">
                        <div className="svcc-assign-advising-program">
                          {section.program || 'N/A'}
                        </div>
                      </td>
                      <td data-label="Year Level: ">
                        <div className="svcc-assign-advising-year">{section.yearLevel}</div>
                      </td>
                      <td data-label="No. of Students: ">
                        <div className="svcc-assign-advising-count">{section.currentStudents || 0}</div>
                      </td>
                      <td data-label="Assigned Instructor: ">
                        {section.assignedAdviserName ? (
                          <span className="svcc-assign-advising-instructor-name">
                            {section.assignedAdviserName}
                          </span>
                        ) : (
                          <span className="svcc-assign-advising-no-instructor">Not Assigned</span>
                        )}
                      </td>
                      <td data-label="Actions: " className="svcc-assign-advising-actions-cell">
                        <div className="svcc-assign-advising-actions-buttons">
                          {section.assignedAdviserName ? (
                            <>
                              <button
                                className="svcc-assign-advising-button svcc-assign-advising-button-reassign"
                                onClick={() => handleAssign(section)}
                                disabled={isLoading}
                              >
                                Reassign
                              </button>
                              <button
                                className="svcc-assign-advising-button svcc-assign-advising-button-unassign"
                                onClick={() => handleUnassign(section)}
                                disabled={isLoading}
                              >
                                Unassign
                              </button>
                            </>
                          ) : (
                            <button
                              className="svcc-assign-advising-button svcc-assign-advising-button-assign"
                              onClick={() => handleAssign(section)}
                              disabled={isLoading}
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assign Instructor Modal */}
      {showModal && (
        <div className="svcc-assign-advising-modal-overlay">
          <div className="svcc-assign-advising-modal-content">
            <div className="svcc-assign-advising-modal-body">
              <h2 className="svcc-assign-advising-modal-title">
                {selectedSection?.assignedAdviserName ? 'Reassign Instructor' : 'Assign Instructor'}
              </h2>
              
              <div className="svcc-assign-advising-section-info">
                <div className="svcc-assign-advising-info-row">
                  <span className="svcc-assign-advising-info-label">Section:</span>
                  <span className="svcc-assign-advising-info-value">{selectedSection?.section}</span>
                </div>
                <div className="svcc-assign-advising-info-row">
                  <span className="svcc-assign-advising-info-label">Program:</span>
                  <span className="svcc-assign-advising-info-value">
                    {selectedSection?.program}
                  </span>
                </div>
                <div className="svcc-assign-advising-info-row">
                  <span className="svcc-assign-advising-info-label">Year Level:</span>
                  <span className="svcc-assign-advising-info-value">{selectedSection?.yearLevel}</span>
                </div>
                <div className="svcc-assign-advising-info-row">
                  <span className="svcc-assign-advising-info-label">Students:</span>
                  <span className="svcc-assign-advising-info-value">
                    {selectedSection?.currentStudents || 0}
                  </span>
                </div>
                {selectedSection?.assignedAdviserName && (
                  <div className="svcc-assign-advising-info-row">
                    <span className="svcc-assign-advising-info-label">Current Instructor:</span>
                    <span className="svcc-assign-advising-info-value">
                      {selectedSection.assignedAdviserName}
                    </span>
                  </div>
                )}
              </div>

              <div className="svcc-assign-advising-form-group">
                <label htmlFor="instructor" className="svcc-assign-advising-form-label">
                  Select Instructor*
                </label>
                <select
                  id="instructor"
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="svcc-assign-advising-form-select"
                >
                  <option value="">-- Select Instructor --</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name} ({instructor.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="svcc-assign-advising-modal-actions">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="svcc-assign-advising-button svcc-assign-advising-button-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignment}
                  className="svcc-assign-advising-button svcc-assign-advising-button-primary"
                  disabled={!selectedInstructor || isLoading}
                >
                  {isLoading ? 'Processing...' : selectedSection?.assignedAdviserName ? 'Reassign Instructor' : 'Assign Instructor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignAdvising;