import React, { useState } from 'react';
import '../../components/StudentLayout/MySchedule.css';

const MySchedule = () => {
  const [selectedTerm, setSelectedTerm] = useState('2025-2026 1st Term');
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const section = 'BSIT-301';

  // Sample schedule data - replace with actual data later
  const scheduleData = {
    'Monday': [
      {
        id: 1,
        subject: 'Data Structures and Algorithms',
        time: '7:00 AM - 9:00 AM',
        room: 'Room 301',
        teacher: 'Prof. Maria Santos'
      },
      {
        id: 2,
        subject: 'Web Development 2',
        time: '9:00 AM - 11:00 AM',
        room: 'Room 205',
        teacher: 'Prof. Juan Dela Cruz'
      },
      {
        id: 3,
        subject: 'Database Management',
        time: '1:00 PM - 3:00 PM',
        room: 'Room 302',
        teacher: 'Prof. Ana Reyes'
      }
    ],
    'Tuesday': [
      {
        id: 4,
        subject: 'Software Engineering',
        time: '8:00 AM - 10:00 AM',
        room: 'Room 201',
        teacher: 'Prof. Carlos Mendez'
      },
      {
        id: 5,
        subject: 'Euthenics 2',
        time: '10:00 AM - 11:00 AM',
        room: 'Room 101',
        teacher: 'Prof. Lisa Garcia'
      }
    ],
    'Wednesday': [
      {
        id: 6,
        subject: 'Data Structures and Algorithms',
        time: '7:00 AM - 9:00 AM',
        room: 'Room 301',
        teacher: 'Prof. Maria Santos'
      },
      {
        id: 7,
        subject: 'Web Development 2',
        time: '9:00 AM - 11:00 AM',
        room: 'Room 205',
        teacher: 'Prof. Juan Dela Cruz'
      }
    ],
    'Thursday': [
      {
        id: 8,
        subject: 'Software Engineering',
        time: '8:00 AM - 10:00 AM',
        room: 'Room 201',
        teacher: 'Prof. Carlos Mendez'
      },
      {
        id: 9,
        subject: 'Database Management',
        time: '1:00 PM - 3:00 PM',
        room: 'Room 302',
        teacher: 'Prof. Ana Reyes'
      }
    ],
    'Friday': [
      {
        id: 10,
        subject: 'Capstone Project',
        time: '9:00 AM - 12:00 PM',
        room: 'Room 401',
        teacher: 'Prof. Robert Torres'
      }
    ],
    'Saturday': []
  };

  const currentSchedule = scheduleData[selectedDay] || [];

  return (
    <div className="svcc-myschedule-container">
      <div className="svcc-myschedule-header">
        <div className="svcc-myschedule-header-left">
          <select 
            className="svcc-myschedule-term-select"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option>2025-2026 1st Term</option>
            <option>2025-2026 2nd Term</option>
            <option>2024-2025 1st Term</option>
            <option>2024-2025 2nd Term</option>
          </select>
        </div>
        <div className="svcc-myschedule-header-right">
          <div className="svcc-myschedule-section">
            <svg className="svcc-myschedule-section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="svcc-myschedule-section-text">{section}</span>
          </div>
        </div>
      </div>

      <div className="svcc-myschedule-days-container">
        {days.map((day) => (
          <button
            key={day}
            className={`svcc-myschedule-day-btn ${selectedDay === day ? 'active' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="svcc-myschedule-card">
        <div className="svcc-myschedule-table-container">
          <table className="svcc-myschedule-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Subject</th>
                <th>Time</th>
                <th>Room</th>
                <th>Teacher</th>
              </tr>
            </thead>
            <tbody>
              {currentSchedule.length > 0 ? (
                currentSchedule.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{selectedDay}</td>
                    <td>{schedule.subject}</td>
                    <td>{schedule.time}</td>
                    <td>{schedule.room}</td>
                    <td>{schedule.teacher}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="svcc-myschedule-no-data">
                    No classes scheduled for {selectedDay}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MySchedule;