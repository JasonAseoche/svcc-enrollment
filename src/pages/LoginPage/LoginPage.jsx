import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import bgsvcc from '../../assets/slide2.jpg';
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

  // Hardcoded accounts for demo
  const demoAccounts = {
    'admin': { password: '123', role: 'admin', name: 'Admin User' },
    'student': { password: '123', role: 'student', name: 'Student User' },
    'head': { password: '123', role: 'program_head', name: 'Program Head User' },
    'instructor': { password: '123', role: 'instructor', name: 'Instructor User' }
  };

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

    // Simulate API delay
    setTimeout(() => {
      const username = formData.email.toLowerCase().trim();
      const account = demoAccounts[username];

      if (account && account.password === formData.password) {
        // Create user object
        const user = {
          email: username,
          role: account.role,
          name: account.name
        };

        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'demo-token-' + Date.now());
        localStorage.setItem('isAuthenticated', 'true');

        // Redirect based on user role
        switch (account.role) {
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
            navigate('/dashboard-student');
            break;
          default:
            navigate('/');
        }
      } else {
        setError('Invalid credentials. Use: admin/student/head/instructor with password: 123');
      }
      
      setLoading(false);
    }, 800);
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
                  <li><a href="online-application">Online Application</a></li>
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
                  placeholder="Username (admin/student/head/instructor)"
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
                  placeholder="Password (123)"
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
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;