import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function SertifikatSaya() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/my-certificates', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCertificates(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [navigate]);

  // Helper format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container py-5 flex-grow-1">
        
        {/* --- TOMBOL KEMBAL -- */}
        <div className="mb-4">
            <Link className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold" to="/dashboard">
                <i className="bi bi-arrow-left me-2"></i> Kembali ke Dashboard
            </Link>
        </div>

        {/* HEADER */}
        <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 p-4 rounded-circle mb-3 shadow-sm">
                <i className="bi bi-award-fill text-warning display-4"></i>
            </div>
            <h2 className="fw-bold display-6">Koleksi Sertifikat</h2>
            <p className="text-muted">Bukti kontribusi dan dedikasi Anda dalam kegiatan sosial.</p>
            <div className="bg-warning mx-auto mt-3" style={{width: '60px', height: '4px', borderRadius: '5px'}}></div>
        </div>

        {loading ? (
          <div className="text-center py-5">
             <div className="spinner-border text-warning" role="status"></div>
             <p className="mt-2 text-muted">Mengambil data sertifikat...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-5">
             <img src="https://cdn-icons-png.flaticon.com/512/7486/7486754.png" alt="Empty" width="100" className="opacity-25 mb-3" />
             <h4 className="text-muted">Belum ada sertifikat.</h4>
             <p className="text-muted small">Ikuti kegiatan volunteer dan selesaikan untuk mendapatkan sertifikat.</p>
             <Link to="/kegiatan-publik" className="btn btn-primary rounded-pill mt-3 px-4">Cari Kegiatan</Link>
          </div>
        ) : (
          <div className="row g-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="col-lg-6">
                {/* KARTU SERTIFIKAT PREMIUM */}
                <div className="card shadow-sm border-0 h-100 position-relative overflow-hidden hover-card" style={{ borderRadius: '15px', transition: 'transform 0.3s' }}>
                  
                  {/* Dekorasi Pinggir */}
                  <div className="position-absolute top-0 start-0 h-100 bg-warning" style={{ width: '6px' }}></div>
                  
                  <div className="card-body p-4 d-flex align-items-center">
                    {/* Ikon Sertifikat */}
                    <div className="flex-shrink-0 bg-light p-3 rounded-circle me-4 border border-warning border-opacity-25">
                        <i className="bi bi-file-earmark-check-fill text-warning fs-1"></i>
                    </div>

                    <div className="flex-grow-1">
                      <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Sertifikat Relawan</small>
                      <h5 className="fw-bold mb-1 text-dark mt-1">{cert.nama_kegiatan}</h5>
                      <p className="text-secondary small mb-2">
                         <i className="bi bi-calendar-check me-1"></i> Terbit: {formatDate(cert.tanggal_terbit)}
                      </p>
                      
                      <div className="d-flex align-items-center mt-3">
                         <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 me-auto border border-success border-opacity-25">
                            <i className="bi bi-patch-check-fill me-1"></i> Terverifikasi
                         </span>
                         
                         <Link 
                            to={`/sertifikat/view/${cert.kode_unik}`} 
                            className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                          >
                            <i className="bi bi-eye-fill me-1"></i> Lihat Detail
                          </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dekorasi Watermark */}
                  <i className="bi bi-award-fill position-absolute text-warning" style={{ fontSize: '8rem', opacity: '0.05', right: '-20px', bottom: '-20px', transform: 'rotate(-15deg)' }}></i>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
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

export default SertifikatSaya;