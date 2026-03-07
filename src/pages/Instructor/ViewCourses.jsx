import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser, getUserId, getUserFullName } from '../../utils/auth';
import '../../components/InstructorLayout/ViewCourses.css';

const API_URL = 'http://localhost/svcc-enrollment/instructor_api.php';

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

const ViewCourses = () => {
  const [currentView, setCurrentView] = useState('sections'); // 'sections' or 'courses'
  const [selectedSection, setSelectedSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Search states
  const [sectionSearchTerm, setSectionSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');

  // Get logged-in instructor's data
  const currentUser = getCurrentUser();
  const instructorId = getUserId();
  const instructorName = getUserFullName();

  // Verify user is an instructor
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'instructor') {
      console.error('User is not an instructor');
      setIsError(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentView === 'sections' && instructorId) {
      fetchInstructorSections();
    }
  }, [currentView, instructorId]);

  useEffect(() => {
    if (currentView === 'courses' && selectedSection && instructorId) {
      fetchInstructorCourses(selectedSection.id);
    }
  }, [currentView, selectedSection, instructorId]);

  const fetchInstructorSections = async () => {
    if (!instructorId) {
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      
      console.log('Fetching sections for instructor:', instructorId);
      
      const response = await axios.get(`${API_URL}?action=instructor_sections&instructor_id=${instructorId}`);
      
      if (response.data.success) {
        console.log('Sections loaded:', response.data.data);
        setSections(response.data.data);
      } else {
        console.error('Failed to load sections:', response.data.message);
        setIsError(true);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructorCourses = async (sectionId) => {
    if (!instructorId || !sectionId) {
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      
      console.log('Fetching courses for instructor:', instructorId, 'section:', sectionId);
      
      const response = await axios.get(`${API_URL}?action=instructor_courses&instructor_id=${instructorId}&section_id=${sectionId}`);
      
      if (response.data.success) {
        console.log('Courses loaded:', response.data.data);
        setCourses(response.data.data);
      } else {
        console.error('Failed to load courses:', response.data.message);
        setIsError(true);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter sections by search term
  const filteredSections = useMemo(() => {
    const sectionArray = Array.isArray(sections) ? sections : [];
    if (!sectionSearchTerm) return sectionArray;
    const searchLower = sectionSearchTerm.toLowerCase();
    return sectionArray.filter(section => 
      section.section.toLowerCase().includes(searchLower) ||
      section.year_level.toLowerCase().includes(searchLower) ||
      section.term.toLowerCase().includes(searchLower)
    );
  }, [sections, sectionSearchTerm]);

  // Filter courses by search term
  const filteredCourses = useMemo(() => {
    const courseArray = Array.isArray(courses) ? courses : [];
    if (!courseSearchTerm) return courseArray;
    const searchLower = courseSearchTerm.toLowerCase();
    return courseArray.filter(course => 
      course.course_code.toLowerCase().includes(searchLower) ||
      course.course_name.toLowerCase().includes(searchLower)
    );
  }, [courses, courseSearchTerm]);

  const handleViewSection = (section) => {
    setSelectedSection(section);
    setCurrentView('courses');
    setCourseSearchTerm('');
  };

  const handleBackToSections = () => {
    setCurrentView('sections');
    setSelectedSection(null);
    setSectionSearchTerm('');
  };

  // Render sections list view
  const renderSectionsView = () => (
    <div className="viewcourses-container">
      <div className="viewcourses-header-card">
        <div className="viewcourses-header-content">
          <div>
            <h1 className="viewcourses-page-title">My Sections</h1>
            <p className="viewcourses-instructor-name">Instructor: {instructorName}</p>
          </div>
          <div className="viewcourses-header-actions">
            <div className="viewcourses-search-container">
              <input
                type="text"
                placeholder="Search sections..."
                className="viewcourses-search-input"
                value={sectionSearchTerm}
                onChange={(e) => setSectionSearchTerm(e.target.value)}
              />
              <Search className="viewcourses-search-icon" size={18} />
              {sectionSearchTerm && (
                <button 
                  onClick={() => setSectionSearchTerm('')}
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
            <p className="viewcourses-loading-text">Loading sections...</p>
          </div>
        ) : isError ? (
          <div className="viewcourses-error-container">
            <AlertCircle size={40} className="viewcourses-error-icon" />
            <p className="viewcourses-error-text">Failed to load sections</p>
            <button 
              onClick={fetchInstructorSections}
              className="viewcourses-retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="viewcourses-empty-container">
            {sectionSearchTerm ? (
              <>
                <p className="viewcourses-empty-text">No sections found matching "{sectionSearchTerm}"</p>
                <button 
                  onClick={() => setSectionSearchTerm('')}
                  className="viewcourses-empty-action"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="viewcourses-empty-text">You are not assigned to any sections yet</p>
            )}
          </div>
        ) : (
          <div className="viewcourses-courses-grid">
            {filteredSections.map((section) => (
              <div key={section.id} className="viewcourses-course-card">
                <div className="viewcourses-card-header">
                  <h3 className="viewcourses-course-name">{section.section}</h3>
                  <div className="viewcourses-card-actions">
                    <button
                      onClick={() => handleViewSection(section)}
                      className="viewcourses-btn viewcourses-btn-view"
                    >
                      View Courses
                    </button>
                  </div>
                </div>
                <div className="viewcourses-card-content">
                  <div className="viewcourses-info-item">
                    <span className="viewcourses-info-label">Program:</span>
                    <span className="viewcourses-info-value">{section.program}</span>
                  </div>
                  <div className="viewcourses-info-item">
                    <span className="viewcourses-info-label">Year Level:</span>
                    <span className="viewcourses-info-value">{section.year_level}</span>
                  </div>
                  <div className="viewcourses-info-item">
                    <span className="viewcourses-info-label">Sem:</span>
                    <span className="viewcourses-info-value">{section.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</span>
                  </div>
                  <div className="viewcourses-info-item">
                    <span className="viewcourses-info-label">My Courses:</span>
                    <span className="viewcourses-info-value">{section.course_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render courses view
  const renderCoursesView = () => (
    <div className="viewcourses-container">
      <div className="viewcourses-header-card">
        <div className="viewcourses-header-content">
          <div className="viewcourses-title-with-back">
            <button
              onClick={handleBackToSections}
              className="viewcourses-back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="viewcourses-breadcrumb">
              <h1 className="viewcourses-page-title">{selectedSection?.section}</h1>
              <span className="viewcourses-breadcrumb-separator">›</span>
              <h2 className="viewcourses-section-title">My Courses</h2>
            </div>
          </div>
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
              onClick={() => fetchInstructorCourses(selectedSection.id)}
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
              <p className="viewcourses-empty-text">No courses assigned in this section</p>
            )}
          </div>
        ) : (
          <div className="viewcourses-courses-grid">
            {filteredCourses.map((course) => (
              <div key={course.id} className="viewcourses-course-card">
                <div className="viewcourses-card-header">
                  <div>
                    <div className="viewcourses-course-code-badge">{course.course_code}</div>
                    <h3 className="viewcourses-course-name">{course.course_name}</h3>
                  </div>
                </div>
                <div className="viewcourses-card-content">
                  <div className="viewcourses-info-item">
                    <span className="viewcourses-info-label">Units:</span>
                    <span className="viewcourses-info-value">{course.units_required}</span>
                  </div>
                  
                  {course.schedules && course.schedules.length > 0 ? (
                    <div className="viewcourses-schedule-section">
                      <span className="viewcourses-info-label">Schedule:</span>
                      <div className="viewcourses-schedule-list">
                        {course.schedules.map((schedule, idx) => (
                          <div key={idx} className="viewcourses-schedule-item">
                            {schedule.day && (
                              <div className="viewcourses-schedule-day">{schedule.day}</div>
                            )}
                            {schedule.start_time && schedule.end_time && (
                              <div className="viewcourses-schedule-time">
                                <Clock size={14} />
                                {convertTo12Hour(schedule.start_time)} - {convertTo12Hour(schedule.end_time)}
                              </div>
                            )}
                            {schedule.room && (
                              <div className="viewcourses-schedule-room">Room: {schedule.room}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="viewcourses-info-item">
                      <span className="viewcourses-info-label">Schedule:</span>
                      <span className="viewcourses-info-value viewcourses-no-schedule">Not yet scheduled</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return currentView === 'sections' ? renderSectionsView() : renderCoursesView();
};

export default ViewCourses;