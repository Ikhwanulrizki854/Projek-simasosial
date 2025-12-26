import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Helper untuk format Rupiah
const formatCurrency = (number) => {
  if (!number) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(number);
};

// Helper untuk format Tanggal (BARU)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Helper untuk hitung persentase progress
const getPercentage = (current, target) => {
  if (!target || target === 0) return 0;
  return Math.min(100, (current / target) * 100);
};

function LandingPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil data kegiatan publik (Top 3 Mendesak)
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/public-activities');
        if (!response.ok) throw new Error('Gagal memuat kegiatan');
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);

  return (
    <div>
      {/* Navbar Dinamis */}
      <Navbar />

      {/* Header / Hero Section */}
      <header className="py-5" style={{ 
        marginTop: '56px', 
        background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/gambar home.png') no-repeat center center`, 
        backgroundSize: 'cover' 
      }}>
        <div className="container text-center text-white py-5">
          <h1 
            className="display-4 fw-bold" 
            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}
          >
            Inspirasi Beraksi, Kontribusi dari Hati untuk FST
          </h1>
          <p 
            className="lead" 
            style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)' }}
          >
            Platform kegiatan sosial mahasiswa Fakultas Sains dan Teknologi
          </p>
          
          <Link to="/kegiatan-publik" className="btn btn-warning text-white btn-lg fw-bold mt-3 shadow">
            Lihat Semua Kegiatan
          </Link>
        </div>
      </header>

      {/* Bagian Kegiatan Mendesak */}
      <section id="kegiatan" className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
             <h2 className="fw-bold" style={{ color: '#0d47a1' }}>Kegiatan Mendesak Saat Ini</h2>
             <p className="text-muted">Ayo berpartisipasi dalam kegiatan yang akan segera dilaksanakan</p>
          </div>
          
          <div className="row g-4">
            {loading ? (
              <div className="text-center w-100 py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Memuat kegiatan...</p>
              </div>
            ) : activities.length === 0 ? (
              <p className="text-center text-muted w-100 py-5">Belum ada kegiatan yang dipublikasikan.</p>
            ) : (
              activities.map(act => (
                <div key={act.id} className="col-lg-4 col-md-6">
                  {/* CARD DESAIN BARU */}
                  <div className="card h-100 border-0 shadow-sm overflow-hidden hover-card" style={{ borderRadius: '15px', transition: 'transform 0.2s' }}>
                    
                    {/* Gambar + Badge Overlay */}
                    <div className="position-relative">
                      <img 
                        src={act.gambar_url ? `http://localhost:8000/${act.gambar_url}` : 'https://via.placeholder.com/400x200?text=Kegiatan'} 
                        className="card-img-top" 
                        alt={act.judul} 
                        style={{ height: '220px', objectFit: 'cover' }}
                      />
                      {/* Badge Tipe di Pojok */}
                      <span className={`position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-2 shadow-sm ${act.tipe === 'donasi' ? 'bg-warning text-dark' : 'bg-info text-white'}`}>
                        {act.tipe === 'donasi' ? <><i className="bi bi-coin me-1"></i> Donasi</> : <><i className="bi bi-people-fill me-1"></i> Volunteer</>}
                      </span>
                    </div>
                    
                    <div className="card-body d-flex flex-column p-4">
                      {/* Judul */}
                      <h5 className="card-title fw-bold text-dark mb-3" style={{ minHeight: '50px' }}>
                        {act.judul}
                      </h5>

                      {/* Info Lokasi & Tanggal (Desain Baru) */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2 text-secondary small">
                            <i className="bi bi-geo-alt-fill text-danger me-2 fs-5"></i>
                            <span className="text-truncate">{act.lokasi || 'Online'}</span>
                        </div>
                        <div className="d-flex align-items-center text-secondary small">
                            <i className="bi bi-calendar-event-fill text-primary me-2 fs-5"></i>
                            <span className="fw-bold text-dark">{formatDate(act.tanggal_mulai)}</span>
                        </div>
                      </div>

                      <hr className="my-2 opacity-10" />
                      
                      {/* Bagian Progress Bar */}
                      <div className="mt-auto">
                        {act.tipe === 'donasi' ? (
                          <div className="mb-3">
                             <div className="d-flex justify-content-between small fw-bold mb-1">
                               <span className="text-success">{formatCurrency(act.donasi_terkumpul)}</span>
                               <span className="text-muted fw-normal">Target: {formatCurrency(act.target_donasi)}</span>
                             </div>
                             <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                                <div className="progress-bar bg-success progress-bar-striped" style={{ width: `${getPercentage(act.donasi_terkumpul, act.target_donasi)}%` }}></div>
                             </div>
                          </div>
                        ) : (
                          <div className="mb-3">
                             <div className="d-flex justify-content-between small fw-bold mb-1">
                               <span className="text-info">{act.peserta_terdaftar} Relawan</span>
                               <span className="text-muted fw-normal">Kuota: {act.target_peserta}</span>
                             </div>
                             <div className="progress" style={{ height: '8px', borderRadius: '10px' }}>
                                <div className="progress-bar bg-info progress-bar-striped" style={{ width: `${getPercentage(act.peserta_terdaftar, act.target_peserta)}%` }}></div>
                             </div>
                          </div>
                        )}
                        
                        {/* Tombol Aksi Full Width */}
                        <Link 
                            to={`/kegiatan/${act.id}`} 
                            className={`btn w-100 fw-bold py-2 rounded-pill shadow-sm ${act.tipe === 'donasi' ? 'btn-outline-success' : 'btn-outline-primary'}`}
                        >
                          {act.tipe === 'donasi' ? 'Donasi Sekarang' : 'Daftar Relawan'} <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center mt-5">
             <Link to="/kegiatan-publik" className="btn btn-light shadow-sm px-4 py-2 rounded-pill text-muted fw-bold border">
                Lihat Lebih Banyak <i className="bi bi-chevron-right ms-1"></i>
             </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 mt-auto" style={{ backgroundColor: '#010962ff', color: '#ffffffff' }}>
        <div className="container text-center">
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <h5 className="fw-bold text-uppercase mb-3">Tentang Kami</h5>
              <p className="small">
                Platform digital yang menghubungkan mahasiswa Fakultas Sains dan Teknologi dalam kegiatan sosial yang berdampak.
              </p>
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
                <a href="#" className="fs-4" style={{ color: '#ffffffff' }}><i className="bi bi-instagram"></i></a>
                <a href="#" className="fs-4" style={{ color: '#ffffffff' }}><i className="bi bi-twitter"></i></a>
                <a href="#" className="fs-4" style={{ color: '#ffffffff' }}><i className="bi bi-youtube"></i></a>
              </div>
            </div>
          </div>
          <div className="pt-3" style={{ borderTop: '1px solid #bbdefb' }}>
            <p className="small mb-0">© 2025 SIMASOSIAL FST. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;