import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 

// Helper 'time ago'
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return Math.floor(seconds) + " detik lalu";
};

// Helper Icon Notifikasi
const getNotificationIcon = (pesan) => {
  const msg = pesan.toLowerCase();
  if (msg.includes('sertifikat')) return 'bi-patch-check-fill text-primary';
  if (msg.includes('donasi')) return 'bi-coin text-warning';
  if (msg.includes('verifikasi')) return 'bi-shield-check text-success';
  return 'bi-info-circle-fill text-secondary';
};

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      if (role === 'mahasiswa') {
        fetchNotifications();
      }
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/my-notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal ambil notif');
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleNotifClick = async () => {
    if (unreadCount > 0) {
      try {
        await fetch('http://localhost:8000/api/notifications/mark-read', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUnreadCount(0); 
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  // --- LOGOUT DENGAN SWEETALERT ---
  const handleLogout = () => {
    Swal.fire({
      title: 'Yakin ingin keluar?',
      text: "Anda harus login kembali untuk mengakses akun.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        setUserRole(null);
        navigate('/'); 
        
        const Toast = Swal.mixin({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 2000
        });
        Toast.fire({ icon: 'success', title: 'Berhasil Logout' });
      }
    });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        
        {/* LOGO */}
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <img 
            src="/Logo.png" 
            alt="Logo" 
            width="40" height="40" 
            className="d-inline-block align-text-top me-2" 
            onError={(e) => e.target.style.display = 'none'} 
          />
          SIMASOSIAL FST
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            
            <li className="nav-item"><Link className="nav-link" to="/">Beranda</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/kegiatan-publik">Kegiatan</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/verifikasi">Verifikasi Sertifikat</Link></li>
            
            {isLoggedIn ? (
              <>
                {/* --- NOTIFIKASI DROPDOWN --- */}
                {userRole === 'mahasiswa' && (
                  <li className="nav-item dropdown ms-2">
                    <a 
                      className="nav-link position-relative" 
                      href="#" 
                      id="notifDropdown" 
                      role="button" 
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                      onClick={handleNotifClick} 
                    >
                      <i className="bi bi-bell-fill fs-4 text-secondary"></i>
                      {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                          {unreadCount}
                          <span className="visually-hidden">unread messages</span>
                        </span>
                      )}
                    </a>
                    
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-0" aria-labelledby="notifDropdown" style={{width: '320px', maxHeight: '400px', overflowY: 'auto'}}>
                      <li className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                        <span className="fw-bold text-dark">Notifikasi</span>
                        {unreadCount > 0 && <span className="badge bg-primary rounded-pill">{unreadCount} Baru</span>}
                      </li>

                      {notifications.length === 0 ? (
                        <li className="p-4 text-center text-muted">
                            <i className="bi bi-bell-slash fs-1 d-block mb-2 text-secondary"></i>
                            Tidak ada notifikasi.
                        </li>
                      ) : (
                        notifications.map(notif => (
                          <li key={notif.id}>
                            <Link 
                                to={notif.link_url} 
                                className={`dropdown-item p-3 border-bottom d-flex align-items-start ${notif.status_baca === 'belum_dibaca' ? 'bg-aliceblue' : ''}`}
                                style={{whiteSpace: 'normal'}}
                            >
                              <div className="me-3 mt-1">
                                  <i className={`bi ${getNotificationIcon(notif.pesan)} fs-4`}></i>
                              </div>
                              <div>
                                  <p className={`mb-1 small ${notif.status_baca === 'belum_dibaca' ? 'fw-bold text-dark' : 'text-secondary'}`}>
                                      {notif.pesan}
                                  </p>
                                  <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>
                                      <i className="bi bi-clock me-1"></i>
                                      {timeAgo(notif.created_at)}
                                  </small>
                              </div>
                            </Link>
                          </li>
                        ))
                      )}
                      
                      <li className="p-2 text-center bg-light">
                         <Link to="/dashboard" className="small text-decoration-none fw-bold">Lihat Dashboard</Link>
                      </li>
                    </ul>
                  </li>
                )}

                {/* --- PROFIL DROPDOWN --- */}
                <li className="nav-item dropdown ms-3">
                  <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{width: '35px', height: '35px'}}>
                        <i className="bi bi-person-fill fs-5 text-dark"></i>
                    </div>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item py-2" to={userRole === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                        <i className="bi bi-speedometer2 me-2 text-primary"></i> Dashboard
                      </Link>
                    </li>
                    
                    {userRole === 'mahasiswa' && (
                        <>
                            <li>
                              <Link className="dropdown-item py-2" to="/profil">
                                <i className="bi bi-person-gear me-2 text-info"></i> Profil Saya
                              </Link>
                            </li>
                            {/* --- MENU: SERTIFIKAT SAYA --- */}
                            <li>
                              <Link className="dropdown-item py-2" to="/sertifikat-saya">
                                <i className="bi bi-award me-2 text-warning"></i> Sertifikat Saya
                              </Link>
                            </li>
                        </>
                    )}

                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item ms-3">
                <Link to="/login" className="btn btn-warning text-white btn-sm px-4 rounded-pill fw-bold shadow-sm">
                    Login / Daftar
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;