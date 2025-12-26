import React from 'react';
import ReactDOM from 'react-dom/client';

// Impor CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';

// Impor Router
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Impor Halaman (Pages)
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifikasiSertifikat from './pages/VerifikasiSertifikat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ActivityDetail from './pages/ActivityDetail.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManajemenKegiatan from './pages/ManajemenKegiatan.jsx';
import BuatKegiatan from './pages/BuatKegiatan.jsx';
import EditKegiatan from './pages/EditKegiatan.jsx';
import ManajemenPengguna from './pages/ManajemenPengguna.jsx';
import Pengaturan from './pages/Pengaturan.jsx';
import SertifikatSaya from './pages/SertifikatSaya.jsx'; 
import LihatSertifikat from './pages/LihatSertifikat.jsx'; 
import ProfilSaya from './pages/ProfilSaya.jsx';
import LupaPassword from './pages/LupaPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifikasiEmail from './pages/VerifikasiEmail.jsx';
import KatalogKegiatan from './pages/KatalogKegiatan.jsx';
import ManajemenDonasi from './pages/ManajemenDonasi.jsx';
import Laporan from './pages/Laporan.jsx';

// Impor Komponen (Guards)
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx';

// Definisikan rute/halaman
const router = createBrowserRouter([
  // Rute Publik
  { path: "/", element: <LandingPage /> },
  { path: "/kegiatan-publik", element: <KatalogKegiatan /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/verifikasi", element: <VerifikasiSertifikat /> },
  { path: "/verify-email", element: <VerifikasiEmail /> },
  { path: "/lupa-password", element: <LupaPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  
  // Rute untuk MAHASISWA (Perlu login)
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/kegiatan/:id", element: <ActivityDetail /> },
      { path: "/sertifikat-saya", element: <SertifikatSaya /> },
      { path: "/sertifikat/view/:kodeUnik", element: <LihatSertifikat /> },
      { path: "/profil", element: <ProfilSaya /> },
    ]
  },
  
  // Rute untuk ADMIN (Perlu login & role 'admin')
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />, 
        children: [
          { path: "/admin/dashboard", element: <AdminDashboard /> },
          { path: "/admin/manajemen-kegiatan", element: <ManajemenKegiatan /> },
          { path: "/admin/kegiatan/baru", element: <BuatKegiatan /> },
          { path: "/admin/kegiatan/edit/:id", element: <EditKegiatan /> },
          { path: "/admin/manajemen-pengguna", element: <ManajemenPengguna /> },
          { path: "/admin/pengaturan", element: <Pengaturan /> },
          { path: "/admin/donasi", element: <ManajemenDonasi /> }, 

          // --- 2. DAFTARKAN RUTE LAPORAN DISINI ---
          { path: "/admin/laporan", element: <Laporan /> }, 
          // ----------------------------------------
        ]
      }
    ]
  },
]);

// Render aplikasinya
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);