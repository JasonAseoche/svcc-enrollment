import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SVCCLogo from '../../assets/svcc_logo.png';
import subpageBg from '../../assets/subpage-bg.png';
import '../../components/LandingPageLayout/LandingPage.css';
import './About.css';

const About = () => {
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
              <a href="contact" className="landing-page-nav-link">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Banner */}
      <div
        className="about-banner"
        style={{ backgroundImage: `url(${subpageBg})` }}
      >
        <div className="about-banner-overlay">
          <div className="about-banner-content">
            <h1 className="about-banner-title">About SVCC</h1>
            <p className="about-banner-subtitle">
              Learn more about St. Vincent College of Cabuyao
            </p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <section className="about-section">
        <div className="about-container">

          {/* Breadcrumb */}
          <div className="about-breadcrumb">
            <Link to="/" className="about-breadcrumb-link">Home</Link>
            <span className="about-breadcrumb-sep">/</span>
            <span className="about-breadcrumb-current">About SVCC</span>
          </div>

          {/* SVCC Journey */}
          <div className="about-card">
            <h2 className="about-card-title">SVCC Journey</h2>
            <p className="about-text">Founded by social entrepreneurs and academics <strong>Simeon</strong> and <strong>Marina Chavez</strong> in <strong>1999</strong>, the St. Vincent College of Cabuyao, Inc. (SVCC) owed its beginnings to a group of passionate educators who were displaced from work due to the closing of another school in a nearby municipality. This group of veteran teachers knew of the couples' reputation as successful and altruistic entrepreneurs who are highly respected in their community. These displaced teachers approached the Chavezes to convince them to get into the business of education.</p>
            <p className="about-text">It did not take a lot of convincing as the Chavez family immediately agreed and saw the proposition as another opportunity to help the community and these teachers who needed work. Being both from families of humble backgrounds, Simeon and Marina understood how an education is a source of one's heightened sense of dignity and a ticket out of poverty. They wanted to provide their kababayans access to quality private education without the prohibitive tuition fees.</p>
            <p className="about-text">From a total population of 110 students on its first year, SVCC has established itself as a reputable educational institution in the first district of Laguna province. Twenty years after it opened its doors to Cabueño children eager to learn, it now has a total population of almost 7,000 and it continues to grow annually.</p>
            <p className="about-text">Set in a 3-hectare property, the campus is popular for its very invigorating lush landscaping hardly found in other schools in the area. SVCC continues to expand its physical area to ensure the comfort and safety of its ever growing population, while ensuring an environment highly conducive to creativity and learning.</p>
          </div>

          {/* Mission */}
          <div className="about-card">
            <h2 className="about-card-title">Mission</h2>
            <p className="about-text">To be leading privately managed integrated community college in Laguna recognized for its adherence to academic excellence, environment sustainability, responsible citizenship and overall national development by 2030.</p>
          </div>

          {/* Vision */}
          <div className="about-card">
            <h2 className="about-card-title">Vision</h2>
            <p className="about-text">To produce critical thinkers and patriotic graduates with entrepreneurial mindset ready for the knowledge-based global economy.</p>
          </div>

          {/* Philosophy */}
          <div className="about-card">
            <h2 className="about-card-title">PHILOSOPHY</h2>
            <p className="about-text">We believe in contributing to the levelling of the playing field by providing access to affordable but quality and relevant education. Our founders have ingrained in the fiber of our institution that we are not in the business of building an enterprise, but rather in the the ministry of building lives.</p>
            <p className="about-text">We believe that the whole is greater than the individual parts. Although we recognize and celebrate outstanding individual inputs, we know that properly guided synergistic teamwork, anchored on noble and honorable goals, will produce even greater results. Thus, we adhere to strong collaborative, mutually reinforcing, efficient, and responsible working systems.</p>
            <p className="about-text">We promote the culture of resiliency by recognizing, understanding, and appropriately responding to challenges posed by constant and disruptive changes in the institutional environment and develop appropriate and calibrated responses consistent with the Institution's Vision, Mission, Institutional Philosophy and Values.</p>
          </div>

          {/* Core Values */}
          <div className="about-card">
            <h2 className="about-card-title">CORE VALUES</h2>
            <p className="about-text">Embedded in our seal are the core values we aspire for and which guide our institutional culture in every aspect. These are the bedrock of our institution and we shall persevere to internalize and realize the meanings of these values.</p>
            <p className="about-text"><span className="about-value-latin">VERITAS</span> - TRUTH: : It guides us in our every action, thought, and word. Honesty and authenticity empower and promote integrity. We shall always seek the truth and ensure that integrity be our institutional compass.</p>
            <p className="about-text"><span className="about-value-latin">SCIENTIA</span> - KNOWLEDGE: : Our core mandate and commitment to provide the means for all our constituents to acquire this in order to empower each one and become successful lifelong learners.</p>
            <p className="about-text"><span className="about-value-latin">OFFICIUM</span> - SERVICE or DUTY: : We commit ourselves to serve our constituents by providing a just environment for learning, growth and development. This is our duty to our community and commitment to nation-building.</p>
          </div>

          {/* General Objectives */}
          <div className="about-card">
            <h2 className="about-card-title">GENERAL OBJECTIVES</h2>
            <p className="about-text">To impart, cultivate and promote academic discipline, celebrate cultural and religious diversity, as well as produce broad-based, creative, entrepreneurial, and patriotic leaders for the knowledge-based global economy.</p>
            <p className="about-text">To commit to an interactive, participative and technologically enabled learning environment.</p>
            <p className="about-text">To provide a rewarding and challenging environment for faculty, staff and students to foster and sustain a passion for excellence.</p>
            <p className="about-text">To establish and develop an atmosphere of intellectual stimulation and managed academic freedom that will enhance the capacity and potential of the students for them to excel in their fields of expertise and areas of interest.</p>
            <p className="about-text">To provide technologically-supported unique opportunities that shall contribute to the optimization of potentials and capacities of every learner.</p>
            <p className="about-text">To contribute to the development of responsible and patriotic citizens who value freedom, and has the capacity to overcome obstacles and solve problems for the common and general welfare of humanity.</p>
          </div>

          {/* Tertiary Education Objectives */}
          <div className="about-card">
            <h2 className="about-card-title">TERTIARY EDUCATION OBJECTIVES</h2>
            <p className="about-text">St. Vincent College of Cabuyao aims to produce graduates who are:</p>
            <p className="about-text">Holistically developed and socio-culturally aware;</p>
            <p className="about-text">Professionally competent, imbued with patriotic values which aims to develop the Filipino as a dynamic human being in the broad spectrum of educational, professional and personal goals;</p>
            <p className="about-text">Spiritually impelled by a sense of mission bound by a strong and living faith dictated by his chosen Faith to serve and transform the society;</p>
            <p className="about-text">Committed citizens aware of their roles, capable of participating actively in the task of nation building to attain the best quality of life for themselves and their countrymen;</p>
            <p className="about-text">Able to act as effective agents towards the building of a more just and humane world.</p>
          </div>

        </div>
      </section>
    </>
  );
};

export default About;