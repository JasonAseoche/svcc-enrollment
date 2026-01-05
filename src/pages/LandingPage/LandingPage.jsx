import React, { useState, useEffect } from 'react';
import SVCCLogo from '../../assets/svcc_logo.png';
import Slide1 from '../../assets/slide1.jpg';
import Slide2 from '../../assets/slide2.jpg';
import Slide3 from '../../assets/slide3.jpg';
import Slide4 from '../../assets/slide4.jpg';
import Slide5 from '../../assets/slide5.jpg';
import acct_logo from '../../assets/acct.png';
import coed_logo from '../../assets/coed.png';
import bsit_logo from '../../assets/it.png';
import psych_logo from '../../assets/psych.png';
import tour_logo from '../../assets/tour.png';
import hospitality_logo from '../../assets/hospitality.png';
import crim_logo from '../../assets/crim.png';
import '../../components/LandingPageLayout/LandingPage.css';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCourse, setCurrentCourse] = useState(0);
  const [showAdmissionDropdown, setShowAdmissionDropdown] = useState(false);
  const [showProgramsDropdown, setShowProgramsDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [isMobile, setIsMobile] = useState(false);

  const slides = [Slide1, Slide2, Slide3, Slide4, Slide5];

  const courses = [
    {
      logo: acct_logo,
      title: 'COLLEGE OF BUSINESS AND ACCOUNTING',
      details: 'The Marketing Management program prepares the students to be responsive to the total environment by providing technical skills and competencies in the areas of marketing.'
    },
    {
      logo: coed_logo,
      title: 'COLLEGE OF EDUCATION',
      details: 'This program develops highly motivated and competent teachers specializing in the content and pedagogy for elementary education. Completion of all the academic requirements.'
    },
    {
      logo: bsit_logo,
      title: 'BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY',
      details: 'A comprehensive program designed to equip students with the technical skills and knowledge needed in the ever-evolving field of information technology.'
    },
    {
      logo: psych_logo,
      title: 'BACHELOR OF SCIENCE IN PSYCHOLOGY',
      details: 'Is a (4) four-year degree design to provide initial training on any of the three different fields of career. (Industrial, Educational and Clinical Setting).'
    },
    {
      logo: tour_logo,
      title: 'BACHELOR OF SCIENCE IN TOURISM MANAGEMENT',
      details: 'The Bachelor of Science in Tourism Management (BSTM) is a (4) four-year degree program for people who want to have a career in the field of Tourism and Event Management.'
    },
    {
      logo: hospitality_logo,
      title: 'BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT',
      details: 'The Bachelor of Science in Hospitality Management (BSHM) is a (4) four-year degree program that covers the process of conception, planning, development, human resource and management of the different aspects of the hotel, restaurant, and resort operations.'
    },
    {
      logo: crim_logo,
      title: 'BACHELOR OF SCIENCE IN CRIMINOLOGY',
      details: 'Is a (4) four-year degree program generally offered to students who are interested to pursue a career in law enforcement, correctional administration, security, and crime prevention.'
    }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  useEffect(() => {
    const updateItemsPerSlide = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (mobile) {
        setItemsPerSlide(1);
      } else if (window.innerWidth <= 1024) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(3);
      }
    };

    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, []);

  useEffect(() => {
    setCurrentCourse(0);
  }, [itemsPerSlide]);

  const nextCourse = () => {
    setCurrentCourse((prev) => {
      const maxSlides = courses.length - itemsPerSlide;
      if (prev >= maxSlides) {
        return 0; // Loop back to start when at last position
      }
      return prev + 1;
    });
  };

  const prevCourse = () => {
    setCurrentCourse((prev) => {
      const maxSlides = courses.length - itemsPerSlide;
      if (prev <= 0) {
        return maxSlides; // Loop to end when at first position
      }
      return prev - 1;
    });
  };

  return (
    <div className="landing-page-container">
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
              <a href="#home" className="landing-page-nav-link">Home</a>
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
              <a href="/login" className="landing-page-nav-link">SVCC Portal</a>
            </li>
            <li className="landing-page-nav-item">
              <a href="#contact" className="landing-page-nav-link">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-page-hero">
        <div className="landing-page-slider">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`landing-page-slide ${index === currentSlide ? 'landing-page-slide-active' : ''}`}
              style={{ backgroundImage: `url(${slide})` }}
            ></div>
          ))}
        </div>
        <div className="landing-page-hero-content">
          <img src={SVCCLogo} alt="SVCC Logo" className="landing-page-hero-logo" />
          <div className="landing-page-hero-text">
            <h1 className="landing-page-hero-title">Enroll Now!</h1>
            <p className="landing-page-hero-subtitle">St. Vincent College of Cabuyao</p>
          </div>
        </div>
      </section>

      {/* College Programs Section */}
      <section className="landing-page-programs">
        <h2 className="landing-page-section-title">College Programs We Offer</h2>
        <div className="landing-page-programs-container">
          <button 
            className="landing-page-slider-btn landing-page-slider-btn-prev"
            onClick={prevCourse}
            aria-label="Previous courses"
          >
            &#8249;
          </button>
          
          <div className="landing-page-programs-wrapper">
            <div 
              className="landing-page-programs-track"
              style={{
                transform: `translateX(-${currentCourse * (100 / itemsPerSlide)}%)`
              }}
            >
              {courses.map((course, index) => (
                <div 
                  key={index}
                  className="landing-page-course-card-container"
                  style={{
                    width: `${100 / itemsPerSlide}%`
                  }}
                >
                  <div className="landing-page-course-card">
                    <img 
                      src={course.logo} 
                      alt={course.title} 
                      className="landing-page-course-logo"
                    />
                    <h3 className="landing-page-course-title">{course.title}</h3>
                    <p className="landing-page-course-details">{course.details}</p>
                    <button className="landing-page-course-btn">View Course</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="landing-page-slider-btn landing-page-slider-btn-next"
            onClick={nextCourse}
            aria-label="Next courses"
          >
            &#8250;
          </button>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="landing-page-mission-vision">
        <div className="landing-page-mission">
          <img src={SVCCLogo} alt="SVCC Logo" className="landing-page-mv-logo" />
          <h3 className="landing-page-mv-title">Mission</h3>
          <p className="landing-page-mv-text">
            To be leading privately managed integrated community college in Laguna recognized for its adherence to academic excellence, environment sustainability, responsible citizenship and overall national development by 2030.
          </p>
        </div>
        <div className="landing-page-vision">
          <img src={SVCCLogo} alt="SVCC Logo" className="landing-page-mv-logo" />
          <h3 className="landing-page-mv-title">Vision</h3>
          <p className="landing-page-mv-text">
            To produce critical thinkers and patriotic graduates with entrepreneurial mindset ready for the knowledge-based global economy.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="landing-page-contact" id="contact">
        <div className="landing-page-contact-content">
          <div className="landing-page-contact-info">
            <h3 className="landing-page-contact-title">Contact Information</h3>
            <p className="landing-page-contact-item">
              <strong>Telephone Number:</strong> 049 5311 671
            </p>
            <p className="landing-page-contact-item">
              <strong>Email:</strong> svcccollegeenrollment@gmail.com
            </p>
            <p className="landing-page-contact-item">
              <strong>Facebook:</strong>{' '}
              <a 
                href="https://www.facebook.com/svcccabuyaoofficial?_rdc=1&_rdr#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="landing-page-contact-link"
              >
                SVCC Facebook Page
              </a>
            </p>
            <p className="landing-page-contact-address">
              <strong>Address:</strong> Brgy. Mamatid, City of Cabuyao, Laguna
            </p>
          </div>
          <div className="landing-page-contact-map">
            <h3 className="landing-page-contact-title">St. Vincent College of Cabuyao Location:</h3>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3867.3479430177376!2d121.14597937509915!3d14.232913786211057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd623f86aed823%3A0x73d3008db710fa11!2sSt.%20Vincent%20College%20Of%20Cabuyao!5e0!3m2!1sen!2sph!4v1766936322972!5m2!1sen!2sph" 
              width="100%" 
              height="180" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="SVCC Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;