import React, { useState, useEffect, useRef } from 'react';
import { Clock, Users, BookOpen, Calendar } from 'lucide-react';
import axios from 'axios';
import { getCurrentUser, getUserId, getUserFullName } from '../../utils/auth';
import '../../components/InstructorLayout/DashboardInstructor.css';

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

// Helper function to get current Manila day
const getManilaDay = () => {
  // Create date in Manila timezone (UTC+8)
  const manilaTime = new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Manila',
    weekday: 'long'
  });
  return manilaTime;
};

const DashboardInstructor = () => {
  // Get logged-in instructor's data
  const currentUser = getCurrentUser();
  const instructorId = getUserId();
  const instructorName = getUserFullName();

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [currentDay, setCurrentDay] = useState('');
  const [stats, setStats] = useState({
    total_students: 0,
    total_courses: 0,
    total_sections: 0,
    weekly_classes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Use ref to track if data has been fetched
  const hasFetchedData = useRef(false);

  // Set Manila day on component mount
  useEffect(() => {
    const manilaDay = getManilaDay();
    setCurrentDay(manilaDay);
    console.log('Current Manila Day:', manilaDay);
  }, []);

  // Verify user is an instructor (only once)
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'instructor') {
      console.error('User is not an instructor');
      setError(true);
      setIsLoading(false);
    }
  }, []); // Empty dependency - only run once

  // Fetch data only once when component mounts and instructorId is available
  useEffect(() => {
    // Only fetch if we have instructorId, user is valid, and we haven't fetched yet
    if (instructorId && currentUser?.role === 'instructor' && !hasFetchedData.current) {
      hasFetchedData.current = true; // Mark as fetched
      fetchDashboardData();
    }
  }, [instructorId]); // Only depend on instructorId

  const fetchDashboardData = async () => {
    console.log('Fetching dashboard data for instructor:', instructorId);
    
    // Fetch both schedule and stats in parallel
    await Promise.all([
      fetchTodaySchedule(),
      fetchInstructorStats()
    ]);
  };

  const fetchTodaySchedule = async () => {
    if (!instructorId) {
      setError(true);
      setIsLoading(false);
      return;
    }

    try {
      const manilaDay = getManilaDay();
      console.log('Fetching schedule for Manila day:', manilaDay, 'Instructor ID:', instructorId);
      
      const response = await axios.get(
        `${API_URL}?action=today_schedule&instructor_id=${instructorId}&day=${encodeURIComponent(manilaDay)}`
      );
      
      if (response.data.success) {
        console.log('Schedule loaded:', response.data.data.length, 'classes');
        setTodaySchedule(response.data.data);
        setError(false);
      } else {
        console.error('Failed to load schedule:', response.data.message);
        setTodaySchedule([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      setError(true);
      setTodaySchedule([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstructorStats = async () => {
    if (!instructorId) {
      return;
    }

    try {
      console.log('Fetching stats for instructor:', instructorId);
      
      const response = await axios.get(`${API_URL}?action=instructor_stats&instructor_id=${instructorId}`);
      
      if (response.data.success) {
        console.log('Stats loaded:', response.data.data);
        setStats(response.data.data);
      } else {
        console.error('Failed to load stats:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(false);
    hasFetchedData.current = false; // Reset fetch flag
    fetchDashboardData();
  };

  if (!currentUser || currentUser.role !== 'instructor') {
    return (
      <div className="dashInstr-container">
        <div className="dashInstr-error-container">
          <h2>Access Denied</h2>
          <p>You must be logged in as an instructor to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashInstr-container">
      <div className="dashInstr-header">
        <h1 className="dashInstr-title">Instructor Dashboard</h1>
        <p className="dashInstr-welcome">Welcome back, {instructorName}</p>
        <p className="dashInstr-user-info">Instructor ID: {instructorId}</p>
      </div>

      {/* Statistics Overview */}
      <div className="dashInstr-stats-grid">
        <div className="dashInstr-stat-card">
          <div className="dashInstr-stat-icon">
            <Users size={24} />
          </div>
          <div className="dashInstr-stat-content">
            <p className="dashInstr-stat-label">Total Students</p>
            <p className="dashInstr-stat-value">{stats.total_students}</p>
          </div>
        </div>

        <div className="dashInstr-stat-card">
          <div className="dashInstr-stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="dashInstr-stat-content">
            <p className="dashInstr-stat-label">Assigned Courses</p>
            <p className="dashInstr-stat-value">{stats.total_courses}</p>
          </div>
        </div>

        <div className="dashInstr-stat-card">
          <div className="dashInstr-stat-icon">
            <Calendar size={24} />
          </div>
          <div className="dashInstr-stat-content">
            <p className="dashInstr-stat-label">Sections</p>
            <p className="dashInstr-stat-value">{stats.total_sections}</p>
          </div>
        </div>

        <div className="dashInstr-stat-card">
          <div className="dashInstr-stat-icon">
            <Clock size={24} />
          </div>
          <div className="dashInstr-stat-content">
            <p className="dashInstr-stat-label">Weekly Classes</p>
            <p className="dashInstr-stat-value">{stats.weekly_classes}</p>
          </div>
        </div>
      </div>

      {/* Today's Schedule Section */}
      <div className="dashInstr-main-grid">
        <div className="dashInstr-section dashInstr-full-width">
          <div className="dashInstr-section-header">
            <h2 className="dashInstr-section-title">
              Today's Classes - {currentDay}
            </h2>
            <div className="dashInstr-current-day-badge">
              {currentDay}
            </div>
          </div>
          
          {isLoading ? (
            <div className="dashInstr-loading">
              <div className="dashInstr-loading-spinner"></div>
              <p>Loading schedule...</p>
            </div>
          ) : error ? (
            <div className="dashInstr-error">
              <p>Failed to load schedule. Please try refreshing the page.</p>
              <button onClick={handleRetry} className="dashInstr-retry-button">
                Retry
              </button>
            </div>
          ) : todaySchedule.length === 0 ? (
            <div className="dashInstr-no-classes">
              <Calendar size={48} className="dashInstr-no-classes-icon" />
              <p className="dashInstr-no-classes-text">No classes scheduled for today</p>
              <p className="dashInstr-no-classes-subtext">Enjoy your day off!</p>
            </div>
          ) : (
            <div className="dashInstr-schedule-list">
              {todaySchedule.map((item, index) => (
                <div key={`${item.id}-${index}`} className="dashInstr-schedule-item">
                  <div className="dashInstr-schedule-time-badge">
                    <Clock size={16} />
                    {item.start_time && item.end_time ? (
                      <span>
                        {convertTo12Hour(item.start_time)} - {convertTo12Hour(item.end_time)}
                      </span>
                    ) : (
                      <span>Time TBA</span>
                    )}
                  </div>
                  <div className="dashInstr-schedule-details">
                    <div className="dashInstr-schedule-course-header">
                      <span className="dashInstr-schedule-course-code">{item.course_code}</span>
                      <span className="dashInstr-schedule-section-badge">{item.section}</span>
                    </div>
                    <p className="dashInstr-schedule-course">{item.course_name}</p>
                    <div className="dashInstr-schedule-meta">
                      {item.room && (
                        <span className="dashInstr-schedule-room">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                          </svg>
                          {item.room}
                        </span>
                      )}
                      <span className="dashInstr-schedule-year">{item.year_level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardInstructor;