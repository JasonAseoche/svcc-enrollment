import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusCircle, Edit2, Trash2, Search, X, Save, AlertCircle, ChevronDown, ArrowLeft, Clock } from 'lucide-react';
import '../../components/HeadLayout/CourseSchedules.css';

// Mock data for sections
const MOCK_SECTIONS = [
  { 
    id: 1, 
    program: 'Bachelor of Science in Information Technology', 
    section: 'BSIT-301', 
    yearLevel: '3rd Year', 
    term: '1st Term'
  },
  { 
    id: 2, 
    program: 'Bachelor of Science in Information Technology', 
    section: 'BSIT-302', 
    yearLevel: '3rd Year', 
    term: '1st Term'
  },
  { 
    id: 3, 
    program: 'Bachelor of Science in Information Technology', 
    section: 'BSIT-201', 
    yearLevel: '2nd Year', 
    term: '1st Term'
  },
  { 
    id: 4, 
    program: 'Bachelor of Science in Information Technology', 
    section: 'BSIT-101', 
    yearLevel: '1st Year', 
    term: '1st Term'
  }
];

// Mock data for schedules
const MOCK_SCHEDULES = {
  1: [
    { id: 1, day: 'Monday', courseCode: 'IT 211', courseName: 'Database Management Systems', startTime: '08:00', endTime: '10:00', room: 'CS Lab 1', instructor: 'Prof. Santos' },
    { id: 2, day: 'Monday', courseCode: 'IT 212', courseName: 'Web Development', startTime: '10:00', endTime: '12:00', room: 'CS Lab 2', instructor: 'Prof. Cruz' },
    { id: 3, day: 'Tuesday', courseCode: 'IT 213', courseName: 'Software Engineering', startTime: '13:00', endTime: '15:00', room: 'Room 301', instructor: 'Prof. Reyes' },
    { id: 4, day: 'Wednesday', courseCode: 'IT 211', courseName: 'Database Management Systems', startTime: '08:00', endTime: '10:00', room: 'CS Lab 1', instructor: 'Prof. Santos' },
    { id: 5, day: 'Thursday', courseCode: 'IT 214', courseName: 'Data Structures', startTime: '15:00', endTime: '17:00', room: 'CS Lab 3', instructor: 'Prof. Garcia' },
    { id: 6, day: 'Friday', courseCode: 'IT 212', courseName: 'Web Development', startTime: '10:00', endTime: '12:00', room: 'CS Lab 2', instructor: 'Prof. Cruz' }
  ],
  2: [
    { id: 7, day: 'Monday', courseCode: 'IT 211', courseName: 'Database Management Systems', startTime: '13:00', endTime: '15:00', room: 'CS Lab 1', instructor: 'Prof. Santos' },
    { id: 8, day: 'Tuesday', courseCode: 'IT 212', courseName: 'Web Development', startTime: '08:00', endTime: '10:00', room: 'CS Lab 2', instructor: 'Prof. Cruz' }
  ],
  3: [],
  4: []
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const CourseSchedules = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'schedule'
  const [sections, setSections] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);
  const [filteredSections, setFilteredSections] = useState([]);
  const [nextSectionId, setNextSectionId] = useState(5);
  const [nextScheduleId, setNextScheduleId] = useState(9);
  
  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'section' or 'schedule'
  
  // Form states
  const [modalMode, setModalMode] = useState('add');
  const [currentSectionForm, setCurrentSectionForm] = useState({
    id: '',
    program: 'Bachelor of Science in Information Technology',
    section: '',
    yearLevel: '',
    term: ''
  });
  
  const [currentScheduleForm, setCurrentScheduleForm] = useState({
    id: '',
    day: '',
    courseCode: '',
    courseName: '',
    startTime: '',
    endTime: '',
    room: '',
    instructor: ''
  });
  
  // Hover states for calendar
  const [hoveredCell, setHoveredCell] = useState(null);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    setSections(MOCK_SECTIONS);
    setSchedules(MOCK_SCHEDULES);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, sections]);

  const applyFilters = useCallback(() => {
    let filtered = [...sections];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(section => 
        (section.section || '').toLowerCase().includes(searchLower) ||
        (section.yearLevel || '').toLowerCase().includes(searchLower) ||
        (section.term || '').toLowerCase().includes(searchLower)
      );
    }

    setFilteredSections(filtered);
  }, [sections, searchTerm]);

  // Section handlers
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
    setCurrentSectionForm(section);
    setModalMode('edit');
    setShowSectionModal(true);
  }, []);

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentSectionForm.section || !currentSectionForm.yearLevel || !currentSectionForm.term) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    if (modalMode === 'add') {
      const newSection = { ...currentSectionForm, id: nextSectionId };
      setSections([...sections, newSection]);
      setSchedules({ ...schedules, [nextSectionId]: [] });
      setNextSectionId(nextSectionId + 1);
      setMessage({ text: 'Section added successfully', type: 'success' });
    } else {
      setSections(sections.map(section => 
        section.id === currentSectionForm.id ? currentSectionForm : section
      ));
      setMessage({ text: 'Section updated successfully', type: 'success' });
    }
    
    setShowSectionModal(false);
  };

  // Schedule handlers
  const openAddScheduleModal = useCallback((day) => {
    setCurrentScheduleForm({ 
      id: '', 
      day: day || '', 
      courseCode: '', 
      courseName: '', 
      startTime: '', 
      endTime: '', 
      room: '', 
      instructor: '' 
    });
    setModalMode('add');
    setShowScheduleModal(true);
  }, []);

  const openEditScheduleModal = useCallback((schedule) => {
    setCurrentScheduleForm(schedule);
    setModalMode('edit');
    setShowScheduleModal(true);
  }, []);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentScheduleForm.day || !currentScheduleForm.courseCode || !currentScheduleForm.courseName || 
        !currentScheduleForm.startTime || !currentScheduleForm.endTime) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      return;
    }
    
    const sectionSchedules = schedules[selectedSection.id] || [];
    
    if (modalMode === 'add') {
      const newSchedule = { ...currentScheduleForm, id: nextScheduleId };
      setSchedules({
        ...schedules,
        [selectedSection.id]: [...sectionSchedules, newSchedule]
      });
      setNextScheduleId(nextScheduleId + 1);
      setMessage({ text: 'Schedule added successfully', type: 'success' });
    } else {
      setSchedules({
        ...schedules,
        [selectedSection.id]: sectionSchedules.map(schedule => 
          schedule.id === currentScheduleForm.id ? currentScheduleForm : schedule
        )
      });
      setMessage({ text: 'Schedule updated successfully', type: 'success' });
    }
    
    setShowScheduleModal(false);
  };

  // Delete handlers
  const confirmDelete = useCallback((id, type) => {
    setDeleteId(id);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = async () => {
    if (deleteType === 'section') {
      setSections(sections.filter(section => section.id !== deleteId));
      const newSchedules = { ...schedules };
      delete newSchedules[deleteId];
      setSchedules(newSchedules);
      setMessage({ text: 'Section deleted successfully', type: 'success' });
    } else if (deleteType === 'schedule') {
      const sectionSchedules = schedules[selectedSection.id] || [];
      setSchedules({
        ...schedules,
        [selectedSection.id]: sectionSchedules.filter(schedule => schedule.id !== deleteId)
      });
      setMessage({ text: 'Schedule deleted successfully', type: 'success' });
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
    setDeleteType('');
  };

  const handleViewSchedule = (section) => {
    setSelectedSection(section);
    setCurrentView('schedule');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedSection(null);
  };

  const getSchedulesForDayAndTime = (day, time) => {
    const sectionSchedules = schedules[selectedSection?.id] || [];
    return sectionSchedules.filter(schedule => {
      if (schedule.day !== day) return false;
      const scheduleStart = schedule.startTime;
      return scheduleStart === time;
    });
  };

  const calculateRowSpan = (startTime, endTime) => {
    const startIndex = TIME_SLOTS.indexOf(startTime);
    const endIndex = TIME_SLOTS.indexOf(endTime);
    
    if (startIndex === - 1 || endIndex === -1) return 1;
    
    // For 08:00-10:00: startIndex=1, endIndex=3, rowspan = 2
    // This spans rows 08:00 and 09:00 (does NOT include 10:00 row)
    return endIndex - startIndex;
  };

 const isCellOccupied = (day, time) => {
  const sectionSchedules = schedules[selectedSection?.id] || [];
  const timeIndex = TIME_SLOTS.indexOf(time);
  
  return sectionSchedules.some(schedule => {
    if (schedule.day !== day) return false;
    const startIndex = TIME_SLOTS.indexOf(schedule.startTime);
    const endIndex = TIME_SLOTS.indexOf(schedule.endTime);
    
    // For a schedule 13:00-15:00, it should occupy rows 13:00 and 14:00 only
    // Skip rendering cells that fall between start and end (exclusive of both)
    return timeIndex > startIndex && timeIndex < endIndex;
  });
};

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Render section list view
  const renderListView = () => (
    <div className="course-schedules-container">
      <div className="course-schedules-header-card">
        <div className="course-schedules-header-content">
          <h1 className="course-schedules-page-title">Course Schedules</h1>
          <div className="course-schedules-header-actions">
            <div className="course-schedules-search-container">
              <input type="text" placeholder="Search sections..." className="course-schedules-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="course-schedules-search-icon" size={18} />
              {searchTerm && (<button onClick={() => setSearchTerm('')} className="course-schedules-search-clear"><X size={18} /></button>)}
            </div>
            <button onClick={openAddSectionModal} className="course-schedules-add-button"><PlusCircle size={18} className="course-schedules-button-icon" />Add Section</button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`course-schedules-message ${message.type === 'success' ? 'course-schedules-message-success' : 'course-schedules-message-error'}`}>
          <AlertCircle size={20} className="course-schedules-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="course-schedules-cards-container">
        {filteredSections.length === 0 ? (
          <div className="course-schedules-empty-container">
            <p className="course-schedules-empty-text">No sections found</p>
            {!searchTerm && (<button onClick={openAddSectionModal} className="course-schedules-empty-action"><PlusCircle size={16} />Add your first section</button>)}
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
                    <button onClick={() => handleViewSchedule(section)} className="course-schedules-view-button" title="View schedule">View</button>
                  </div>
                </div>
                <div className="course-schedules-card-divider"></div>
                <div className="course-schedules-card-content">
                  <div className="course-schedules-card-info">
                    <span className="course-schedules-info-label">Year Level:</span>
                    <span className="course-schedules-info-value">{section.yearLevel}</span>
                  </div>
                  <div className="course-schedules-card-info">
                    <span className="course-schedules-info-label">Term:</span>
                    <span className="course-schedules-info-value">{section.term}</span>
                  </div>
                  <div className="course-schedules-card-info">
                    <span className="course-schedules-info-label">Schedules:</span>
                    <span className="course-schedules-info-value">{(schedules[section.id] || []).length} classes</span>
                  </div>
                </div>
                <div className="course-schedules-card-footer">
                  <button onClick={() => openEditSectionModal(section)} className="course-schedules-footer-btn course-schedules-edit-btn"><Edit2 size={16} />Edit</button>
                  <button onClick={() => confirmDelete(section.id, 'section')} className="course-schedules-footer-btn course-schedules-delete-btn"><Trash2 size={16} />Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render schedule calendar view
  const renderScheduleView = () => (
    <div className="course-schedules-container">
      <div className="course-schedules-header-card">
        <div className="course-schedules-header-content">
          <div className="course-schedules-title-with-back">
            <button onClick={handleBackToList} className="course-schedules-back-button"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="course-schedules-page-title">{selectedSection?.section} Schedule</h1>
              <p className="course-schedules-subtitle">{selectedSection?.yearLevel} - {selectedSection?.term}</p>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`course-schedules-message ${message.type === 'success' ? 'course-schedules-message-success' : 'course-schedules-message-error'}`}>
          <AlertCircle size={20} className="course-schedules-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="course-schedules-calendar-container">
        <div className="course-schedules-calendar-scroll">
          <table className="course-schedules-calendar">
            <thead>
              <tr>
                <th className="course-schedules-time-header">Time</th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day} className="course-schedules-day-header">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(time => (
                <tr key={time}>
                  <td className="course-schedules-time-cell">{time}</td>
                  {DAYS_OF_WEEK.map(day => {
                    // Skip this cell if it's occupied by a schedule from a previous time slot
                    if (isCellOccupied(day, time)) {
                      return null;
                    }

                    const cellSchedules = getSchedulesForDayAndTime(day, time);
                    const cellKey = `${day}-${time}`;
                    const isHovered = hoveredCell === cellKey;
                    
                    // Calculate rowspan for schedules
                    const rowSpan = cellSchedules.length > 0 
                      ? calculateRowSpan(cellSchedules[0].startTime, cellSchedules[0].endTime)
                      : 1;
                    
                    return (
                      <td 
                        key={day} 
                        className={`course-schedules-schedule-cell ${cellSchedules.length > 0 ? 'has-schedule' : 'empty-cell'}`}
                        rowSpan={rowSpan}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {cellSchedules.length > 0 ? (
                          cellSchedules.map(schedule => (
                            <div key={schedule.id} className="course-schedules-schedule-item">
                              <div className="course-schedules-schedule-content">
                                <div className="course-schedules-schedule-code">{schedule.courseCode}</div>
                                <div className="course-schedules-schedule-name">{schedule.courseName}</div>
                                <div className="course-schedules-schedule-time">
                                  <Clock size={12} /> {schedule.startTime} - {schedule.endTime}
                                </div>
                                <div className="course-schedules-schedule-room">{schedule.room}</div>
                                <div className="course-schedules-schedule-instructor">{schedule.instructor}</div>
                              </div>
                              {isHovered && (
                                <div className="course-schedules-schedule-actions">
                                  <button onClick={() => openEditScheduleModal(schedule)} className="course-schedules-action-btn course-schedules-edit-action"><Edit2 size={14} /></button>
                                  <button onClick={() => confirmDelete(schedule.id, 'schedule')} className="course-schedules-action-btn course-schedules-delete-action"><Trash2 size={14} /></button>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          isHovered && (
                            <button onClick={() => openAddScheduleModal(day)} className="course-schedules-add-schedule-btn">
                              <PlusCircle size={16} />
                              <span>Add Schedule</span>
                            </button>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
              <h2 className="course-schedules-modal-title">{modalMode === 'add' ? 'Add New Section' : 'Edit Section'}</h2>
              <form onSubmit={handleSectionSubmit}>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Program</label>
                  <input type="text" value={currentSectionForm.program} className="course-schedules-form-input" disabled style={{backgroundColor: '#f3f4f6', cursor: 'not-allowed'}} />
                </div>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Section*</label>
                  <input type="text" value={currentSectionForm.section} onChange={(e) => setCurrentSectionForm({...currentSectionForm, section: e.target.value})} className="course-schedules-form-input" placeholder="e.g., BSIT-301" required />
                </div>
                <div className="course-schedules-form-row">
                  <div className="course-schedules-form-group">
                    <label className="course-schedules-form-label">Year Level*</label>
                    <select value={currentSectionForm.yearLevel} onChange={(e) => setCurrentSectionForm({...currentSectionForm, yearLevel: e.target.value})} className="course-schedules-form-select" required>
                      <option value="">Select Year Level</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="course-schedules-form-group">
                    <label className="course-schedules-form-label">Term*</label>
                    <select value={currentSectionForm.term} onChange={(e) => setCurrentSectionForm({...currentSectionForm, term: e.target.value})} className="course-schedules-form-select" required>
                      <option value="">Select Term</option>
                      <option value="1st Term">1st Term</option>
                      <option value="2nd Term">2nd Term</option>
                    </select>
                  </div>
                </div>
                <div className="course-schedules-modal-actions">
                  <button type="button" onClick={() => setShowSectionModal(false)} className="course-schedules-button course-schedules-button-secondary">Cancel</button>
                  <button type="submit" className="course-schedules-button course-schedules-button-primary"><Save size={18} className="course-schedules-button-icon" />{modalMode === 'add' ? 'Create Section' : 'Update Section'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="course-schedules-modal-overlay">
          <div className="course-schedules-modal-content">
            <div className="course-schedules-modal-body">
              <h2 className="course-schedules-modal-title">{modalMode === 'add' ? 'Add Schedule' : 'Edit Schedule'}</h2>
              <form onSubmit={handleScheduleSubmit}>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Day*</label>
                  <select value={currentScheduleForm.day} onChange={(e) => setCurrentScheduleForm({...currentScheduleForm, day: e.target.value})} className="course-schedules-form-select" required>
                    <option value="">Select Day</option>
                    {DAYS_OF_WEEK.map(day => (<option key={day} value={day}>{day}</option>))}
                  </select>
                </div>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Course Code*</label>
                  <input type="text" value={currentScheduleForm.courseCode} onChange={(e) => setCurrentScheduleForm({...currentScheduleForm, courseCode: e.target.value})} className="course-schedules-form-input" placeholder="e.g., IT 211" required />
                </div>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Course Name*</label>
                  <input type="text" value={currentScheduleForm.courseName} onChange={(e) => setCurrentScheduleForm({...currentScheduleForm, courseName: e.target.value})} className="course-schedules-form-input" placeholder="e.g., Database Management Systems" required />
                </div>
                <div className="course-schedules-form-row">
                  <div className="course-schedules-form-group">
                    <label className="course-schedules-form-label">Start Time*</label>
                    <select value={currentScheduleForm.startTime} onChange={(e) => setCurrentScheduleForm({...currentScheduleForm, startTime: e.target.value})} className="course-schedules-form-select" required>
                      <option value="">Select Time</option>
                      {TIME_SLOTS.map(time => (<option key={time} value={time}>{time}</option>))}
                    </select>
                  </div>
                  <div className="course-schedules-form-group">
                    <label className="course-schedules-form-label">End Time*</label>
                    <select value={currentScheduleForm.endTime} onChange={(e) => setCurrentScheduleForm({...currentScheduleForm, endTime: e.target.value})} className="course-schedules-form-select" required>
                      <option value="">Select Time</option>
                      {TIME_SLOTS.map(time => (<option key={time} value={time}>{time}</option>))}
                    </select>
                  </div>
                </div>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Room</label>
                  <input type="text" value={currentScheduleForm.room} onChange={(e) => setCurrentScheduleForm({...currentScheduleForm, room: e.target.value})} className="course-schedules-form-input" placeholder="e.g., CS Lab 1" />
                </div>
                <div className="course-schedules-form-group">
                  <label className="course-schedules-form-label">Instructor</label>
                  <input type="text" value={currentScheduleForm.instructor} onChange={(e) => setCurrentScheduleForm({...currentScheduleForm, instructor: e.target.value})} className="course-schedules-form-input" placeholder="e.g., Prof. Santos" />
                </div>
                <div className="course-schedules-modal-actions">
                  <button type="button" onClick={() => setShowScheduleModal(false)} className="course-schedules-button course-schedules-button-secondary">Cancel</button>
                  <button type="submit" className="course-schedules-button course-schedules-button-primary"><Save size={18} className="course-schedules-button-icon" />{modalMode === 'add' ? 'Add Schedule' : 'Update Schedule'}</button>
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
            <p className="course-schedules-confirm-text">Are you sure you want to delete this {deleteType}? This action cannot be undone.</p>
            <div className="course-schedules-confirm-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="course-schedules-button course-schedules-button-secondary">Cancel</button>
              <button onClick={handleDelete} className="course-schedules-button course-schedules-button-danger"><Trash2 size={18} className="course-schedules-button-icon" />Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseSchedules;