import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
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

  // Render child routes
  return <Outlet />;
};

export default PrivateRoute;