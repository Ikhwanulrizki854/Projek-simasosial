import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [myActivities, setMyActivities] = useState([]); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Helper: Format Tanggal
  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Helper: Format Rupiah
  const formatCurrency = (number) => {
    if (!number) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  // Helper: Sapaan Waktu
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      try {
        // Ambil data statistik & kegiatan secara paralel
        const [statsRes, activitiesRes] = await Promise.all([
             fetch('http://localhost:8000/api/dashboard-data', { headers }),
             fetch('http://localhost:8000/api/my-activities', { headers })
        ]);

        if (!statsRes.ok) throw new Error('Gagal mengambil data dashboard');
        const statsData = await statsRes.json();
        setDashboardData(statsData);

        if (!activitiesRes.ok) throw new Error('Gagal mengambil data kegiatan');
        const activitiesData = await activitiesRes.json();
        setMyActivities(activitiesData); 

      } catch (err) {
        console.error(err);
        setError(err.message);
        if (err.message.includes('Token')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  // LOADING STATE
  if (!dashboardData) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
           <div className="spinner-border text-primary" role="status"></div>
        </div>
      </div>
    );
  }
  
  // ERROR STATE
  if (error) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <Navbar />
        <div className="container py-5">
            <div className="alert alert-danger shadow-sm border-0">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <Navbar />

      <main className="container py-5 flex-grow-1">
        
        {/* 1. HEADER WELCOME */}
        <div className="card border-0 mb-5 shadow overflow-hidden" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #0d47a1, #42a5f5)' }}>
          <div className="card-body p-5 text-white position-relative">
             <div className="row align-items-center relative z-1">
                 <div className="col-lg-8">
                     <h1 className="fw-bold display-6 mb-2">{getGreeting()}, {dashboardData.nama}! 👋</h1>
                     <p className="lead mb-0 opacity-75">Terima kasih atas kontribusi luar biasa Anda untuk FST.</p>
                 </div>
                 <div className="col-lg-4 text-end d-none d-lg-block">
                     <i className="bi bi-trophy-fill" style={{ fontSize: '5rem', opacity: '0.3' }}></i>
                 </div>
             </div>
             {/* Dekorasi Background */}
             <div className="position-absolute top-0 end-0 p-3 opacity-10">
                 <i className="bi bi-stars" style={{ fontSize: '10rem' }}></i>
             </div>
          </div>
        </div>

        {/* 2. STATS GRID = */}
        <div className="row g-4 mb-5">
          {/* Total Kegiatan */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 hover-card" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4 d-flex align-items-center">
                <div className="flex-shrink-0 bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-calendar-check-fill text-primary fs-3"></i>
                </div>
                <div>
                  <h6 className="text-muted text-uppercase small fw-bold mb-1">Total Kegiatan</h6>
                  <h3 className="fw-bold mb-0 text-dark">{dashboardData.totalKegiatan}</h3>
                </div>
              </div>
            </div>
          </div>
          {/* Jam Kontribusi */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 hover-card" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4 d-flex align-items-center">
                <div className="flex-shrink-0 bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-clock-history text-success fs-3"></i>
                </div>
                <div>
                  <h6 className="text-muted text-uppercase small fw-bold mb-1">Jam Kontribusi</h6>
                  <h3 className="fw-bold mb-0 text-dark">{dashboardData.jamKontribusi}</h3>
                </div>
              </div>
            </div>
          </div>
          {/* Total Donasi */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100 hover-card" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4 d-flex align-items-center">
                <div className="flex-shrink-0 bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                    <i className="bi bi-heart-fill text-danger fs-3"></i>
                </div>
                <div>
                  <h6 className="text-muted text-uppercase small fw-bold mb-1">Total Donasi</h6>
                  <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.4rem' }}>
                    {formatCurrency(dashboardData.totalDonasi)}
                  </h4>
                </div>
              </div>
            </div>
          </div>
          {/* Sertifikat  */}
          <div className="col-md-3">
            <Link to="/sertifikat-saya" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-card bg-warning bg-opacity-10" style={{ borderRadius: '15px', cursor: 'pointer' }}>
                <div className="card-body p-4 d-flex align-items-center">
                    <div className="flex-shrink-0 bg-warning p-3 rounded-circle me-3 text-white shadow-sm">
                        <i className="bi bi-award-fill fs-3"></i>
                    </div>
                    <div>
                    <h6 className="text-muted text-uppercase small fw-bold mb-1">Sertifikat</h6>
                    <h3 className="fw-bold mb-0 text-dark">{dashboardData.sertifikat}</h3>
                    </div>
                </div>
                </div>
            </Link>
          </div>
        </div>

        <div className="row g-4">
          
          {/* 3. AKTIVITAS BERIKUTNYA (CARD HIGHLIGHT) */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px', overflow: 'hidden' }}>
              <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold"><i className="bi bi-bell-fill text-warning me-2"></i> Aktivitas Berikutnya</h5>
              </div>
              <div className="card-body p-4">
                {dashboardData.nextActivity ? (
                   <div className="bg-light p-4 rounded-3 border-start border-5 border-warning position-relative">
                      <span className="badge bg-warning text-dark mb-2">Segera Datang</span>
                      <h5 className="fw-bold text-dark mb-2">{dashboardData.nextActivity.judul}</h5>
                      
                      <div className="d-flex align-items-center text-secondary mb-2">
                         <i className="bi bi-calendar-event me-2 text-primary"></i>
                         {formatDate(dashboardData.nextActivity.tanggal_mulai)}
                      </div>
                      <div className="d-flex align-items-center text-secondary">
                         <i className="bi bi-geo-alt-fill me-2 text-danger"></i>
                         {dashboardData.nextActivity.lokasi || 'Lokasi belum diatur'}
                      </div>
                      
                      <Link to={`/kegiatan/${dashboardData.nextActivity.id}`} className="btn btn-sm btn-outline-dark mt-3 rounded-pill px-3">
                          Lihat Detail
                      </Link>
                   </div>
                ) : (
                   <div className="text-center py-4 text-muted">
                      <i className="bi bi-calendar-x fs-1 opacity-25 mb-2"></i>
                      <p>Tidak ada aktivitas mendatang.</p>
                      <Link to="/kegiatan-publik" className="btn btn-primary btn-sm rounded-pill px-3">Cari Kegiatan</Link>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. RIWAYAT PARTISIPASI (GABUNGAN DONASI & VOLUNTEER) */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
              <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">Riwayat Partisipasi</h5>
                  <Link to="/kegiatan-publik" className="text-decoration-none small fw-bold">Lihat Semua</Link>
              </div>
              <div className="card-body p-4">
                {myActivities.length === 0 ? (
                   <div className="text-center py-5">
                      <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="Empty" width="80" className="opacity-25 mb-3" />
                      <p className="text-muted">Anda belum terdaftar di kegiatan apapun.</p>
                   </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {myActivities.map(activity => (
                      <div key={activity.id} className="list-group-item border-0 px-0 py-3 d-flex align-items-center hover-bg-light rounded-3 transition-all">
                         
                         {/* Icon: Dompet untuk Donasi, Orang untuk Volunteer */}
                         <div className={`flex-shrink-0 p-3 rounded-circle me-3 shadow-sm d-flex align-items-center justify-content-center ${activity.tipe === 'donasi' ? 'bg-success bg-opacity-10 text-success' : 'bg-primary bg-opacity-10 text-primary'}`} style={{width: '50px', height: '50px'}}>
                             <i className={`bi ${activity.tipe === 'donasi' ? 'bi-wallet2' : 'bi-person-raised-hand'} fs-5`}></i>
                         </div>
                         
                         {/* Info Utama */}
                         <div className="flex-grow-1">
                             <h6 className="fw-bold mb-1 text-dark">{activity.judul}</h6>
                             
                             {/* Detail Text Berbeda Tiap Tipe */}
                             <div className="small text-muted">
                                {activity.tipe === 'donasi' ? (
                                    <span className="text-success fw-bold">
                                        <i className="bi bi-cash-stack me-1"></i>
                                        Donasi: {formatCurrency(activity.jumlah_donasi || activity.target_donasi)}
                                    </span>
                                ) : (
                                    <span>
                                        <i className="bi bi-calendar-event me-1"></i> 
                                        {formatDate(activity.tanggal_mulai)}
                                    </span>
                                )}
                             </div>
                         </div>
                         
                         {/* Badge Tipe */}
                         <div className="me-3 d-none d-md-block">
                            <span className={`badge rounded-pill ${activity.tipe === 'donasi' ? 'bg-success' : 'bg-primary'}`}>
                                {activity.tipe === 'donasi' ? 'Donatur' : 'Relawan'}
                            </span>
                         </div>
                         
                         {/* Tombol Panah Detail */}
                         <Link to={`/kegiatan/${activity.id}`} className="btn btn-light btn-sm rounded-circle border shadow-sm text-secondary" style={{width: '32px', height: '32px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <i className="bi bi-chevron-right" style={{fontSize: '0.8rem'}}></i>
                         </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-5 mt-auto" style={{ backgroundColor: '#010962ff', color: '#ffffffff' }}>
        <div className="container text-center">
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <h5 className="fw-bold text-uppercase mb-3">Tentang Kami</h5>
              <p className="small">Platform digital yang menghubungkan mahasiswa Fakultas Sains dan Teknologi dalam kegiatan sosial yang berdampak.</p>
            </div>
            <div className="col-md-4 mb-3">
              <h5 className="fw-bold text-uppercase mb-3">Kontak</h5>
              <ul className="list-unstyled small">
                <li className="mb-2"><i className="bi bi-envelope me-2"></i> simasosialfst@gmail.com</li>
                <li className="mb-2"><i className="bi bi-telephone me-2"></i> (0751) 123456</li>
                <li><i className="bi bi-geo-alt me-2"></i> UIN Imam Bonjol Padang</li>
              </ul>
            </div>
            <div className="col-md-4 mb-3">
              <h5 className="fw-bold text-uppercase mb-3">Sosial Media</h5>
              <div className="d-flex justify-content-center gap-3">
                <a href="#" className="fs-4 text-white"><i className="bi bi-instagram"></i></a>
                <a href="#" className="fs-4 text-white"><i className="bi bi-twitter"></i></a>
                <a href="#" className="fs-4 text-white"><i className="bi bi-youtube"></i></a>
              </div>
            </div>
          </div>
          <div className="pt-3 border-top border-secondary">
            <p className="small mb-0">© 2025 SIMASOSIAL FST. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;