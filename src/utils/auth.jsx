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
      return null;
    }
  }
  return null;
};

// Get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
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
      admin: '/dashboard-admin',
      program_head: '/dashboard-head',
      instructor: '/dashboard-instructor',
      student: '/dashboard-student'
    };
    return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
  }

  return children;
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

export default {
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  logout,
  ProtectedRoute,
  hasRole
};