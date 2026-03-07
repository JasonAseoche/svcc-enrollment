import React, { useState, useEffect } from 'react';
import {
  RiBookOpenLine,
  RiLayoutGridLine,
  RiUserLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseCircleLine,
  RiCalendarLine,
  RiAlertLine,
} from 'react-icons/ri';
import '../../components/HeadLayout/DashboardHead.css';

const API_URL = 'http://localhost/svcc-enrollment/dashboard_head.php';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className={`dh-stat-card dh-accent-${accent}`}>
    <div className="dh-stat-icon-wrap">
      <Icon size={20} />
    </div>
    <div className="dh-stat-body">
      <span className="dh-stat-value">{value ?? '—'}</span>
      <span className="dh-stat-label">{label}</span>
    </div>
  </div>
);

const SectionRow = ({ section }) => (
  <tr className="dh-table-row">
    <td className="dh-td dh-td-badge">
      <span className="dh-section-badge">{section.section}</span>
    </td>
    <td className="dh-td">{section.year_level}</td>
    <td className="dh-td">{section.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</td>
    <td className="dh-td dh-td-center">{section.course_count}</td>
    <td className="dh-td dh-td-center">
      {section.unscheduled_count > 0 ? (
        <span className="dh-badge dh-badge-warn">{section.unscheduled_count} unscheduled</span>
      ) : (
        <span className="dh-badge dh-badge-ok">Complete</span>
      )}
    </td>
  </tr>
);

const EvalRow = ({ item }) => (
  <tr className="dh-table-row">
    <td className="dh-td">{item.student_number}</td>
    <td className="dh-td">{item.student_name}</td>
    <td className="dh-td">{item.section}</td>
    <td className="dh-td dh-td-center">
      {item.gwa ? parseFloat(item.gwa).toFixed(2) : '—'}
    </td>
    <td className="dh-td dh-td-center">
      <span className={`dh-badge ${item.eval_status === 'pending' ? 'dh-badge-warn' : 'dh-badge-ok'}`}>
        {item.eval_status}
      </span>
    </td>
  </tr>
);

const DashboardHead = () => {
  const [stats, setStats] = useState(null);
  const [sections, setSections] = useState([]);
  const [pendingEvals, setPendingEvals] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}?action=summary`);
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setSections(data.sections || []);
          setPendingEvals(data.pending_evaluations || []);
          setPendingCourses(data.pending_courses || []);
        } else {
          setError(data.message || 'Failed to load dashboard data.');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="dh-root">
        <div className="dh-loading">
          <div className="dh-spinner" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dh-root">
        <div className="dh-error">
          <RiAlertLine size={22} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dh-root">
      {/* Header */}
      <div className="dh-page-header">
        <div>
          <h1 className="dh-page-title">Dashboard</h1>
          <p className="dh-page-subtitle">Bachelor of Science in Information Technology</p>
        </div>
        <div className="dh-date-chip">
          <RiCalendarLine size={15} />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dh-stats-grid">
        <StatCard icon={RiBookOpenLine}        label="Total Courses"         value={stats?.total_courses}         accent="blue"   />
        <StatCard icon={RiCheckboxCircleLine}  label="Approved Courses"      value={stats?.approved_courses}      accent="green"  />
        <StatCard icon={RiTimeLine}            label="Pending Approval"      value={stats?.pending_courses}       accent="amber"  />
        <StatCard icon={RiLayoutGridLine}      label="Total Sections"        value={stats?.total_sections}        accent="indigo" />
        <StatCard icon={RiUserLine}            label="Enrolled Students"     value={stats?.total_students}        accent="teal"   />
        <StatCard icon={RiCloseCircleLine}     label="Pending Evaluations"   value={stats?.pending_evaluations}   accent="rose"   />
      </div>

      {/* Two-column panels */}
      <div className="dh-panels">
        {/* Sections Overview */}
        <div className="dh-panel">
          <div className="dh-panel-header">
            <span className="dh-panel-title">Sections Overview</span>
            <span className="dh-panel-count">{sections.length} sections</span>
          </div>
          <div className="dh-table-wrap">
            {sections.length === 0 ? (
              <p className="dh-empty">No sections found.</p>
            ) : (
              <table className="dh-table">
                <thead>
                  <tr className="dh-thead-row">
                    <th className="dh-th">Section</th>
                    <th className="dh-th">Year</th>
                    <th className="dh-th">Term</th>
                    <th className="dh-th dh-th-center">Courses</th>
                    <th className="dh-th dh-th-center">Schedule</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((s) => <SectionRow key={s.id} section={s} />)}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="dh-right-col">
          {/* Pending Evaluations */}
          <div className="dh-panel">
            <div className="dh-panel-header">
              <span className="dh-panel-title">Pending Evaluations</span>
              {pendingEvals.length > 0 && (
                <span className="dh-badge dh-badge-warn">{pendingEvals.length}</span>
              )}
            </div>
            <div className="dh-table-wrap">
              {pendingEvals.length === 0 ? (
                <p className="dh-empty">No pending evaluations.</p>
              ) : (
                <table className="dh-table">
                  <thead>
                    <tr className="dh-thead-row">
                      <th className="dh-th">Student No.</th>
                      <th className="dh-th">Name</th>
                      <th className="dh-th">Section</th>
                      <th className="dh-th dh-th-center">GWA</th>
                      <th className="dh-th dh-th-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingEvals.map((e) => <EvalRow key={e.application_id} item={e} />)}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Pending Course Approvals */}
          <div className="dh-panel">
            <div className="dh-panel-header">
              <span className="dh-panel-title">Courses Awaiting Approval</span>
              {pendingCourses.length > 0 && (
                <span className="dh-badge dh-badge-warn">{pendingCourses.length}</span>
              )}
            </div>
            <div className="dh-table-wrap">
              {pendingCourses.length === 0 ? (
                <p className="dh-empty">No courses pending approval.</p>
              ) : (
                <table className="dh-table">
                  <thead>
                    <tr className="dh-thead-row">
                      <th className="dh-th">Code</th>
                      <th className="dh-th">Course Name</th>
                      <th className="dh-th dh-th-center">Units</th>
                      <th className="dh-th dh-th-center">Year</th>
                      <th className="dh-th dh-th-center">Term</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCourses.map((c) => (
                      <tr key={c.id} className="dh-table-row">
                        <td className="dh-td dh-td-badge">
                          <span className="dh-course-badge">{c.course_code}</span>
                        </td>
                        <td className="dh-td">{c.course_name}</td>
                        <td className="dh-td dh-td-center">{c.units_required}</td>
                        <td className="dh-td dh-td-center">{c.year_level}</td>
                        <td className="dh-td dh-td-center">{c.term.replace('1st Term','1st Sem').replace('2nd Term','2nd Sem')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHead;