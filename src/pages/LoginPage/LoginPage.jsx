import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgsvcc from '../../assets/svcc_gate.jpg';
import SVCCLogo from '../../assets/svcc_logo.png';
import './LoginPage.css';
import '../../components/LandingPageLayout/LandingPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showAdmissionDropdown, setShowAdmissionDropdown] = useState(false);
  const [showProgramsDropdown, setShowProgramsDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile] = useState(window.innerWidth <= 768);
  
  // Login form states
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost/svcc-enrollment/login.php',
        {
          email: formData.email,
          password: formData.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Store user data and token in localStorage
        const userData = response.data.data.user;
        const token = response.data.data.token;
        
        // Store complete user data
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Store user_id separately for easy access (optional but helpful)
        localStorage.setItem('user_id', userData.user_id);
        
        // Store role-specific IDs if available
        if (userData.student_number) {
          localStorage.setItem('student_number', userData.student_number);
        }
        if (userData.instructor_id) {
          localStorage.setItem('instructor_id', userData.instructor_id);
        }
        if (userData.program_head_id) {
          localStorage.setItem('program_head_id', userData.program_head_id);
        }

        console.log('User logged in:', {
          user_id: userData.user_id,
          role: userData.role,
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email
        });

        // Redirect based on user role and enrollment status
        const userRole = userData.role;
        
        switch (userRole) {
         case 'superadmin':
            navigate('/dashboard-superadmin');
            break;
          case 'admin':
            navigate('/dashboard-admin');
            break;
          case 'program_head':
            navigate('/dashboard-head');
            break;
          case 'instructor':
            navigate('/dashboard-instructor');
            break;
          case 'student':
            // Check enrollment status for students
            if (userData.enrollment_status === 'unenrolled') {
              navigate('/exist-enroll');
            } else {
              navigate('/dashboard-student');
            }
            break;
          default:
            navigate('/');
        }
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data.message || 'Invalid credentials');
      } else if (err.request) {
        setError('Server is not responding. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
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
                  <li><a href="admission-requirements">Admission Requirements</a></li>
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
                  <li><a href="college-program">College</a></li>
                </ul>
              )}
            </li>
            <li className="landing-page-nav-item">
              <a href="about" className="landing-page-nav-link">About SVCC</a>
            </li>
            <li className="landing-page-nav-item">
              <Link to="/login" className="landing-page-nav-link">SVCC Portal</Link>
            </li>
            <li className="landing-page-nav-item">
              <a href="contact" className="landing-page-nav-link">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Login Section */}
      <div className="svcc-login-container" style={{ backgroundImage: `url(${bgsvcc})` }}>
        <div className="svcc-login-form-wrapper">
          <div className="svcc-login-form">
            <div className="svcc-login-logo">
              <img src={SVCCLogo} alt="SVCC Logo" />
            </div>
            
            <h2 className="svcc-login-title">LOG IN YOUR ACCOUNT</h2>
            
            {error && (
              <div className="svcc-login-error">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="svcc-login-input-group">
                <input
                  type="text"
                  name="email"
                  placeholder="Email or Student Number"
                  className="svcc-login-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              
              <div className="svcc-login-input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="svcc-login-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              
              <button 
                type="submit" 
                className="svcc-login-button"
                disabled={loading}
              >
                {loading ? 'LOGGING IN...' : 'LOG IN'}
              </button>
            </form>
            
            <p className="svcc-login-help-text">
              Having a trouble logging in? <span className="svcc-login-clickable">Click Here</span>
            </p>
            <p className="svcc-login-copyright">
              © 2026 St. Vincent College of Cabuyao. All Right Reserved
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;