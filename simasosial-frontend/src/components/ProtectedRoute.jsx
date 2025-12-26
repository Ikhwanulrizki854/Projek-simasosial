import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Cek apakah ada token di localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    // Jika tidak ada token, "tendang" ke halaman login
    return <Navigate to="/login" replace />;
  }

  // Jika ada token, izinkan akses
  return <Outlet />;
};

export default ProtectedRoute;