// src/utils/auth.jsx
import { Navigate } from 'react-router-dom';

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  return user && token;
};

// Get current user data
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  return null;
};

// Get user ID (works for all user types)
export const getUserId = () => {
  const user = getCurrentUser();
  return user ? user.user_id : null;
};

// Get user's full name
export const getUserFullName = () => {
  const user = getCurrentUser();
  if (!user) return '';
  
  const { firstName, lastName, middleName, suffix } = user;
  let fullName = `${firstName || ''} ${middleName || ''} ${lastName || ''}`.trim();
  if (suffix) fullName += ` ${suffix}`;
  
  return fullName;
};

// Get user's first name
export const getUserFirstName = () => {
  const user = getCurrentUser();
  return user ? user.firstName : '';
};

// Update user data in localStorage
export const updateUserData = (updatedUser) => {
  try {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return true;
  } catch (e) {
    console.error('Failed to update user data:', e);
    return false;
  }
};

// Get enrollment status
export const getEnrollmentStatus = () => {
  const user = getCurrentUser();
  return user ? user.enrollment_status : 'unenrolled';
};

// Check if student needs enrollment
export const needsEnrollment = () => {
  const user = getCurrentUser();
  return user && user.role === 'student' && user.enrollment_status === 'unenrolled';
};

// Check if student has pending enrollment
export const hasPendingEnrollment = () => {
  const user = getCurrentUser();
  return user && user.role === 'student' && (user.enrollment_status === 'pending' || user.enrollment_status === 'in_progress');
};

// Check if student is enrolled
export const isEnrolled = () => {
  const user = getCurrentUser();
  return user && user.role === 'student' && user.enrollment_status === 'enrolled';
};

// Get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

// Get user email
export const getUserEmail = () => {
  const user = getCurrentUser();
  return user ? user.email : '';
};

// Get student number (for students)
export const getStudentNumber = () => {
  const user = getCurrentUser();
  return user && user.student_number ? user.student_number : '';
};

// Get instructor ID (for instructors)
export const getInstructorId = () => {
  const user = getCurrentUser();
  return user && user.instructor_id ? user.instructor_id : null;
};

// Get program head ID (for program heads)
export const getProgramHeadId = () => {
  const user = getCurrentUser();
  return user && user.program_head_id ? user.program_head_id : null;
};

// Get user's department (for instructors/program heads)
export const getUserDepartment = () => {
  const user = getCurrentUser();
  return user && user.department ? user.department : '';
};

// Get user's program (for students)
export const getUserProgram = () => {
  const user = getCurrentUser();
  return user && user.program ? user.program : '';
};

// Get user's year level (for students)
export const getUserYearLevel = () => {
  const user = getCurrentUser();
  return user && user.yearLevel ? user.yearLevel : '';
};

// Get user's section (for students)
export const getUserSection = () => {
  const user = getCurrentUser();
  return user && user.current_section_id ? user.current_section_id : null;
};

// Logout function
export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('isAuthenticated');
  window.location.href = '/login';
};

// Protected Route Component
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = getCurrentUser();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const roleRoutes = {
      superadmin: '/dashboard-superadmin',
      admin: '/dashboard-admin',
      program_head: '/dashboard-head',
      instructor: '/dashboard-instructor',
      student: '/dashboard-student'
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
};

// Student Enrollment Route - Redirects unenrolled students to enrollment page
export const StudentEnrollmentRoute = ({ children }) => {
  const user = getCurrentUser();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // If student is unenrolled, redirect to enrollment page
  if (user.role === 'student' && user.enrollment_status === 'unenrolled') {
    return <Navigate to="/exist-enroll" replace />;
  }

  return children;
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Refresh user data from server
export const refreshUserData = async () => {
  try {
    const user = getCurrentUser();
    if (!user || !user.user_id) return false;

    const response = await fetch(`http://localhost/svcc-enrollment/get_user.php?user_id=${user.user_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        updateUserData(data.user);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return false;
  }
};

export default {
  isAuthenticated,
  getCurrentUser,
  getUserId,
  getUserFullName,
  getUserFirstName,
  updateUserData,
  getEnrollmentStatus,
  needsEnrollment,
  hasPendingEnrollment,
  isEnrolled,
  getUserRole,
  getUserEmail,
  getStudentNumber,
  getInstructorId,
  getProgramHeadId,
  getUserDepartment,
  getUserProgram,
  getUserYearLevel,
  getUserSection,
  logout,
  ProtectedRoute,
  StudentEnrollmentRoute,
  hasRole,
  refreshUserData
};