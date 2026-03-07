import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaFacebookF, FaMapMarkerAlt } from 'react-icons/fa';
import SVCCLogo from '../../assets/svcc_logo.png';
import subpageBg from '../../assets/subpage-bg.png';
import '../../components/LandingPageLayout/LandingPage.css';
import './Contact.css';

const Contact = () => {
  const [showAdmissionDropdown, setShowAdmissionDropdown] = useState(false);
  const [showProgramsDropdown, setShowProgramsDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile] = useState(window.innerWidth <= 768);

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
                  <li><Link to="/college-program">College</Link></li>
                </ul>
              )}
            </li>
            <li className="landing-page-nav-item">
              <Link to="/about" className="landing-page-nav-link">About SVCC</Link>
            </li>
            <li className="landing-page-nav-item">
              <Link to="/login" className="landing-page-nav-link">SVCC Portal</Link>
            </li>
            <li className="landing-page-nav-item">
              <Link to="/contact" className="landing-page-nav-link">Contact</Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Banner */}
      <div
        className="contact-banner"
        style={{ backgroundImage: `url(${subpageBg})` }}
      >
        <div className="contact-banner-overlay">
          <div className="contact-banner-content">
            <h1 className="contact-banner-title">Contact Us</h1>
            <p className="contact-banner-subtitle">Get in touch with St. Vincent College of Cabuyao</p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <section className="contact-section">
        <div className="contact-container">

          {/* Breadcrumb */}
          <div className="contact-breadcrumb">
            <Link to="/" className="contact-breadcrumb-link">Home</Link>
            <span className="contact-breadcrumb-sep">/</span>
            <span className="contact-breadcrumb-current">Contact</span>
          </div>

          {/* Contact Card */}
          <div className="contact-card">

            {/* Left — Contact Info */}
            <div className="contact-info">
              <h2 className="contact-info-title">Contact Information</h2>

              <div className="contact-info-item">
                <FaPhone className="contact-icon" />
                <div>
                  <span className="contact-info-label">Telephone Number</span>
                  <span className="contact-info-value">049 5311 671</span>
                </div>
              </div>

              <div className="contact-info-item">
                <FaEnvelope className="contact-icon" />
                <div>
                  <span className="contact-info-label">Email</span>
                  <a
                    href="mailto:svcccollegeenrollment@gmail.com"
                    className="contact-info-link"
                  >
                    svcccollegeenrollment@gmail.com
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <FaFacebookF className="contact-icon" />
                <div>
                  <span className="contact-info-label">Facebook</span>
                  <a
                    href="https://www.facebook.com/svcccabuyaoofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-info-link"
                  >
                    SVCC Facebook Page
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <FaMapMarkerAlt className="contact-icon" />
                <div>
                  <span className="contact-info-label">Address</span>
                  <span className="contact-info-value">Brgy. Mamatid, City of Cabuyao, Laguna</span>
                </div>
              </div>
            </div>

            {/* Right — Map */}
            <div className="contact-map">
              <h2 className="contact-map-title">St. Vincent College of Cabuyao Location:</h2>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15469.396756711927!2d121.14849900000002!3d14.232841!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd623f86aed823%3A0x73d3008db710fa11!2sSt.%20Vincent%20College%20Of%20Cabuyao!5e0!3m2!1sen!2sph!4v1771675773017!5m2!1sen!2sph"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SVCC Location"
              ></iframe>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;