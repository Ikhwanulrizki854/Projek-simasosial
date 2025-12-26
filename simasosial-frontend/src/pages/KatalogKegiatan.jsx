import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Helper Format Rupiah
const formatCurrency = (number) => {
  if (!number) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// Helper Persentase
const getPercentage = (current, target) => {
  if (!target || target === 0) return 0;
  return Math.min(100, (current / target) * 100);
};

// Helper Format Tanggal
const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

function KatalogKegiatan() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/all-activities');
        if (!response.ok) throw new Error('Gagal memuat kegiatan');
        const data = await response.json();
        setActivities(data);
        setFilteredActivities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // Logika Filter
  useEffect(() => {
    const results = activities.filter(act => {
      const matchSearch = act.judul.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipe = filterTipe ? act.tipe === filterTipe : true;
      return matchSearch && matchTipe;
    });
    setFilteredActivities(results);
  }, [searchTerm, filterTipe, activities]);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container py-5 flex-grow-1">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-5">
          <h1 className="fw-bold display-5 text-dark">Daftar Kegiatan</h1>
          <p className="text-muted lead">Jelajahi berbagai aksi kebaikan dan temukan peranmu di sini.</p>
          <div className="bg-primary mx-auto mt-3" style={{width: '60px', height: '4px', borderRadius: '5px'}}></div>
        </div>

        {/* SEARCH & FILTER BAR (DESAIN TERPISAH) */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-10">
            <div className="row g-3">
                {/* 1. KOLOM PENCARIAN (Besar di Kiri) */}
                <div className="col-md-8">
                    <div className="input-group shadow-sm rounded overflow-hidden bg-white border h-100">
                        <span className="input-group-text bg-white border-0 ps-3">
                            <i className="bi bi-search text-muted fs-5"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control border-0 py-3 shadow-none" 
                            placeholder="Cari nama kegiatan..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* 2. KOLOM FILTER (Di Kanan) */}
                <div className="col-md-4">
                    <div className="input-group shadow-sm rounded overflow-hidden bg-white border h-100">
                         <span className="input-group-text bg-white border-0 ps-3">
                            <i className="bi bi-funnel-fill text-primary"></i>
                         </span>
                         <select 
                            className="form-select border-0 py-3 shadow-none bg-white" 
                            style={{ cursor: 'pointer' }}
                            value={filterTipe}
                            onChange={(e) => setFilterTipe(e.target.value)}
                         >
                            <option value="">Semua Kategori</option>
                            <option value="donasi">Donasi (Dana)</option>
                            <option value="volunteer">Volunteer (Relawan)</option>
                         </select>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* CONTENT SECTION */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Sedang memuat data...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
                <i className="bi bi-search display-1 text-muted opacity-25"></i>
            </div>
            <h4 className="text-muted fw-bold">Tidak ada kegiatan ditemukan.</h4>
            <p className="text-muted">Coba kata kunci lain atau ubah filter kategori.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredActivities.map(act => (
              <div key={act.id} className="col-lg-4 col-md-6">
                {/* CARD MODERN */}
                <div className="card h-100 border-0 shadow-sm overflow-hidden hover-card" style={{ borderRadius: '12px', transition: 'all 0.3s' }}>
                  
                  {/* GAMBAR HEADER */}
                  <div className="position-relative">
                      <img 
                        src={act.gambar_url ? `http://localhost:8000/${act.gambar_url}` : 'https://via.placeholder.com/400x200?text=Kegiatan'} 
                        className="card-img-top" 
                        alt={act.judul} 
                        style={{ height: '220px', objectFit: 'cover' }}
                      />
                      {/* Badge Overlay */}
                      <span className={`position-absolute top-0 end-0 m-3 badge rounded-pill px-3 py-2 shadow-sm ${act.tipe === 'donasi' ? 'bg-warning text-dark' : 'bg-info text-white'}`}>
                        {act.tipe === 'donasi' ? <><i className="bi bi-coin me-1"></i> Donasi</> : <><i className="bi bi-people-fill me-1"></i> Volunteer</>}
                      </span>
                  </div>
                  
                  {/* CARD BODY */}
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="card-title fw-bold text-dark mb-3" style={{ minHeight: '50px' }}>
                        {act.judul}
                    </h5>

                    {/* INFO LOKASI & TANGGAL */}
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
                    
                    {/* PROGRESS BAR */}
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
                      
                      {/* TOMBOL AKSI */}
                      <Link to={`/kegiatan/${act.id}`} className="btn btn-outline-primary w-100 fw-bold py-2 rounded-pill shadow-sm">
                        Lihat Detail <i className="bi bi-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
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

export default KatalogKegiatan;