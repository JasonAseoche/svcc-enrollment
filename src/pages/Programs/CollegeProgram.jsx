import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SVCCLogo from '../../assets/svcc_logo.png';
import subpageBg from '../../assets/subpage-bg.png';
import acct_logo from '../../assets/acct.png';
import coed_logo from '../../assets/coed.png';
import bsit_logo from '../../assets/it.png';
import psych_logo from '../../assets/psych.png';
import tour_logo from '../../assets/tour.png';
import hospitality_logo from '../../assets/hospitality.png';
import crim_logo from '../../assets/crim.png';
import '../../components/LandingPageLayout/LandingPage.css';
import './CollegeProgram.css';

const colleges = [
  {
    id: 'business',
    logo: acct_logo,
    shortName: 'Business & Accounting',
    fullName: 'College of Business and Accounting',
    programs: [
      {
        title: 'Bachelor of Science in Business Administration Major in Marketing Management',
        description: `This is the program that provides general accounting education to students wanting to pursue a professional career in Accountancy in general and in Public Accounting in particular. Further, this is the program that complies with the latest competency framework for professional accountants issued by the International Federation of Accountants (IFAC) through their International Education Standards. Thus, this qualifies the graduate of this program to take assessments leading to certifications in Accountancy given by the Professional Regulatory Commission — Board of Accountancy (PRC-BOA) and other global professional Accountancy organizations.

As a field of study, Accountancy is a profession that involves providing assurance and audit services for statutory financial reporting, tax-related services, management advisory services partnering in management decision-making, devising planning and performance and control systems, and providing expertise in financial reporting and control to assist various stakeholders in making decisions.

The strategic relevance of Accountancy is represented by its ability to support the various stakeholders, e.g., regulatory bodies, potential investors, creditors, management and employees, in taking strategic and operating decisions through the presentation and analysis of financial data and information arising from business transactions.`,
      },
      {
        title: 'Bachelor of Science in Accountancy',
        description: `This is the program that provides general accounting education to students wanting to pursue a professional career in Accountancy in general and in Public Accounting in particular. Further, this is the program that complies with the latest competency framework for professional accountants issued by the International Federation of Accountants (IFAC) through their International Education Standards. Thus, this qualifies the graduate of this program to take assessments leading to certifications in Accountancy given by the Professional Regulatory Commission — Board of Accountancy (PRC-BOA) and other global professional Accountancy organizations.

As a field of study, Accountancy is a profession that involves providing assurance and audit services for statutory financial reporting, tax-related services, management advisory services partnering in management decision-making, devising planning and performance and control systems, and providing expertise in financial reporting and control to assist various stakeholders in making decisions.

The strategic relevance of Accountancy is represented by its ability to support the various stakeholders, e.g., regulatory bodies, potential investors, creditors, management and employees, in taking strategic and operating decisions through the presentation and analysis of financial data and information arising from business transactions.`,
      },
      {
        title: 'Bachelor of Science in Accountancy Technology',
        description: `This is the program that provides general accounting education to students wanting to pursue a professional career in Accounting Information System. Further, this is the program that complies with the latest competency framework for professional accountants issued by the International Federation of Accountants (IFAC) thru their International Education Standards. Thus, this qualifies the graduate of this program to take assessments leading to certifications in Accounting Information System given by global professional Accounting Information System organizations.

As a field of study, Accounting Information System is a profession that combines knowledge in business, accounting and computer systems. It involves partnering with management operations and decision-making, by coordinating the information technology activities, providing expertise in choosing the best software or designing and maintaining the overall information system, assessing the integrity of systems, assessing the inefficiencies of a company's system and recommending improvements to assist management in the formulation and implementation of an organization's strategy.

By working across functions, Accounting Information System professionals understand the links between operational activity, financial resource generation and consumption, and value generation and preservation. They perform a vital role in supporting organizational performance through an effective information system.`,
      },
    ],
  },
  {
    id: 'education',
    logo: coed_logo,
    shortName: 'College of Education',
    fullName: 'College of Education',
    programs: [
      {
        title: 'Bachelor in Elementary Education (BEED)',
        description: `The Bachelor of Elementary Education (BEED) is a four-year undergraduate teacher education program designed to equip learners with adequate and relevant competencies to teach in the elementary level. This program develops highly motivated and competent teachers specializing in the content and pedagogy for elementary education. Completion of all the academic requirements, will qualify the graduates to practice the teaching profession in the elementary level.`,
      },
      {
        title: 'Bachelor in Secondary Education',
        description: `This program develops highly motivated and competent teachers specializing in the content and pedagogy for secondary education. Completion of all the academic requirements, will qualify the graduates to practice the teaching profession in the secondary level.`,
      },
    ],
  },
  {
    id: 'it',
    logo: bsit_logo,
    shortName: 'Information Technology',
    fullName: 'Bachelor of Science in Information Technology',
    programs: [
      {
        title: 'Bachelor of Science in Information Technology',
        description: `Bachelor of Science in Information Technology is a course that is design to combine the benefits of a traditional college education and hands-on training. Students will not only become technically competent, but will also learn to write well-organized and clear memos and reports. This course integrates technical skills with communication skills. It prepares the students to be IT professionals, who will be able to perform installations, operation, development, maintenance, and administration of computer applications.

The course program equips students with the basic ability to conceptualize, design, and implement software application and etc. The program prepares graduates to address various user needs involving the selection, development, application, integration and management of computing technologies within the organization. Primary Job roles include the following: Organizational Process Analyst, Data Analyst, Solutions Specialist, and Systems Analyst.`,
      },
    ],
  },
  {
    id: 'psychology',
    logo: psych_logo,
    shortName: 'Psychology',
    fullName: 'Bachelor of Science in Psychology',
    programs: [
      {
        title: 'Bachelor of Science in Psychology',
        description: `Is a (4) four-year degree design to provide initial training on any of the three different fields of career. (Industrial, Educational and Clinical Setting). The curriculum provides an overview of the concepts in Psychology and involves basic and applied research and interventions for the development of well-functioning individual. Furthermore, they provide preparation for graduate studies in Psychology as well as further studies in other professions such as medicine, law and business management. It offers an in-house review for those students who are willing to take the Licensure Examination for Psychometrician.

Graduates of the BA/BS Psychology program could be licensed psychometricians or work in the academe, in HR, research, graduates may also pursue careers in medicine, law, management, etc. With further specialized training, graduates of this program may pursue specializations in Psychology such as clinical, counseling, developmental, educational, social, industrial/organizational, etc.`,
      },
    ],
  },
  {
    id: 'tourism',
    logo: tour_logo,
    shortName: 'Tourism Management',
    fullName: 'Bachelor of Science in Tourism Management',
    programs: [
      {
        title: 'Bachelor of Science in Tourism Management (BSTM)',
        description: `The Bachelor of Science in Tourism Management (BSTM) is a (4) four-year degree program for people who want to have a career in the field of Tourism and Event Management. This course leads to expertise in the management of tour-operating agencies, as well as other jobs in the tourism and hospitality sector.

The curriculum also includes operational competencies, event management classes, investment, and market study and this program aimed at providing students with the in-depth knowledge about tourism and hospitality trends. It involves both practical and academic study of tourism business, its operations, the behavior of tourists, trends in the tourism industry and its dynamics.`,
      },
    ],
  },
  {
    id: 'hospitality',
    logo: hospitality_logo,
    shortName: 'Hospitality Management',
    fullName: 'Bachelor of Science in Hospitality Management',
    programs: [
      {
        title: 'Bachelor of Science in Hospitality Management (BSHM)',
        description: `The Bachelor of Science in Hospitality Management (BSHM) is a (4) four-year degree program that covers the process of conception, planning, development, human resource and management of the different aspects of the hotel, restaurant, and resort operations. The program provides students with technical skills, as well as knowledge in marketing, finance, and budgeting, staffing and other fields of business. The program also aims to teach entrepreneurship skills.`,
      },
    ],
  },
  {
    id: 'criminology',
    logo: crim_logo,
    shortName: 'Criminology',
    fullName: 'Bachelor of Science in Criminology',
    programs: [
      {
        title: 'Bachelor of Science in Criminology',
        description: `Is a (4) four-year degree program generally offered to students who are interested to pursue a career in law enforcement, correctional administration, security, and crime prevention. Students in this program will be able to learn different practices and theories of laws related to criminal behavior which leads to effective law enforcement. A graduate of this program is required to take and pass the Criminologist Licensure Examination to be considered a Criminologist.

A graduate of B.S Criminology is prepared for careers in the following fields: Criminological Research, Scientific Crime Detection and Investigation, Crime Prevention, Law Enforcement, Correctional Administration, Public safety, Security Management, Criminalistics and in Academe.`,
      },
    ],
  },
];

const CollegeProgram = () => {
  const [showAdmissionDropdown, setShowAdmissionDropdown] = useState(false);
  const [showProgramsDropdown, setShowProgramsDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  const [selectedCollegeIndex, setSelectedCollegeIndex] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState(colleges[0].programs[0]);

  const selectedCollege = colleges[selectedCollegeIndex];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCollegeSelect = (index) => {
    setSelectedCollegeIndex(index);
    setSelectedProgram(colleges[index].programs[0]);
  };

  const prevCollege = () => {
    const newIndex = (selectedCollegeIndex - 1 + colleges.length) % colleges.length;
    handleCollegeSelect(newIndex);
  };

  const nextCollege = () => {
    const newIndex = (selectedCollegeIndex + 1) % colleges.length;
    handleCollegeSelect(newIndex);
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
              <a href="contact" className="landing-page-nav-link">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Banner */}
      <div
        className="svcc-cp__banner"
        style={{ backgroundImage: `url(${subpageBg})` }}
      >
        <div className="svcc-cp__banner-overlay">
          <div className="svcc-cp__banner-content">
            <h1 className="svcc-cp__banner-title">College Programs</h1>
            <p className="svcc-cp__banner-subtitle">
              Explore the programs offered at St. Vincent College of Cabuyao
            </p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <section className="svcc-cp__section">
        <div className="svcc-cp__container">

          {/* Breadcrumb */}
          <div className="svcc-cp__breadcrumb">
            <Link to="/" className="svcc-cp__breadcrumb-link">Home</Link>
            <span className="svcc-cp__breadcrumb-sep">/</span>
            <span className="svcc-cp__breadcrumb-link">Programs</span>
            <span className="svcc-cp__breadcrumb-sep">/</span>
            <span className="svcc-cp__breadcrumb-current">College Programs</span>
          </div>

          {/* MOBILE: Card Slider */}
          {isMobile && (
            <div className="svcc-cp__mobile-slider">
              <button className="svcc-cp__mobile-nav-btn" onClick={prevCollege}>&#8249;</button>
              <div className="svcc-cp__mobile-card">
                <img
                  src={selectedCollege.logo}
                  alt={selectedCollege.shortName}
                  className="svcc-cp__mobile-card-logo"
                />
                <div className="svcc-cp__mobile-card-name">{selectedCollege.fullName}</div>
                <div className="svcc-cp__mobile-card-counter">
                  {selectedCollegeIndex + 1} / {colleges.length}
                </div>
              </div>
              <button className="svcc-cp__mobile-nav-btn" onClick={nextCollege}>&#8250;</button>
            </div>
          )}

          {/* Explorer Layout */}
          <div className="svcc-cp__explorer">

            {/* Left Sidebar — Desktop only */}
            {!isMobile && (
              <aside className="svcc-cp__sidebar">
                <div className="svcc-cp__sidebar-header">
                  <div className="svcc-cp__sidebar-header-bar"></div>
                  <h2 className="svcc-cp__sidebar-title">Colleges</h2>
                </div>
                <ul className="svcc-cp__college-list">
                  {colleges.map((college, index) => (
                    <li key={college.id}>
                      <button
                        className={`svcc-cp__college-btn ${selectedCollegeIndex === index ? 'svcc-cp__college-btn--active' : ''}`}
                        onClick={() => handleCollegeSelect(index)}
                      >
                        <img
                          src={college.logo}
                          alt={college.shortName}
                          className="svcc-cp__college-btn-logo"
                        />
                        <span className="svcc-cp__college-btn-label">{college.shortName}</span>
                        <span className="svcc-cp__college-btn-arrow">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {/* Right Panel — Detail View */}
            <div className="svcc-cp__detail-panel">

              {/* College Header */}
              <div className="svcc-cp__detail-college-header">
                <img
                  src={selectedCollege.logo}
                  alt={selectedCollege.fullName}
                  className="svcc-cp__detail-college-logo"
                />
                <div>
                  <p className="svcc-cp__detail-college-label">College / Department</p>
                  <h2 className="svcc-cp__detail-college-name">{selectedCollege.fullName}</h2>
                </div>
              </div>

              {/* Program Tabs (if multiple programs) */}
              {selectedCollege.programs.length > 1 && (
                <div className="svcc-cp__program-tabs">
                  {selectedCollege.programs.map((prog, idx) => (
                    <button
                      key={idx}
                      className={`svcc-cp__program-tab ${selectedProgram.title === prog.title ? 'svcc-cp__program-tab--active' : ''}`}
                      onClick={() => setSelectedProgram(prog)}
                    >
                      {prog.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Program Detail Card */}
              <div className="svcc-cp__program-card">
                <div className="svcc-cp__program-card-header">
                  <div className="svcc-cp__program-card-header-bar"></div>
                  <h3 className="svcc-cp__program-card-title">{selectedProgram.title}</h3>
                </div>
                <div className="svcc-cp__program-description">
                  {selectedProgram.description.split('\n\n').map((para, i) => (
                    <p key={i} className="svcc-cp__program-paragraph">{para.trim()}</p>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default CollegeProgram;