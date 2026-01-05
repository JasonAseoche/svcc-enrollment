import React, { useState } from 'react';
import './ExistEnroll.css';

const ExistEnroll = () => {
  const [formData, setFormData] = useState({
    studentNumber: '',
    program: '',
    schoolYear: '',
    yearLevel: '',
    term: '',
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: ''
  });

  const programs = [
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Accountancy',
    'Bachelor of Elementary Education',
    'Bachelor of Secondary Education'
  ];

  const schoolYears = ['2025-2026', '2026-2027', '2027-2028'];

  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  
  const terms = ['1st Semester', '2nd Semester', 'Summer'];

  const suffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Backend integration will go here
  };

  return (
    <div className="svcc-exist-enroll-container">
      <div className="svcc-exist-enroll-wrapper">
        <div className="svcc-exist-enroll-header">
          <svg 
            className="svcc-exist-enroll-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="svcc-exist-enroll-title">Fill out the form for readmission</h1>
        </div>

        <form className="svcc-exist-enroll-form" onSubmit={handleSubmit}>
          {/* Row 1: Student Number and Program */}
          <div className="svcc-exist-enroll-row">
            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="studentNumber">
                Student Number <span className="svcc-exist-enroll-required">*</span>
              </label>
              <input
                type="text"
                id="studentNumber"
                name="studentNumber"
                className="svcc-exist-enroll-input"
                value={formData.studentNumber}
                onChange={handleChange}
                placeholder="Enter student number"
                required
              />
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="program">
                Program <span className="svcc-exist-enroll-required">*</span>
              </label>
              <select
                id="program"
                name="program"
                className="svcc-exist-enroll-select"
                value={formData.program}
                onChange={handleChange}
                required
              >
                <option value="">Select program</option>
                {programs.map((program, index) => (
                  <option key={index} value={program}>{program}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: School Year, Year Level and Term */}
          <div className="svcc-exist-enroll-row svcc-exist-enroll-row-term">
            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="schoolYear">
                School Year <span className="svcc-exist-enroll-required">*</span>
              </label>
              <select
                id="schoolYear"
                name="schoolYear"
                className="svcc-exist-enroll-select"
                value={formData.schoolYear}
                onChange={handleChange}
                required
              >
                <option value="">Select school year</option>
                {schoolYears.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="yearLevel">
                Year Level <span className="svcc-exist-enroll-required">*</span>
              </label>
              <select
                id="yearLevel"
                name="yearLevel"
                className="svcc-exist-enroll-select"
                value={formData.yearLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select year level</option>
                {yearLevels.map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="term">
                Term <span className="svcc-exist-enroll-required">*</span>
              </label>
              <select
                id="term"
                name="term"
                className="svcc-exist-enroll-select"
                value={formData.term}
                onChange={handleChange}
                required
              >
                <option value="">Select term</option>
                {terms.map((term, index) => (
                  <option key={index} value={term}>{term}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: First Name, Last Name, Middle Name, Suffix */}
          <div className="svcc-exist-enroll-row svcc-exist-enroll-row-names">
            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="firstName">
                First Name <span className="svcc-exist-enroll-required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className="svcc-exist-enroll-input"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="lastName">
                Last Name <span className="svcc-exist-enroll-required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="svcc-exist-enroll-input"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>

            <div className="svcc-exist-enroll-field">
              <label className="svcc-exist-enroll-label" htmlFor="middleName">
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                className="svcc-exist-enroll-input"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="Middle name"
              />
            </div>

            <div className="svcc-exist-enroll-field svcc-exist-enroll-field-suffix">
              <label className="svcc-exist-enroll-label" htmlFor="suffix">
                Suffix
              </label>
              <select
                id="suffix"
                name="suffix"
                className="svcc-exist-enroll-select"
                value={formData.suffix}
                onChange={handleChange}
              >
                {suffixes.map((suffix, index) => (
                  <option key={index} value={suffix}>{suffix || 'None'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="svcc-exist-enroll-submit-wrapper">
            <button type="submit" className="svcc-exist-enroll-submit-btn">
              Submit Enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExistEnroll;