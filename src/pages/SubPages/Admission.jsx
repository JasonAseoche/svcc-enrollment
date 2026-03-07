import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SVCCLogo from '../../assets/svcc_logo.png';
import subpageBg from '../../assets/subpage-bg.png';
import '../../components/LandingPageLayout/LandingPage.css';
import './Admission.css';

const Admission = () => {
  const [showAdmissionDropdown, setShowAdmissionDropdown] = useState(false);
  const [showProgramsDropdown, setShowProgramsDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile] = useState(window.innerWidth <= 768);

  const requirements = [
    {
      id: 1,
      text: 'PSA Birth Certificate (Photocopy)',
      icon: '📄',
    },
    {
      id: 2,
      text: 'Form 138A / Report Card and Form 137',
      icon: '📋',
    },
    {
      id: 3,
      text: 'Certificate of Good Moral Character',
      icon: '📜',
    },
    {
      id: 4,
      text: 'Photocopy of NSO Marriage Certificate (If Married)',
      icon: '📝',
    },
    {
      id: 5,
      text: '2pcs 2x2 Picture (White Background)',
      icon: '🖼️',
    },
  ];

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
                  <li><Link to="/admission-requirements">Admission Requirements</Link></li>
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

      {/* Subpage Hero Banner */}
      <div
        className="admission-banner"
        style={{ backgroundImage: `url(${subpageBg})` }}
      >
        <div className="admission-banner-overlay">
          <div className="admission-banner-content">
            <h1 className="admission-banner-title">Admission Requirements</h1>
            <p className="admission-banner-subtitle">
              Complete the requirements below for successful enrollment!
            </p>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <section className="admission-section">
        <div className="admission-container">

          {/* Breadcrumb */}
          <div className="admission-breadcrumb">
            <Link to="/" className="admission-breadcrumb-link">Home</Link>
            <span className="admission-breadcrumb-sep">/</span>
            <span className="admission-breadcrumb-current">Admission Requirements</span>
          </div>

          {/* Requirements Card */}
          <div className="admission-card">
            <div className="admission-card-header">
              <div className="admission-card-header-bar"></div>
              <h2 className="admission-card-title">College Requirements</h2>
            </div>

            <p className="admission-card-note">
              Please prepare the following documents prior to enrollment. Ensure all photocopies are clear and legible.
            </p>

            <ul className="admission-requirements-list">
              {requirements.map((req) => (
                <li key={req.id} className="admission-requirement-item">
                  <span className="admission-requirement-number">{req.id}</span>
                  <span className="admission-requirement-text">{req.text}</span>
                </li>
              ))}
            </ul>

            <div className="admission-card-footer">
              <p className="admission-card-footer-text">
                <strong>Note:</strong> All requirements must be submitted to the Registrar's Office upon enrollment. Incomplete submissions may delay the enrollment process.
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Admission;