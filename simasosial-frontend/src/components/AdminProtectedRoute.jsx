import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'admin') {
    // Jika tidak ada token ATAU role-nya BUKAN admin
    return <Navigate to="/login" replace />;
  }

  // Jika token ada DAN role-nya admin
  return <Outlet />;
};

export default AdminProtectedRoute;