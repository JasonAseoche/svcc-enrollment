import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle, Edit2, Trash2, Search, X, Save, AlertCircle, ArrowLeft, Clock, Plus } from 'lucide-react';
import axios from 'axios';
import '../../components/HeadLayout/CourseSchedules.css';

const API_URL = 'http://localhost/svcc-enrollment/manage_schedules.php';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Generate time slots with 30-minute intervals in 12-hour format
const TIME_SLOTS = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM'
];

// Helper function to convert 24hr time to 12hr format
const convertTo12Hour = (time24) => {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':');
  let hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  
  hour = hour % 12;
  hour = hour ? hour : 12;
  
  return `${hour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

// Helper function to convert 12hr time to 24hr format
const convertTo24Hour = (time12) => {
  if (!time12) return '';
  
  const [time, modifier] = time12.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  
  return `${hours}:${minutes}`;
};

const CourseSchedules = () => {
  const [currentView, setCurrentView] = useState('list');
  const [sections, setSections] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [filteredSections, setFilteredSections] = useState([]);
  
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  
  const [modalMode, setModalMode] = useState('add');
  const [currentCourse, setCurrentCourse] = useState(null);
  
  const [currentSectionForm, setCurrentSectionForm] = useState({
    id: '',
    program: 'Bachelor of Science in Information Technology',
    section: '',
    yearLevel: '',
    term: ''
  });
  
  const [scheduleEntries, setScheduleEntries] = useState([{
    id: '',
    day: '',
    startTime: '',
    endTime: '',
    room: ''
  }]);
  
  const [instructorId, setInstructorId] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?action=sections`);
      if (response.data.success) {
        setSections(response.data.data);
      }
    } catch (error) {
      setMessage({ text: 'Failed to fetch sections', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async (sectionId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?action=schedules&section_id=${sectionId}`);
      if (response.data.success) {
        setSchedules(response.data.data);
      }
    } catch (error) {
      setMessage({ text: 'Failed to fetch schedules', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(`${API_URL}?action=instructors`);
      if (response.data.success) {
        setInstructors(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    }
  };

  useEffect(() => {
    fetchSections();
    fetchInstructors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, sections]);

  useEffect(() => {
    if (selectedSection) {
      fetchSchedules(selectedSection.id);
    }
  }, [selectedSection]);

  const applyFilters = useCallback(() => {
    let filtered = [...sections];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(section => 
        (section.section || '').toLowerCase().includes(searchLower) ||
        (section.year_level || '').toLowerCase().includes(searchLower) ||
        (section.term || '').toLowerCase().includes(searchLower)
      );
    }

    setFilteredSections(filtered);
  }, [sections, searchTerm]);

  const filteredSchedules = useMemo(() => {
    if (!scheduleSearchTerm) return schedules;
    return schedules.filter(schedule => {
      return schedule.schedule_entries.some(entry => entry.day === scheduleSearchTerm);
    });
  }, [schedules, scheduleSearchTerm]);

  const openAddSectionModal = useCallback(() => {
    setCurrentSectionForm({ 
      id: '', 
      program: 'Bachelor of Science in Information Technology', 
      section: '', 
      yearLevel: '', 
      term: '' 
    });
    setModalMode('add');
    setShowSectionModal(true);
  }, []);

  const openEditSectionModal = useCallback((section) => {
    setCurrentSectionForm({
      id: section.id,
      program: section.program,
      section: section.section,
      yearLevel: section.year_level,
      term: section.term
    });
    setModalMode('edit');
    setShowSectionModal(true);
  }, []);

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentSectionForm.section || !currentSectionForm.yearLevel || !currentSectionForm.term) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      
      if (modalMode === 'add') {
        const response = await axios.post(`${API_URL}?action=section`, {
          program: currentSectionForm.program,
          section: currentSectionForm.section,
          yearLevel: currentSectionForm.yearLevel,
          term: currentSectionForm.term
        }, { headers: auditHeaders });
        
        if (response.data.success) {
          setMessage({ 
            text: `Section created successfully! ${response.data.courses_imported} courses imported.`, 
            type: 'success' 
          });
          fetchSections();
          setShowSectionModal(false);
        }
      } else {
        const yearOrTermChanged = 
          selectedSection && 
          (selectedSection.year_level !== currentSectionForm.yearLevel || 
           selectedSection.term !== currentSectionForm.term);
        
        const response = await axios.put(`${API_URL}?action=section`, {
          id: currentSectionForm.id,
          program: currentSectionForm.program,
          section: currentSectionForm.section,
          yearLevel: currentSectionForm.yearLevel,
          term: currentSectionForm.term
        }, { headers: auditHeaders });
        
        if (response.data.success) {
          setMessage({ text: response.data.message, type: 'success' });
          fetchSections();
          setShowSectionModal(false);
          
          if (currentView === 'schedule' && selectedSection && selectedSection.id === currentSectionForm.id) {
            if (yearOrTermChanged) {
              setSelectedSection({
                ...selectedSection,
                year_level: currentSectionForm.yearLevel,
                term: currentSectionForm.term,
                section: currentSectionForm.section,
                program: currentSectionForm.program
              });
              
              setTimeout(() => {
                fetchSchedules(currentSectionForm.id);
              }, 500);
            } else {
              setSelectedSection({
                ...selectedSection,
                section: currentSectionForm.section,
                program: currentSectionForm.program
              });
            }
          }
        }
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Operation failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openEditScheduleModal = useCallback((course) => {
    setCurrentCourse(course);
    setInstructorId(course.instructor_id || '');
    
    // Load existing schedule entries or create one empty entry
    if (course.schedule_entries && course.schedule_entries.length > 0) {
      setScheduleEntries(course.schedule_entries.map(entry => ({
        id: entry.id,
        day: entry.day || '',
        startTime: entry.start_time ? convertTo12Hour(entry.start_time) : '',
        endTime: entry.end_time ? convertTo12Hour(entry.end_time) : '',
        room: entry.room || ''
      })));
    } else {
      setScheduleEntries([{
        id: '',
        day: '',
        startTime: '',
        endTime: '',
        room: ''
      }]);
    }
    
    setModalMode('edit');
    setShowScheduleModal(true);
  }, []);

  const addScheduleEntry = () => {
    setScheduleEntries([...scheduleEntries, {
      id: '',
      day: '',
      startTime: '',
      endTime: '',
      room: ''
    }]);
  };

  const removeScheduleEntry = (index) => {
    const newEntries = scheduleEntries.filter((_, i) => i !== index);
    setScheduleEntries(newEntries.length > 0 ? newEntries : [{
      id: '',
      day: '',
      startTime: '',
      endTime: '',
      room: ''
    }]);
  };

  const updateScheduleEntry = (index, field, value) => {
    const newEntries = [...scheduleEntries];
    newEntries[index][field] = value;
    setScheduleEntries(newEntries);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // First, update the instructor for all entries of this course
      await axios.put(`${API_URL}?action=bulk_schedule`, {
        section_id: selectedSection.id,
        course_id: currentCourse.course_id,
        instructorId: instructorId || null
      }, { headers: auditHeaders });
      
      // Then handle each schedule entry
      for (const entry of scheduleEntries) {
        if (entry.id) {
          // Update existing entry
          await axios.put(`${API_URL}?action=schedule`, {
            id: entry.id,
            day: entry.day || null,
            startTime: entry.startTime ? convertTo24Hour(entry.startTime) : null,
            endTime: entry.endTime ? convertTo24Hour(entry.endTime) : null,
            room: entry.room || null,
            instructorId: instructorId || null
          }, { headers: auditHeaders });
        } else if (entry.day || entry.startTime || entry.endTime || entry.room) {
          // Add new schedule day
          await axios.post(`${API_URL}?action=add_schedule_day`, {
            section_id: selectedSection.id,
            course_id: currentCourse.course_id,
            day: entry.day || null,
            startTime: entry.startTime ? convertTo24Hour(entry.startTime) : null,
            endTime: entry.endTime ? convertTo24Hour(entry.endTime) : null,
            room: entry.room || null,
            instructorId: instructorId || null
          }, { headers: auditHeaders });
        }
      }
      
      setMessage({ text: 'Schedule updated successfully', type: 'success' });
      fetchSchedules(selectedSection.id);
      setShowScheduleModal(false);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Failed to update schedule', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = useCallback((id, type) => {
    setDeleteId(id);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      if (deleteType === 'section') {
        const response = await axios.delete(`${API_URL}?action=section`, { data: { id: deleteId }, headers: auditHeaders });
        if (response.data.success) {
          setMessage({ text: 'Section deleted successfully', type: 'success' });
          fetchSections();
        }
      } else if (deleteType === 'schedule') {
        const response = await axios.delete(`${API_URL}?action=schedule`, { data: { id: deleteId }, headers: auditHeaders });
        if (response.data.success) {
          setMessage({ text: 'Schedule entry deleted successfully', type: 'success' });
          fetchSchedules(selectedSection.id);
        }
      }
      
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setDeleteType('');
    } catch (error) {
      setMessage({ text: 'Delete operation failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = (section) => {
    setSelectedSection(section);
    setCurrentView('schedule');
    setScheduleSearchTerm('');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedSection(null);
    setScheduleSearchTerm('');
    setSchedules([]);
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const renderListView = () => (
    <div className="course-schedules-container">
      <div className="course-schedules-header-card">
        <div className="course-schedules-header-content">
          <h1 className="course-schedules-page-title">Course Schedules</h1>
          <div className="course-schedules-header-actions">
            <div className="course-schedules-search-container">
              <input 
                type="text" 
                placeholder="Search sections..." 
                className="course-schedules-search-input" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <Search className="course-schedules-search-icon" size={18} />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="course-schedules-search-clear"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button 
              onClick={openAddSectionModal} 
              className="course-schedules-add-button"
            >
              <PlusCircle size={18} className="course-schedules-button-icon" />
              Add Section
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`course-schedules-message ${message.type === 'success' ? 'course-schedules-message-success' : 'course-schedules-message-error'}`}>
          <AlertCircle size={20} className="course-schedules-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="course-schedules-loading">Loading...</div>
      ) : (
        <div className="course-schedules-cards-container">
          {filteredSections.length === 0 ? (
            <div className="course-schedules-empty-container">
              <p className="course-schedules-empty-text">No sections found</p>
              {!searchTerm && (
                <button 
                  onClick={openAddSectionModal} 
                  className="course-schedules-empty-action"
                >
                  <PlusCircle size={16} />
                  Add your first section
                </button>
              )}
            </div>
          ) : (
            <div className="course-schedules-cards-grid">
              {filteredSections.map((section) => (
                <div key={section.id} className="course-schedules-card">
                  <div className="course-schedules-card-header">
                    <div className="course-schedules-card-title-section">
                      <div className="course-schedules-section-badge">{section.section}</div>
                      <h3 className="course-schedules-card-title">{section.program}</h3>
                    </div>
                    <div className="course-schedules-card-actions">
                      <button 
                        onClick={() => handleViewSchedule(section)} 
                        className="course-schedules-view-button" 
                        title="View schedule"
                      >
                        View
                      </button>
                    </div>
                  </div>
                  <div className="course-schedules-card-divider"></div>
                  <div className="course-schedules-card-content">
                    <div className="course-schedules-card-info">
                      <span className="course-schedules-info-label">Year Level:</span>
                      <span className="course-schedules-info-value">{section.year_level}</span>
                    </div>
                    <div className="course-schedules-card-info">
                      <span className="course-schedules-info-label">Sem:</span>
                      <span className="course-schedules-info-value">{section.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</span>
                    </div>
                  </div>
                  <div className="course-schedules-card-footer">
                    <button 
                      onClick={() => openEditSectionModal(section)} 
                      className="course-schedules-footer-btn course-schedules-edit-btn"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button 
                      onClick={() => confirmDelete(section.id, 'section')} 
                      className="course-schedules-footer-btn course-schedules-delete-btn"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderScheduleView = () => (
    <div className="course-schedules-container">
      <div className="course-schedules-header-card">
        <div className="course-schedules-header-content">
          <div className="course-schedules-title-with-back">
            <button 
              onClick={handleBackToList} 
              className="course-schedules-back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="course-schedules-page-title">{selectedSection?.section} Schedule</h1>
              <p className="course-schedules-subtitle">
                {selectedSection?.year_level} - {selectedSection?.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}
              </p>
            </div>
          </div>
          <div className="course-schedules-header-actions">
            <select
              value={scheduleSearchTerm}
              onChange={(e) => setScheduleSearchTerm(e.target.value)}
              className="course-schedules-filter-select"
            >
              <option value="">Show All</option>
              {DAYS_OF_WEEK.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`course-schedules-message ${message.type === 'success' ? 'course-schedules-message-success' : 'course-schedules-message-error'}`}>
          <AlertCircle size={20} className="course-schedules-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="course-schedules-table-container">
        <div className="course-schedules-table-scroll">
          {loading ? (
            <div className="course-schedules-table-loading">Loading schedules...</div>
          ) : filteredSchedules.length === 0 ? (
            <div className="course-schedules-table-empty">
              <p className="course-schedules-table-empty-text">
                {scheduleSearchTerm ? `No schedules found for ${scheduleSearchTerm}` : 'No courses available for this section'}
              </p>
            </div>
          ) : (
            <table className="course-schedules-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Units</th>
                  <th>Schedule</th>
                  <th>Instructor</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((course) => (
                  <tr key={course.course_id}>
                    <td data-label="Course Code" className="course-schedules-table-course-code">
                      {course.course_code}
                    </td>
                    <td data-label="Course Name" className="course-schedules-table-course-name">
                      {course.course_name}
                    </td>
                    <td data-label="Units">{course.units_required}</td>
                    <td data-label="Schedule">
                      {course.schedule_entries && course.schedule_entries.length > 0 ? (
                        <div className="course-schedules-entries-list">
                          {course.schedule_entries.map((entry, idx) => (
                            <div key={idx} className="course-schedules-entry-item">
                              <div className="course-schedules-entry-day">
                                {entry.day || '-'}
                              </div>
                              {entry.start_time && entry.end_time && (
                                <div className="course-schedules-entry-time">
                                  <Clock size={12} />
                                  {convertTo12Hour(entry.start_time)} - {convertTo12Hour(entry.end_time)}
                                </div>
                              )}
                              {entry.room && (
                                <div className="course-schedules-entry-room">
                                  Room: {entry.room}
                                </div>
                              )}
                              <button 
                                onClick={() => confirmDelete(entry.id, 'schedule')} 
                                className="course-schedules-entry-delete"
                                title="Delete this schedule entry"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td data-label="Instructor">{course.instructor_name || 'Not assigned'}</td>
                    <td data-label="Actions">
                      <div className="course-schedules-table-actions">
                        <button 
                          onClick={() => openEditScheduleModal(course)} 
                          className="course-schedules-table-action-btn course-schedules-table-edit-btn"
                          title="Edit schedule"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {currentView === 'list' ? renderListView() : renderScheduleView()}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="course-schedules-modal-overlay">
          <div className="course-schedules-modal-content">
            <div className="course-schedules-modal-body">
              <h2 className="course-schedules-modal-title">
                {modalMode === 'add' ? 'Add New Section' : 'Edit Section'}
              </h2>
              {modalMode === 'add' && (
                <div className="course-schedules-modal-notice">
                  <AlertCircle size={16} />
                  <span>Approved courses matching the year level and term will be automatically imported.</span>
                </div>
              )}
              <form onSubmit={handleSectionSubmit}>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Program</label>
                  <input 
                    type="text" 
                    value={currentSectionForm.program} 
                    className="course-schedules-form-input" 
                    disabled 
                    style={{backgroundColor: '#f3f4f6', cursor: 'not-allowed'}} 
                  />
                </div>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Section*</label>
                  <input 
                    type="text" 
                    value={currentSectionForm.section} 
                    onChange={(e) => setCurrentSectionForm({...currentSectionForm, section: e.target.value})} 
                    className="course-schedules-form-input" 
                    placeholder="e.g., BSIT-301" 
                    required 
                  />
                </div>
                <div className="course-schedules-form-row">
                  <div className="course-schedules-form-group">
                    <label className="course-schedules-form-label">Year Level*</label>
                    <select 
                      value={currentSectionForm.yearLevel} 
                      onChange={(e) => setCurrentSectionForm({...currentSectionForm, yearLevel: e.target.value})} 
                      className="course-schedules-form-select" 
                      required
                    >
                      <option value="">Select Year Level</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="course-schedules-form-group">
                    <label className="course-schedules-form-label">Term*</label>
                    <select 
                      value={currentSectionForm.term} 
                      onChange={(e) => setCurrentSectionForm({...currentSectionForm, term: e.target.value})} 
                      className="course-schedules-form-select" 
                      required
                    >
                      <option value="">Select Sem</option>
                      <option value="1st Term">1st Sem</option>
                      <option value="2nd Term">2nd Sem</option>
                    </select>
                  </div>
                </div>
                <div className="course-schedules-modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowSectionModal(false)} 
                    className="course-schedules-button course-schedules-button-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="course-schedules-button course-schedules-button-primary"
                    disabled={loading}
                  >
                    <Save size={18} className="course-schedules-button-icon" />
                    {modalMode === 'add' ? 'Create Section' : 'Update Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="course-schedules-modal-overlay">
          <div className="course-schedules-modal-content course-schedules-modal-wide">
            <div className="course-schedules-modal-body">
              <h2 className="course-schedules-modal-title">
                Edit Schedule - {currentCourse?.course_code} {currentCourse?.course_name}
              </h2>
              <form onSubmit={handleScheduleSubmit}>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Instructor</label>
                  <select 
                    value={instructorId} 
                    onChange={(e) => setInstructorId(e.target.value)} 
                    className="course-schedules-form-select"
                  >
                    <option value="">Select Instructor</option>
                    {instructors.map(instructor => (
                      <option key={instructor.user_id} value={instructor.user_id}>
                        {instructor.full_name} {instructor.department && `(${instructor.department})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="course-schedules-schedule-entries">
                  <div className="course-schedules-entries-header">
                    <h3>Schedule Days</h3>
                    <button 
                      type="button" 
                      onClick={addScheduleEntry}
                      className="course-schedules-add-day-btn"
                    >
                      <Plus size={16} />
                      Add Another Day
                    </button>
                  </div>

                  {scheduleEntries.map((entry, index) => (
                    <div key={index} className="course-schedules-entry-card">
                      <div className="course-schedules-entry-header">
                        <span>Day {index + 1}</span>
                        {scheduleEntries.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeScheduleEntry(index)}
                            className="course-schedules-remove-entry-btn"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="course-schedules-form-row">
                        <div className="course-schedules-form-group">
                          <label className="course-schedules-form-label">Day</label>
                          <select 
                            value={entry.day} 
                            onChange={(e) => updateScheduleEntry(index, 'day', e.target.value)} 
                            className="course-schedules-form-select"
                          >
                            <option value="">Select Day</option>
                            {DAYS_OF_WEEK.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                        <div className="course-schedules-form-group">
                          <label className="course-schedules-form-label">Room</label>
                          <input 
                            type="text" 
                            value={entry.room} 
                            onChange={(e) => updateScheduleEntry(index, 'room', e.target.value)} 
                            className="course-schedules-form-input" 
                            placeholder="e.g., CS Lab 1" 
                          />
                        </div>
                      </div>

                      <div className="course-schedules-form-row">
                        <div className="course-schedules-form-group">
                          <label className="course-schedules-form-label">Start Time</label>
                          <select 
                            value={entry.startTime} 
                            onChange={(e) => updateScheduleEntry(index, 'startTime', e.target.value)} 
                            className="course-schedules-form-select"
                          >
                            <option value="">Select Time</option>
                            {TIME_SLOTS.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        <div className="course-schedules-form-group">
                          <label className="course-schedules-form-label">End Time</label>
                          <select 
                            value={entry.endTime} 
                            onChange={(e) => updateScheduleEntry(index, 'endTime', e.target.value)} 
                            className="course-schedules-form-select"
                          >
                            <option value="">Select Time</option>
                            {TIME_SLOTS.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="course-schedules-modal-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowScheduleModal(false)} 
                    className="course-schedules-button course-schedules-button-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="course-schedules-button course-schedules-button-primary"
                    disabled={loading}
                  >
                    <Save size={18} className="course-schedules-button-icon" />
                    Update Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="course-schedules-modal-overlay">
          <div className="course-schedules-confirm-modal">
            <h3 className="course-schedules-confirm-title">Confirm Delete</h3>
            <p className="course-schedules-confirm-text">
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
            </p>
            <div className="course-schedules-confirm-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="course-schedules-button course-schedules-button-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="course-schedules-button course-schedules-button-danger"
                disabled={loading}
              >
                <Trash2 size={18} className="course-schedules-button-icon" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseSchedules;