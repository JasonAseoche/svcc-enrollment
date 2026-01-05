import React, { useState } from 'react';
import '../../components/StudentLayout/MyGrades.css';

const MyGrades = () => {
  const [selectedTerm, setSelectedTerm] = useState('2025-2026 1st Term');

  // Sample data - replace with actual data later
  const courses = [
    {
      id: 1,
      courseName: 'Euthenics 2',
      instructor: 'Prof. Maria Santos',
      prelim: 85,
      midterm: 88,
      prefinals: 90,
      finals: 92,
      finalGrade: 88.75
    },
    {
      id: 2,
      courseName: 'Introduction to Programming',
      instructor: 'Prof. Juan Dela Cruz',
      prelim: 90,
      midterm: 92,
      prefinals: 88,
      finals: 91,
      finalGrade: 90.25
    },
    {
      id: 3,
      courseName: 'Data Structures',
      instructor: 'Prof. Ana Reyes',
      prelim: 87,
      midterm: 85,
      prefinals: 89,
      finals: 90,
      finalGrade: 87.75
    },
    {
      id: 4,
      courseName: 'Web Development',
      instructor: 'Prof. Carlos Mendez',
      prelim: 91,
      midterm: 93,
      prefinals: 92,
      finals: 94,
      finalGrade: 92.5
    }
  ];

  const gwa = 89.81;
  const cumulativeGwa = 88.95;

  return (
    <div className="svcc-mygrades-container">
      <div className="svcc-mygrades-header">
        <div className="svcc-mygrades-header-left">
          <select 
            className="svcc-mygrades-term-select"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            <option>2025-2026 1st Term</option>
            <option>2025-2026 2nd Term</option>
            <option>2024-2025 1st Term</option>
            <option>2024-2025 2nd Term</option>
          </select>
        </div>
        <div className="svcc-mygrades-header-right">
          <div className="svcc-mygrades-gwa-item">
            <span className="svcc-mygrades-gwa-label">GWA</span>
            <span className="svcc-mygrades-gwa-value">{gwa.toFixed(2)}</span>
          </div>
          <div className="svcc-mygrades-gwa-item">
            <span className="svcc-mygrades-gwa-label">Cumulative GWA</span>
            <span className="svcc-mygrades-gwa-value">{cumulativeGwa.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="svcc-mygrades-grid">
        {courses.map((course) => (
          <div key={course.id} className="svcc-mygrades-card">
            <div className="svcc-mygrades-card-header">
              <h3 className="svcc-mygrades-course-name">{course.courseName}</h3>
              <p className="svcc-mygrades-instructor">{course.instructor}</p>
            </div>
            <div className="svcc-mygrades-divider"></div>
            
            <div className="svcc-mygrades-grades-row">
              <div className="svcc-mygrades-grade-item">
                <span className="svcc-mygrades-grade-label">Prelim</span>
                <span className="svcc-mygrades-grade-value">{course.prelim}</span>
              </div>
              <div className="svcc-mygrades-grade-item">
                <span className="svcc-mygrades-grade-label">Midterm</span>
                <span className="svcc-mygrades-grade-value">{course.midterm}</span>
              </div>
              <div className="svcc-mygrades-grade-item">
                <span className="svcc-mygrades-grade-label">Prefinals</span>
                <span className="svcc-mygrades-grade-value">{course.prefinals}</span>
              </div>
              <div className="svcc-mygrades-grade-item">
                <span className="svcc-mygrades-grade-label">Finals</span>
                <span className="svcc-mygrades-grade-value">{course.finals}</span>
              </div>
            </div>

            <div className="svcc-mygrades-divider"></div>
            
            <div className="svcc-mygrades-final-row">
              <span className="svcc-mygrades-final-label">Final Grade</span>
              <span className="svcc-mygrades-final-value">{course.finalGrade.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="svcc-mygrades-system-card">
        <h3 className="svcc-mygrades-system-title">Percentage Equivalent:</h3>
        <div className="svcc-mygrades-system-grid">
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>98-100 (1.00)</span>
          </div>
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>88-86 (2.00)</span>
          </div>
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>75 (3.00)</span>
          </div>
          
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>97-95 (1.25)</span>
          </div>
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>85-83 (2.25)</span>
          </div>
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>74-0 (Failed)</span>
          </div>
          
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>94-92 (1.50)</span>
          </div>
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>82-80 (2.50)</span>
          </div>
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Dropped (DRP)</span>
          </div>
          
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>91-89 (1.75)</span>
          </div>
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>79-76 (2.75)</span>
          </div>
          <div className="svcc-mygrades-system-item">
            <svg className="svcc-mygrades-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Incomplete (INC)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGrades;