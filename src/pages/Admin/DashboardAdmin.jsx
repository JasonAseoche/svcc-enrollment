import React, { useState, useEffect } from 'react';
import '../../components/AdminLayout/DashboardAdmin.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  FiUsers,
  FiClock,
  FiUserCheck,
  FiActivity,
  FiBookOpen
} from 'react-icons/fi';
import axios from 'axios';

const DashboardAdmin = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = 'http://localhost/svcc-enrollment/dashboard_admin.php';
  
  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(API_URL);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const response = await axios.get('http://localhost/svcc-enrollment/dashboard_admin.php?action=recent_activities');
      if (response.data.success) {
        setRecentActivities(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Generate avatar with initials
  const getAvatarInitials = (name) => {
    const initials = name.split(' ').map(word => word[0]).join('').toUpperCase();
    return initials;
  };
  
  // Generate random color for avatar
  const getAvatarColor = (index) => {
    const colors = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c'];
    return colors[index % colors.length];
  };
  
  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-spinner1">Loading dashboard...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard-content">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  if (!dashboardData) {
    return (
      <div className="dashboard-content">
        <div className="error-message">No data available</div>
      </div>
    );
  }
  
  // Calculate total users
  const totalUsers = dashboardData.students + dashboardData.instructors + 
                     dashboardData.admins + dashboardData.programHeads;
  
  // Prepare summary cards data
  const summaryCardsData = [
    { 
      title: 'Total Students', 
      value: dashboardData.students.toLocaleString(), 
      icon: <FiUsers />, 
      color: '#3498db', 
      showIncrease: false 
    },
    { 
      title: 'Total Instructors', 
      value: dashboardData.instructors.toString(), 
      icon: <FiBookOpen />, 
      color: '#2ecc71', 
      showIncrease: false
    },
    { 
      title: 'Program Heads', 
      value: dashboardData.programHeads.toString(), 
      icon: <FiUserCheck />, 
      color: '#9b59b6', 
      showIncrease: false 
    },
    { 
      title: 'Administrators', 
      value: dashboardData.admins.toString(), 
      icon: <FiActivity />, 
      color: '#e74c3c', 
      showIncrease: false
    }
  ];

  // Prepare user distribution data for pie chart
  const userDistribution = [
    { name: 'Students', value: dashboardData.students },
    { name: 'Instructors', value: dashboardData.instructors },
    { name: 'Heads', value: dashboardData.programHeads },
    { name: 'Admins', value: dashboardData.admins }
  ];

  // Prepare role overview data for bar chart
  const roleOverview = [
    { name: 'Students', value: dashboardData.students },
    { name: 'Instructors', value: dashboardData.instructors },
    { name: 'Program Heads', value: dashboardData.programHeads },
    { name: 'Admins', value: dashboardData.admins }
  ];

  // Dummy activity trend data (you can replace with real data later)
  const activityTrend = [
    { name: 'Mon', enrollments: 12, logins: 45 },
    { name: 'Tue', enrollments: 19, logins: 52 },
    { name: 'Wed', enrollments: 15, logins: 48 },
    { name: 'Thu', enrollments: 22, logins: 61 },
    { name: 'Fri', enrollments: 18, logins: 55 },
    { name: 'Sat', enrollments: 8, logins: 28 },
    { name: 'Sun', enrollments: 5, logins: 20 }
  ];

  return (
    <div className="dashboard-content">
      {/* Summary Cards */}
      <div className="summary-cards">
        {summaryCardsData.map((card, index) => (
          <div className="summary-card" key={index}>
            <div className="card-icon" style={{ backgroundColor: card.color }}>
              {card.icon}
            </div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <div className="card-value">{card.value}</div>
              {card.subtitle && (
                <div className="card-subtitle">{card.subtitle}</div>
              )}
            </div>
          </div>
        ))}
      </div>
          
      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card revenue-chart">
          <h2>Role Overview</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={roleOverview} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
               <YAxis domain={[0, 50]} allowDecimals={false} tickCount={11} scale="linear" />
                <Tooltip />
                <Bar dataKey="value" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card user-chart">
          <h2>Weekly Activity</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="enrollments" stroke="#3498db" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="logins" stroke="#2ecc71" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-card distribution-chart">
          <h2>User Distribution</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ value }) => `${value}`}
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activities Widget */}
      <div className="widgets-grid">
        <div className="widget recent-activities">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Recent Activities</h2>
            <button 
              onClick={() => { fetchDashboardData(); fetchRecentActivities(); }}
              style={{
                padding: '6px 12px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Refresh
            </button>
          </div>
          <div className="activity-list" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px', fontSize: '13px' }}>
                No recent activities found.
              </div>
            ) : recentActivities.map((activity, index) => (
              <div className="activity-item" key={index}>
                <div 
                  className="activity-avatar" 
                  style={{
                    backgroundColor: getAvatarColor(index),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  {activity.avatar}
                </div>
                <div className="activity-details">
                  <div className="activity-text">
                    <strong>{activity.user}</strong> — {activity.action}
                  </div>
                  <div className="activity-time">
                    <FiClock /> {activity.time} · {activity.module}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;