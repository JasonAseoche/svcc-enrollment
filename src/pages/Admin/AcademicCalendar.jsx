import React, { useState } from 'react';
import '../../components/AdminLayout/AcademicCalendar.css';

const AcademicCalendar = () => {
  // Sample data - replace with actual API calls
  const [academicYears, setAcademicYears] = useState([
    {
      id: 1,
      year: '2024-2025',
      terms: [
        { id: 1, name: '1st Term', startDate: '2024-08-01', endDate: '2024-12-15', status: 'ended' },
        { id: 2, name: '2nd Term', startDate: '2025-01-06', endDate: '2025-05-30', status: 'active' }
      ],
      status: 'active'
    },
    {
      id: 2,
      year: '2023-2024',
      terms: [
        { id: 3, name: '1st Term', startDate: '2023-08-01', endDate: '2023-12-15', status: 'ended' },
        { id: 4, name: '2nd Term', startDate: '2024-01-08', endDate: '2024-05-31', status: 'ended' },
        { id: 5, name: 'Summer', startDate: '2024-06-01', endDate: '2024-07-31', status: 'ended' }
      ],
      status: 'ended'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'year' or 'term'
  const [selectedYear, setSelectedYear] = useState(null);
  const [formData, setFormData] = useState({
    year: '',
    termName: '',
    startDate: '',
    endDate: ''
  });

  const handleOpenModal = (type, year = null) => {
    setModalType(type);
    setSelectedYear(year);
    setFormData({
      year: '',
      termName: '',
      startDate: '',
      endDate: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedYear(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'year') {
      // Add new academic year
      const newYear = {
        id: Date.now(),
        year: formData.year,
        terms: [],
        status: 'active'
      };
      
      // Set all other years to 'ended' when adding new year
      setAcademicYears(prev => [
        newYear,
        ...prev.map(y => ({ ...y, status: 'ended' }))
      ]);
    } else if (modalType === 'term') {
      // Add new term to selected year
      const newTerm = {
        id: Date.now(),
        name: formData.termName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'active'
      };
      
      setAcademicYears(prev => prev.map(year => {
        if (year.id === selectedYear.id) {
          return {
            ...year,
            terms: [
              ...year.terms.map(t => ({ ...t, status: 'ended' })),
              newTerm
            ]
          };
        }
        return year;
      }));
    }
    
    handleCloseModal();
  };

  const handleEndTerm = (yearId, termId) => {
    if (window.confirm('Are you sure you want to end this term?')) {
      setAcademicYears(prev => prev.map(year => {
        if (year.id === yearId) {
          return {
            ...year,
            terms: year.terms.map(term => 
              term.id === termId ? { ...term, status: 'ended' } : term
            )
          };
        }
        return year;
      }));
    }
  };

  const handleEndYear = (yearId) => {
    if (window.confirm('Are you sure you want to end this academic year? All terms will be ended.')) {
      setAcademicYears(prev => prev.map(year => {
        if (year.id === yearId) {
          return {
            ...year,
            status: 'ended',
            terms: year.terms.map(term => ({ ...term, status: 'ended' }))
          };
        }
        return year;
      }));
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="svcc-acad-calendar-container">
      <div className="svcc-acad-calendar-header">
        <h1>Academic Calendar</h1>
        <button 
          className="svcc-acad-calendar-btn-primary"
          onClick={() => handleOpenModal('year')}
        >
          <svg className="svcc-acad-calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Academic Year
        </button>
      </div>

      <div className="svcc-acad-calendar-content">
        {academicYears.map(year => (
          <div key={year.id} className="svcc-acad-calendar-year-card">
            <div className="svcc-acad-calendar-year-header">
              <div className="svcc-acad-calendar-year-info">
                <h2>{year.year}</h2>
                <span className={`svcc-acad-calendar-badge ${year.status === 'active' ? 'svcc-acad-calendar-badge-active' : 'svcc-acad-calendar-badge-ended'}`}>
                  {year.status === 'active' ? 'Active' : 'Ended'}
                </span>
              </div>
              <div className="svcc-acad-calendar-year-actions">
                {year.status === 'active' && (
                  <>
                    <button 
                      className="svcc-acad-calendar-btn-secondary"
                      onClick={() => handleOpenModal('term', year)}
                    >
                      <svg className="svcc-acad-calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Term
                    </button>
                    <button 
                      className="svcc-acad-calendar-btn-danger"
                      onClick={() => handleEndYear(year.id)}
                    >
                      End Year
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="svcc-acad-calendar-terms-grid">
              {year.terms.length === 0 ? (
                <div className="svcc-acad-calendar-empty">
                  <svg className="svcc-acad-calendar-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No terms added yet</p>
                </div>
              ) : (
                year.terms.map(term => (
                  <div key={term.id} className="svcc-acad-calendar-term-card">
                    <div className="svcc-acad-calendar-term-header">
                      <h3>{term.name}</h3>
                      <span className={`svcc-acad-calendar-badge ${term.status === 'active' ? 'svcc-acad-calendar-badge-active' : 'svcc-acad-calendar-badge-ended'}`}>
                        {term.status === 'active' ? 'Active' : 'Ended'}
                      </span>
                    </div>
                    <div className="svcc-acad-calendar-term-dates">
                      <div className="svcc-acad-calendar-date-item">
                        <span className="svcc-acad-calendar-date-label">Start:</span>
                        <span className="svcc-acad-calendar-date-value">{formatDate(term.startDate)}</span>
                      </div>
                      <div className="svcc-acad-calendar-date-item">
                        <span className="svcc-acad-calendar-date-label">End:</span>
                        <span className="svcc-acad-calendar-date-value">{formatDate(term.endDate)}</span>
                      </div>
                    </div>
                    {term.status === 'active' && (
                      <button 
                        className="svcc-acad-calendar-btn-end-term"
                        onClick={() => handleEndTerm(year.id, term.id)}
                      >
                        End Term
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="svcc-acad-calendar-modal-overlay" onClick={handleCloseModal}>
          <div className="svcc-acad-calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="svcc-acad-calendar-modal-header">
              <h2>{modalType === 'year' ? 'Add New Academic Year' : 'Add New Term'}</h2>
              <button className="svcc-acad-calendar-modal-close" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="svcc-acad-calendar-modal-form">
              {modalType === 'year' ? (
                <div className="svcc-acad-calendar-form-group">
                  <label htmlFor="year">Academic Year</label>
                  <input
                    type="text"
                    id="year"
                    name="year"
                    placeholder="e.g., 2025-2026"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                  />
                  <small>Format: YYYY-YYYY</small>
                </div>
              ) : (
                <>
                  <div className="svcc-acad-calendar-form-group">
                    <label htmlFor="termName">Term Name</label>
                    <select
                      id="termName"
                      name="termName"
                      value={formData.termName}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Term</option>
                      <option value="1st Term">1st Term</option>
                      <option value="2nd Term">2nd Term</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                  
                  <div className="svcc-acad-calendar-form-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="svcc-acad-calendar-form-group">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="svcc-acad-calendar-modal-actions">
                <button type="button" className="svcc-acad-calendar-btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="svcc-acad-calendar-btn-submit">
                  {modalType === 'year' ? 'Create Year' : 'Add Term'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;