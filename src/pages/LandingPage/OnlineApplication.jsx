import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SVCCLogo from '../../assets/svcc_logo.png';
import '../../components/LandingPageLayout/OnlineApplication.css';
import '../../components/LandingPageLayout/LandingPage.css';

const OnlineApplication = () => {
  const [showAdmissionDropdown, setShowAdmissionDropdown] = useState(false);
  const [showProgramsDropdown, setShowProgramsDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile] = useState(window.innerWidth <= 768);
  
  // Form states
  const [currentStep, setCurrentStep] = useState(1);
  const [studentType, setStudentType] = useState('');
  
  const steps = [
    { number: 1, title: 'Type of Student', key: 'student-type' },
    { number: 2, title: 'Personal Information', key: 'personal-info' },
    { number: 3, title: 'Validate Details', key: 'validate' },
    { number: 4, title: 'Submit', key: 'submit' }
  ];
  
  const [formData, setFormData] = useState({
    // Admission Details
    admitType: '',
    yearLevel: '',
    schoolYear: '',
    term: '',
    
    // Student's Information
    firstName: '',
    middleName: '',
    lastName: '',
    suffixName: '',
    gender: '',
    status: '',
    citizenship: '',
    dateOfBirth: '',
    birthplace: '',
    religion: '',
    
    // Current Address
    currentStreetUnit: '',
    currentStreet: '',
    currentSubdivision: '',
    currentBarangay: '',
    currentCity: '',
    currentProvince: '',
    currentZipCode: '',
    
    // Permanent Address
    sameAsCurrentAddress: false,
    permanentStreetUnit: '',
    permanentStreet: '',
    permanentSubdivision: '',
    permanentBarangay: '',
    permanentCity: '',
    permanentProvince: '',
    permanentZipCode: '',
    
    // Contact Details
    telephoneNo: '',
    mobileNo: '',
    emailAddress: '',
    
    // Current or Last School Attended
    schoolType: '',
    schoolName: '',
    programTrack: '',
    graduationDate: '',
    lastSchoolYear: '',
    lastYearLevel: '',
    lastTerm: '',
    
    // Parent/Guardian Information
    fatherFirstName: '',
    fatherLastName: '',
    fatherMiddleInitial: '',
    fatherSuffix: '',
    fatherMobile: '',
    fatherEmail: '',
    fatherOccupation: '',
    
    motherFirstName: '',
    motherLastName: '',
    motherMiddleInitial: '',
    motherSuffix: '',
    motherMobile: '',
    motherEmail: '',
    motherOccupation: '',
    
    guardianFirstName: '',
    guardianLastName: '',
    guardianMiddleInitial: '',
    guardianSuffix: '',
    guardianMobile: '',
    guardianEmail: '',
    guardianOccupation: '',
    guardianRelationship: ''
  });

  const handleStudentTypeSelect = (type) => {
    setStudentType(type);
    if (type === 'new') {
      setCurrentStep(2);
    } else {
      alert('Existing student functionality coming soon!');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      
      if (name === 'sameAsCurrentAddress' && checked) {
        setFormData(prev => ({
          ...prev,
          permanentStreetUnit: prev.currentStreetUnit,
          permanentStreet: prev.currentStreet,
          permanentSubdivision: prev.currentSubdivision,
          permanentBarangay: prev.currentBarangay,
          permanentCity: prev.currentCity,
          permanentProvince: prev.currentProvince,
          permanentZipCode: prev.currentZipCode
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      console.log('Form submitted:', formData);
      alert('Application submitted successfully!');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <>
      {/* Header Navigation */}
      <header className="landing-page-header">
        <nav className="landing-page-nav">
          <img src={SVCCLogo} alt="SVCC Logo" className="landing-page-header-logo" />
          
          <button 
            className="landing-page-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`landing-page-nav-list ${menuOpen ? 'landing-page-nav-list-open' : ''}`}>
            <li className="landing-page-nav-item">
              <Link to="/" className="landing-page-nav-link">Home</Link>
            </li>
            <li 
              className="landing-page-nav-item landing-page-dropdown"
              onMouseEnter={() => !isMobile && setShowAdmissionDropdown(true)}
              onMouseLeave={() => !isMobile && setShowAdmissionDropdown(false)}
            >
              <a 
                href="#admissions" 
                className="landing-page-nav-link"
                onClick={(e) => {
                  if (isMobile) {
                    e.preventDefault();
                    setShowAdmissionDropdown(!showAdmissionDropdown);
                  }
                }}
              >
                Admissions
                <span className="landing-page-dropdown-icon">▼</span>
              </a>
              {showAdmissionDropdown && (
                <ul className="landing-page-dropdown-menu">
                  <li><a href="#admission-requirements">Admission Requirements</a></li>
                  <li><a href="#online-application">Online Application</a></li>
                </ul>
              )}
            </li>
            <li 
              className="landing-page-nav-item landing-page-dropdown"
              onMouseEnter={() => !isMobile && setShowProgramsDropdown(true)}
              onMouseLeave={() => !isMobile && setShowProgramsDropdown(false)}
            >
              <a 
                href="#programs" 
                className="landing-page-nav-link"
                onClick={(e) => {
                  if (isMobile) {
                    e.preventDefault();
                    setShowProgramsDropdown(!showProgramsDropdown);
                  }
                }}
              >
                Programs
                <span className="landing-page-dropdown-icon">▼</span>
              </a>
              {showProgramsDropdown && (
                <ul className="landing-page-dropdown-menu">
                  <li><a href="#kinder">Kinder</a></li>
                  <li><a href="#elementary">Elementary</a></li>
                  <li><a href="#junior-hs">Junior HS</a></li>
                  <li><a href="#senior-hs">Senior HS</a></li>
                  <li><a href="#college">College</a></li>
                </ul>
              )}
            </li>
            <li className="landing-page-nav-item">
              <a href="#scholarship" className="landing-page-nav-link">Scholarship Program</a>
            </li>
            <li className="landing-page-nav-item">
              <a href="#about" className="landing-page-nav-link">About SVCC</a>
            </li>
            <li className="landing-page-nav-item">
              <Link to="/login" className="landing-page-nav-link">SVCC Portal</Link>
            </li>
            <li className="landing-page-nav-item">
              <a href="#contact" className="landing-page-nav-link">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Application Form Container */}
      <div className="svcc-application-container">
        <div className="svcc-application-content-wrapper">
          {/* Step Progress Bar - Left Side */}
          <div className="svcc-application-steps-sidebar">
            <h2 className="svcc-application-steps-title">Application Steps</h2>
            <div className="svcc-application-steps-list">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`svcc-application-step-item ${
                    currentStep === step.number ? 'active' : ''
                  } ${currentStep > step.number ? 'completed' : ''}`}
                >
                  <div className="svcc-application-step-number">
                    {currentStep > step.number ? '✓' : step.number}
                  </div>
                  <div className="svcc-application-step-content">
                    <div className="svcc-application-step-title">{step.title}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="svcc-application-step-line"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Form Area - Right Side */}
          <div className="svcc-application-main-content">
            <div className="svcc-application-wrapper">
              <div className="svcc-application-header">
                <svg 
                  className="svcc-application-icon" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h1 className="svcc-application-title">Online Application</h1>
              </div>
              <p className="svcc-application-subtitle">
                Welcome to St. Vincent College of Cabuyao. Kindly fill out the online application form for fast admission processes.
              </p>

              {/* Student Type Selection */}
              {currentStep === 1 && (
                <div className="svcc-application-student-type-section">
                  <h3 className="svcc-application-question">What type of student are you?</h3>
                  <div className="svcc-application-radio-group">
                    <label 
                      className={`svcc-application-radio-option ${studentType === 'new' ? 'selected' : ''}`}
                    >
                      <input 
                        type="radio" 
                        name="studentType" 
                        value="new"
                        checked={studentType === 'new'}
                        onChange={(e) => handleStudentTypeSelect(e.target.value)}
                      />
                      <span>New Student</span>
                    </label>
                    
                    <label 
                      className={`svcc-application-radio-option ${studentType === 'existing' ? 'selected' : ''}`}
                    >
                      <input 
                        type="radio" 
                        name="studentType" 
                        value="existing"
                        checked={studentType === 'existing'}
                        onChange={(e) => handleStudentTypeSelect(e.target.value)}
                      />
                      <span>Existing Student</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Application Form */}
              {currentStep === 2 && (
                <form onSubmit={handleSubmit} className="svcc-application-form">
                  {/* Admission Details */}
                  <div className="svcc-application-section">
                    <h3 className="svcc-application-section-title">Admission Details</h3>
                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Admit Type <span className="required">*</span></label>
                        <select 
                          name="admitType" 
                          value={formData.admitType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Please select type</option>
                          <option value="new">New Student</option>
                          <option value="transferee">Transferee</option>
                        </select>
                      </div>

                      <div className="svcc-application-field">
                        <label>Year Level <span className="required">*</span></label>
                        <select 
                          name="yearLevel" 
                          value={formData.yearLevel}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select year level</option>
                          <option value="first">First Year</option>
                          <option value="second">Second Year</option>
                          <option value="third">Third Year</option>
                          <option value="fourth">Fourth Year</option>
                        </select>
                      </div>

                      <div className="svcc-application-field">
                        <label>School Year <span className="required">*</span></label>
                        <select 
                          name="schoolYear" 
                          value={formData.schoolYear}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select school year</option>
                          <option value="2025-2026">2025-2026</option>
                          <option value="2026-2027">2026-2027</option>
                          <option value="2027-2028">2027-2028</option>
                        </select>
                      </div>

                      <div className="svcc-application-field">
                        <label>Term <span className="required">*</span></label>
                        <select 
                          name="term" 
                          value={formData.term}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select term</option>
                          <option value="1st">1st Term</option>
                          <option value="2nd">2nd Term</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Student's Information */}
                  <div className="svcc-application-section">
                    <h3 className="svcc-application-section-title">Student's Information</h3>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>First Name <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="firstName"
                          placeholder="Given Name"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Middle Name</label>
                        <input 
                          type="text" 
                          name="middleName"
                          placeholder="Middle Name"
                          value={formData.middleName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Last Name <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="lastName"
                          placeholder="Surname"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="svcc-application-field svcc-application-field-small">
                        <label>Suffix</label>
                        <input 
                          type="text" 
                          name="suffixName"
                          placeholder="Jr., Sr."
                          value={formData.suffixName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Gender <span className="required">*</span></label>
                        <select 
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div className="svcc-application-field">
                        <label>Civil Status <span className="required">*</span></label>
                        <select 
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="widowed">Widowed</option>
                          <option value="separated">Separated</option>
                        </select>
                      </div>

                      <div className="svcc-application-field">
                        <label>Citizenship <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="citizenship"
                          placeholder="Citizenship"
                          value={formData.citizenship}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Date of Birth <span className="required">*</span></label>
                        <input 
                          type="date" 
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Birthplace <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="birthplace"
                          placeholder="Birthplace"
                          value={formData.birthplace}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Religion <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="religion"
                          placeholder="Religion"
                          value={formData.religion}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Current Address */}
                  <div className="svcc-application-section">
                    <h3 className="svcc-application-section-title">Current Address</h3>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Street # / Unit # <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="currentStreetUnit"
                          value={formData.currentStreetUnit}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Street <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="currentStreet"
                          value={formData.currentStreet}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Subdivision / Village</label>
                        <input 
                          type="text" 
                          name="currentSubdivision"
                          value={formData.currentSubdivision}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Barangay</label>
                        <input 
                          type="text" 
                          name="currentBarangay"
                          value={formData.currentBarangay}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>City / Municipality <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="currentCity"
                          value={formData.currentCity}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Province</label>
                        <input 
                          type="text" 
                          name="currentProvince"
                          value={formData.currentProvince}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field svcc-application-field-small">
                        <label>Zip Code</label>
                        <input 
                          type="text" 
                          name="currentZipCode"
                          placeholder="xxxx"
                          value={formData.currentZipCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permanent Address */}
                  <div className="svcc-application-section">
                    <h3 className="svcc-application-section-title">Permanent Address</h3>

                    <div className="svcc-application-checkbox-wrapper">
                      <label className="svcc-application-checkbox-label">
                        <input 
                          type="checkbox" 
                          name="sameAsCurrentAddress"
                          checked={formData.sameAsCurrentAddress}
                          onChange={handleInputChange}
                        />
                        <span>Same as Current Address</span>
                      </label>
                    </div>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Street # / Unit # <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="permanentStreetUnit"
                          value={formData.permanentStreetUnit}
                          onChange={handleInputChange}
                          disabled={formData.sameAsCurrentAddress}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Street <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="permanentStreet"
                          value={formData.permanentStreet}
                          onChange={handleInputChange}
                          disabled={formData.sameAsCurrentAddress}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Subdivision / Village</label>
                        <input 
                          type="text" 
                          name="permanentSubdivision"
                          value={formData.permanentSubdivision}
                          onChange={handleInputChange}
                          disabled={formData.sameAsCurrentAddress}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Barangay</label>
                        <input 
                          type="text" 
                          name="permanentBarangay"
                          value={formData.permanentBarangay}
                          onChange={handleInputChange}
                          disabled={formData.sameAsCurrentAddress}
                        />
                      </div>
                    </div>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>City / Municipality <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="permanentCity"
                          value={formData.permanentCity}
                          onChange={handleInputChange}
                          disabled={formData.sameAsCurrentAddress}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Province</label>
                        <input 
                          type="text" 
                          name="permanentProvince"
                          value={formData.permanentProvince}
                          onChange={handleInputChange}
                          disabled={formData.sameAsCurrentAddress}
                        />
                      </div>

                      <div className="svcc-application-field svcc-application-field-small">
                        <label>Zip Code</label>
                        <input 
                          type="text" 
                          name="permanentZipCode"
                          placeholder="xxxx"
                          value={formData.permanentZipCode}
                          onChange={handleInputChange}
                          disabled={formData.sameAsCurrentAddress}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="svcc-application-section">
                    <h3 className="svcc-application-section-title">Contact Details</h3>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Telephone No.</label>
                        <input 
                          type="tel" 
                          name="telephoneNo"
                          value={formData.telephoneNo}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Mobile No. <span className="required">*</span></label>
                        <input 
                          type="tel" 
                          name="mobileNo"
                          placeholder="09XXXXXXXXX"
                          value={formData.mobileNo}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Email Address <span className="required">*</span></label>
                        <input 
                          type="email" 
                          name="emailAddress"
                          placeholder="example@domain.com"
                          value={formData.emailAddress}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Last School Attended */}
                  <div className="svcc-application-section">
                    <h3 className="svcc-application-section-title">Current or Last School Attended</h3>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>School Type <span className="required">*</span></label>
                        <select 
                          name="schoolType"
                          value={formData.schoolType}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select type</option>
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                      <div className="svcc-application-field">
                        <label>Name of School <span className="required">*</span></label>
                        <input 
                          type="text" 
                          name="schoolName"
                          placeholder="School name"
                          value={formData.schoolName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Program / Track</label>
                        <input 
                          type="text" 
                          name="programTrack"
                          placeholder="Program or Track"
                          value={formData.programTrack}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Date of Graduation</label>
                        <input 
                          type="date" 
                          name="graduationDate"
                          value={formData.graduationDate}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>School Year <span className="required">*</span></label>
                        <select 
                          name="lastSchoolYear"
                          value={formData.lastSchoolYear}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select school year</option>
                          <option value="2024-2025">2024-2025</option>
                          <option value="2023-2024">2023-2024</option>
                          <option value="2022-2023">2022-2023</option>
                        </select>
                      </div>

                      <div className="svcc-application-field">
                        <label>Year Level / Grade <span className="required">*</span></label>
                        <select 
                          name="lastYearLevel"
                          value={formData.lastYearLevel}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select year / grade</option>
                          <option value="grade-7">Grade 7</option>
                          <option value="grade-8">Grade 8</option>
                          <option value="grade-9">Grade 9</option>
                          <option value="grade-10">Grade 10</option>
                          <option value="grade-11">Grade 11</option>
                          <option value="grade-12">Grade 12</option>
                        </select>
                      </div>

                      <div className="svcc-application-field">
                        <label>Term</label>
                        <select 
                          name="lastTerm"
                          value={formData.lastTerm}
                          onChange={handleInputChange}
                        >
                          <option value="">Select term</option>
                          <option value="1st">1st Term</option>
                          <option value="2nd">2nd Term</option>
                          <option value="3rd">3rd Term</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Parent/Guardian Information */}
                  <div className="svcc-application-section">
                    <h3 className="svcc-application-section-title">
                      Parents / Guardian's Information
                      <span className="svcc-application-note">* Complete at least one</span>
                    </h3>

                    {/* Father's Information */}
                    <h4 className="svcc-application-subsection-title">Father's Information</h4>
                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>First Name</label>
                        <input 
                          type="text" 
                          name="fatherFirstName"
                          placeholder="First Name"
                          value={formData.fatherFirstName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Last Name</label>
                        <input 
                          type="text" 
                          name="fatherLastName"
                          placeholder="Last Name"
                          value={formData.fatherLastName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field svcc-application-field-small">
                        <label>M.I.</label>
                        <input 
                          type="text" 
                          name="fatherMiddleInitial"
                          placeholder="M.I."
                          value={formData.fatherMiddleInitial}
                          onChange={handleInputChange}
                          maxLength="1"
                        />
                      </div>

                      <div className="svcc-application-field svcc-application-field-small">
                        <label>Suffix</label>
                        <input 
                          type="text" 
                          name="fatherSuffix"
                          placeholder="Jr., Sr."
                          value={formData.fatherSuffix}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Mobile Number</label>
                        <input 
                          type="tel" 
                          name="fatherMobile"
                          placeholder="09XXXXXXXXX"
                          value={formData.fatherMobile}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Email</label>
                        <input 
                          type="email" 
                          name="fatherEmail"
                          placeholder="Email Address"
                          value={formData.fatherEmail}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Occupation</label>
                        <input 
                          type="text" 
                          name="fatherOccupation"
                          placeholder="Occupation"
                          value={formData.fatherOccupation}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Mother's Information */}
                    <h4 className="svcc-application-subsection-title">Mother's Information</h4>
                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>First Name</label>
                        <input 
                          type="text" 
                          name="motherFirstName"
                          placeholder="First Name"
                          value={formData.motherFirstName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Last Name</label>
                        <input 
                          type="text" 
                          name="motherLastName"
                          placeholder="Last Name"
                          value={formData.motherLastName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field svcc-application-field-small">
                        <label>M.I.</label>
                        <input 
                          type="text" 
                          name="motherMiddleInitial"
                          placeholder="M.I."
                          value={formData.motherMiddleInitial}
                          onChange={handleInputChange}
                          maxLength="1"
                        />
                      </div>

                      <div className="svcc-application-field svcc-application-field-small">
                        <label>Suffix</label>
                        <input 
                          type="text" 
                          name="motherSuffix"
                          placeholder="Jr., Sr."
                          value={formData.motherSuffix}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Mobile Number</label>
                        <input 
                          type="tel" 
                          name="motherMobile"
                          placeholder="09XXXXXXXXX"
                          value={formData.motherMobile}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Email</label>
                        <input 
                          type="email" 
                          name="motherEmail"
                          placeholder="Email Address"
                          value={formData.motherEmail}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Occupation</label>
                        <input 
                          type="text" 
                          name="motherOccupation"
                          placeholder="Occupation"
                          value={formData.motherOccupation}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Guardian's Information */}
                    <h4 className="svcc-application-subsection-title">Guardian's Information</h4>
                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>First Name</label>
                        <input 
                          type="text" 
                          name="guardianFirstName"
                          placeholder="First Name"
                          value={formData.guardianFirstName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Last Name</label>
                        <input 
                          type="text" 
                          name="guardianLastName"
                          placeholder="Last Name"
                          value={formData.guardianLastName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field svcc-application-field-small">
                        <label>M.I.</label>
                        <input 
                          type="text" 
                          name="guardianMiddleInitial"
                          placeholder="M.I."
                          value={formData.guardianMiddleInitial}
                          onChange={handleInputChange}
                          maxLength="1"
                        />
                      </div>

                      <div className="svcc-application-field svcc-application-field-small">
                        <label>Suffix</label>
                        <input 
                          type="text" 
                          name="guardianSuffix"
                          placeholder="Jr., Sr."
                          value={formData.guardianSuffix}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="svcc-application-row">
                      <div className="svcc-application-field">
                        <label>Mobile Number</label>
                        <input 
                          type="tel" 
                          name="guardianMobile"
                          placeholder="09XXXXXXXXX"
                          value={formData.guardianMobile}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Email</label>
                        <input 
                          type="email" 
                          name="guardianEmail"
                          placeholder="Email Address"
                          value={formData.guardianEmail}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Occupation</label>
                        <input 
                          type="text" 
                          name="guardianOccupation"
                          placeholder="Occupation"
                          value={formData.guardianOccupation}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="svcc-application-field">
                        <label>Relationship</label>
                        <input 
                          type="text" 
                          name="guardianRelationship"
                          placeholder="Relationship"
                          value={formData.guardianRelationship}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="svcc-application-navigation">
                    <button 
                      type="button" 
                      onClick={handleBack}
                      className="svcc-application-btn svcc-application-btn-back"
                    >
                      ← Back
                    </button>
                    <button 
                      type="submit" 
                      className="svcc-application-btn svcc-application-btn-next"
                    >
                      Next: Validate Details →
                    </button>
                  </div>
                </form>
              )}

              {/* Validation Step */}
              {currentStep === 3 && (
                <div className="svcc-application-validation">
                  <h2 className="svcc-application-validation-title">Validate Your Details</h2>
                  <p className="svcc-application-helper-text">Please review your information before submitting</p>

                  <div className="svcc-application-review-section">
                    <h3>Admission Details</h3>
                    <div className="svcc-application-review-grid">
                      <div className="svcc-application-review-item">
                        <span className="label">Admit Type:</span>
                        <span className="value">{formData.admitType || 'N/A'}</span>
                      </div>
                      <div className="svcc-application-review-item">
                        <span className="label">Year Level:</span>
                        <span className="value">{formData.yearLevel || 'N/A'}</span>
                      </div>
                      <div className="svcc-application-review-item">
                        <span className="label">School Year:</span>
                        <span className="value">{formData.schoolYear || 'N/A'}</span>
                      </div>
                      <div className="svcc-application-review-item">
                        <span className="label">Term:</span>
                        <span className="value">{formData.term || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="svcc-application-review-section">
                    <h3>Student's Information</h3>
                    <div className="svcc-application-review-grid">
                      <div className="svcc-application-review-item">
                        <span className="label">Full Name:</span>
                        <span className="value">
                          {`${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''} ${formData.suffixName || ''}`.trim() || 'N/A'}
                        </span>
                      </div>
                      <div className="svcc-application-review-item">
                        <span className="label">Gender:</span>
                        <span className="value">{formData.gender || 'N/A'}</span>
                      </div>
                      <div className="svcc-application-review-item">
                        <span className="label">Date of Birth:</span>
                        <span className="value">{formData.dateOfBirth || 'N/A'}</span>
                      </div>
                      <div className="svcc-application-review-item">
                        <span className="label">Citizenship:</span>
                        <span className="value">{formData.citizenship || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="svcc-application-review-section">
                    <h3>Contact Details</h3>
                    <div className="svcc-application-review-grid">
                      <div className="svcc-application-review-item">
                        <span className="label">Mobile Number:</span>
                        <span className="value">{formData.mobileNo || 'N/A'}</span>
                      </div>
                      <div className="svcc-application-review-item">
                        <span className="label">Email:</span>
                        <span className="value">{formData.emailAddress || 'N/A'}</span>
                      </div>
                      <div className="svcc-application-review-item">
                        <span className="label">Current Address:</span>
                        <span className="value">
                          {`${formData.currentStreetUnit || ''} ${formData.currentStreet || ''}, ${formData.currentCity || ''}`.trim() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="svcc-application-notice">
                    <p>⚠️ Please ensure all information is correct. Click "Back" to make changes or "Proceed" to continue.</p>
                  </div>

                  <div className="svcc-application-navigation">
                    <button 
                      type="button" 
                      onClick={handleBack}
                      className="svcc-application-btn svcc-application-btn-back"
                    >
                      ← Back to Edit
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNext}
                      className="svcc-application-btn svcc-application-btn-next"
                    >
                      Proceed to Submit →
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Step */}
              {currentStep === 4 && (
                <div className="svcc-application-submit">
                  <div className="svcc-application-submit-icon">✓</div>
                  <h2>Ready to Submit</h2>
                  <p className="svcc-application-submit-message">
                    You are about to submit your application to St. Vincent College of Cabuyao.
                    Once submitted, you will receive a confirmation email with further instructions.
                  </p>

                  <div className="svcc-application-checklist">
                    <h3>Before you submit:</h3>
                    <ul>
                      <li>✓ All required information has been provided</li>
                      <li>✓ Contact details are accurate</li>
                      <li>✓ Parent/Guardian information is complete</li>
                      <li>✓ Previous school details are correct</li>
                    </ul>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="svcc-application-terms">
                      <label>
                        <input type="checkbox" required />
                        <span>I certify that all information provided is true and accurate to the best of my knowledge.</span>
                      </label>
                    </div>

                    <div className="svcc-application-navigation">
                      <button 
                        type="button" 
                        onClick={handleBack}
                        className="svcc-application-btn svcc-application-btn-back"
                      >
                        ← Back
                      </button>
                      <button 
                        type="submit" 
                        className="svcc-application-btn svcc-application-btn-submit"
                      >
                        Submit Application
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnlineApplication;