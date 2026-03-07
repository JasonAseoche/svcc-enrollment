import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Search, XCircle } from 'lucide-react';
import axios from 'axios';
import '../../components/AdminLayout/CourseApproval.css';

const API_URL = 'http://localhost/svcc-enrollment/manage_courses.php';

const CourseApproval = () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const auditHeaders = {
    'Content-Type': 'application/json',
    'X-User-Email': storedUser?.email || storedUser?.user?.email || '',
    'X-User-Role':  storedUser?.role  || storedUser?.user?.role  || '',
  };
  const [pendingCourses, setPendingCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?action=pending`);
      if (response.data.success) {
        setPendingCourses(response.data.data);
        setFilteredCourses(response.data.data);
      }
    } catch (error) {
      setMessage({ text: 'Failed to fetch pending courses', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = pendingCourses.filter(course =>
        course.course_code.toLowerCase().includes(searchLower) ||
        course.course_name.toLowerCase().includes(searchLower)
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(pendingCourses);
    }
  }, [searchTerm, pendingCourses]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      const response = await axios.post(`${API_URL}?action=approve`, { id }, { headers: auditHeaders });
      
      if (response.data.success) {
        setMessage({ text: 'Course approved successfully', type: 'success' });
        fetchPendingCourses();
      }
    } catch (error) {
      setMessage({ text: 'Failed to approve course', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      const response = await axios.post(`${API_URL}?action=reject`, { id }, { headers: auditHeaders });
      
      if (response.data.success) {
        setMessage({ text: 'Course rejected successfully', type: 'success' });
        fetchPendingCourses();
      }
    } catch (error) {
      setMessage({ text: 'Failed to reject course', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="course-approval-container">
      <div className="course-approval-header-card">
        <div className="course-approval-header-content">
          <h1 className="course-approval-page-title">Course Approval</h1>
          <div className="course-approval-search-container">
            <input
              type="text"
              placeholder="Search pending courses..."
              className="course-approval-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="course-approval-search-icon" size={18} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="course-approval-search-clear"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`course-approval-message ${message.type === 'success' ? 'course-approval-message-success' : 'course-approval-message-error'}`}>
          <AlertCircle size={20} className="course-approval-message-icon" />
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="course-approval-loading">Loading pending courses...</div>
      ) : (
        <div className="course-approval-table-container">
          {filteredCourses.length === 0 ? (
            <div className="course-approval-empty-state">
              <AlertCircle size={48} className="course-approval-empty-icon" />
              <p className="course-approval-empty-text">
                {searchTerm ? 'No courses found matching your search' : 'No pending courses for approval'}
              </p>
            </div>
          ) : (
            <table className="course-approval-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Year Level</th>
                  <th>Sem</th>
                  <th>Units</th>
                  <th>Prerequisite</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <span className="course-approval-code-badge">
                        {course.course_code}
                      </span>
                    </td>
                    <td className="course-approval-course-name">{course.course_name}</td>
                    <td>{course.year_level}</td>
                    <td>{course.term}</td>
                    <td>{course.units_required}</td>
                    <td>{course.prerequisite}</td>
                    <td>
                      <span className="course-approval-status-badge">
                        Pending
                      </span>
                    </td>
                    <td>
                      <div className="course-approval-action-buttons">
                        <button
                          onClick={() => handleApprove(course.id)}
                          className="course-approval-btn course-approval-btn-approve"
                          disabled={actionLoading === course.id}
                          title="Approve course"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(course.id)}
                          className="course-approval-btn course-approval-btn-reject"
                          disabled={actionLoading === course.id}
                          title="Reject course"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseApproval;