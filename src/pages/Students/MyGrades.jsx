import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUser, getUserId } from '../../utils/auth';
import { AlertCircle } from 'lucide-react';
import '../../components/StudentLayout/MyGrades.css';

const API_URL = 'http://localhost/svcc-enrollment/my_grades.php';

const MyGrades = () => {
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [availableTerms, setAvailableTerms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [gwa, setGwa] = useState(null);
  const [cumulativeGwa, setCumulativeGwa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = getCurrentUser();
  const userId = getUserId();

  // Verify user is a student
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      setError('Access denied. Student account required.');
      setIsLoading(false);
    }
  }, [currentUser]);


  useEffect(() => {
    if (userId && currentUser?.role === 'student') {
      fetchAvailableTerms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch grades when term selection changes
  useEffect(() => {
    if (userId && selectedTerm && selectedSchoolYear) {
      fetchStudentGrades(selectedTerm, selectedSchoolYear);
    }
  }, [userId, selectedTerm, selectedSchoolYear]);

  const fetchAvailableTerms = async () => {
  try {
    const response = await axios.get(`${API_URL}?action=get_available_terms&user_id=${userId}`);
    
    if (response.data.success && response.data.data.length > 0) {
      setAvailableTerms(response.data.data);
      
      // Only set default term if no term is currently selected
      if (!selectedTerm || !selectedSchoolYear) {
        const latestTerm = response.data.data[0];
        setSelectedTerm(latestTerm.term);
        setSelectedSchoolYear(latestTerm.school_year);
      }
    } else {
      setError('No enrollment records found');
      setIsLoading(false);
    }
  } catch (err) {
    console.error('Error fetching terms:', err);
    setError('Failed to load terms');
    setIsLoading(false);
  }
};

  const fetchStudentGrades = async (term, schoolYear) => {
    try {
      console.log('Setting isLoading to true');
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching grades for:', { userId, term, schoolYear });
      
      const response = await axios.get(
        `${API_URL}?action=get_student_grades&user_id=${userId}&term=${encodeURIComponent(term)}&school_year=${encodeURIComponent(schoolYear)}`
      );
      
      console.log('Response received:', response.data);
      
      if (response.data.success) {
        console.log('Courses found:', response.data.data.courses.length);
        console.log('Setting courses state...');
        setCourses(response.data.data.courses);
        setGwa(response.data.data.gwa);
        setCumulativeGwa(response.data.data.cumulative_gwa);
        console.log('States set successfully');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Failed to load grades');
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleTermChange = (e) => {
    const selectedValue = e.target.value;
    const termData = availableTerms.find(t => t.display === selectedValue);
    
    if (termData) {
      setSelectedTerm(termData.term);
      setSelectedSchoolYear(termData.school_year);
    }
  };

  if (error && !currentUser) {
    return (
      <div className="svcc-mygrades-container">
        <div className="svcc-mygrades-error">
          <AlertCircle size={48} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="svcc-mygrades-container">
      <div className="svcc-mygrades-header">
        <div className="svcc-mygrades-header-left">
          <select 
            className="svcc-mygrades-term-select"
            value={selectedTerm && selectedSchoolYear ? `${selectedSchoolYear} ${selectedTerm}` : ''}
            onChange={handleTermChange}
            disabled={isLoading || availableTerms.length === 0}
          >
            {availableTerms.length === 0 ? (
              <option>No terms available</option>
            ) : (
              availableTerms.map((term, index) => (
                  <option key={index} value={term.display}>
                  {term.display.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="svcc-mygrades-header-right">
          <div className="svcc-mygrades-gwa-item">
            <span className="svcc-mygrades-gwa-label">GWA</span>
            <span className="svcc-mygrades-gwa-value">
              {gwa !== null ? gwa.toFixed(2) : '—'}
            </span>
          </div>
          <div className="svcc-mygrades-gwa-item">
            <span className="svcc-mygrades-gwa-label">Cumulative GWA</span>
            <span className="svcc-mygrades-gwa-value">
              {cumulativeGwa !== null ? cumulativeGwa.toFixed(2) : '—'}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="svcc-mygrades-loading">
          <div className="svcc-mygrades-spinner"></div>
          <p>Loading grades...</p>
        </div>
      ) : error ? (
        <div className="svcc-mygrades-error">
          <AlertCircle size={48} />
          <p>{error}</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="svcc-mygrades-empty">
          <p>No courses found for this term</p>
        </div>
      ) : (
        <div className="svcc-mygrades-grid">
          {courses.map((course) => (
            <div key={course.id} className="svcc-mygrades-card">
              <div className="svcc-mygrades-card-header">
                <h3 className="svcc-mygrades-course-name">{course.courseName}</h3>
                <p className="svcc-mygrades-course-code">{course.courseCode}</p>
                <p className="svcc-mygrades-instructor">{course.instructor}</p>
              </div>
              <div className="svcc-mygrades-divider"></div>
              
              <div className="svcc-mygrades-grades-row">
                <div className="svcc-mygrades-grade-item">
                  <span className="svcc-mygrades-grade-label">Prelim</span>
                  <span className="svcc-mygrades-grade-value">
                    {course.prelim !== null ? course.prelim.toFixed(2) : '—'}
                  </span>
                </div>
                <div className="svcc-mygrades-grade-item">
                  <span className="svcc-mygrades-grade-label">Midterm</span>
                  <span className="svcc-mygrades-grade-value">
                    {course.midterm !== null ? course.midterm.toFixed(2) : '—'}
                  </span>
                </div>
                <div className="svcc-mygrades-grade-item">
                  <span className="svcc-mygrades-grade-label">Prefinals</span>
                  <span className="svcc-mygrades-grade-value">
                    {course.prefinals !== null ? course.prefinals.toFixed(2) : '—'}
                  </span>
                </div>
                <div className="svcc-mygrades-grade-item">
                  <span className="svcc-mygrades-grade-label">Finals</span>
                  <span className="svcc-mygrades-grade-value">
                    {course.finals !== null ? course.finals.toFixed(2) : '—'}
                  </span>
                </div>
              </div>

              <div className="svcc-mygrades-divider"></div>
              
              <div className="svcc-mygrades-final-row">
                <span className="svcc-mygrades-final-label">Final Grade</span>
                <span className="svcc-mygrades-final-value">
                  {course.finalGrade !== null ? course.finalGrade.toFixed(2) : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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