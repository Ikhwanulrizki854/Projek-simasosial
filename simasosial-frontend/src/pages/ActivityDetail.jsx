import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar'; 

// Helper Format Rupiah
const formatCurrency = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// Helper Format Tanggal
const formatDate = (dateString) => {
    if (!dateString) return 'Belum ditentukan';
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
};

function ActivityDetail() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jumlahDonasi, setJumlahDonasi] = useState('');
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/activities/${id}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Kegiatan tidak ditemukan');
        }
        const data = await response.json();
        setActivity(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id]); 

  const handleDonasi = async () => {
    if (isPaymentLoading) return;
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({ icon: 'warning', title: 'Login Dulu', text: 'Anda harus login untuk berdonasi.' }).then(() => navigate('/login'));
      return;
    }
    if (!jumlahDonasi || parseInt(jumlahDonasi) < 10000) {
      Swal.fire('Perhatian', 'Donasi minimal Rp 10.000', 'warning');
      return;
    }
    setIsPaymentLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ activity_id: activity.id, jumlah: parseInt(jumlahDonasi) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal membuat transaksi.');
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: function(result){ Swal.fire('Terima Kasih!', 'Pembayaran berhasil.', 'success').then(() => window.location.reload()); setIsPaymentLoading(false); },
          onPending: function(result){ Swal.fire('Menunggu Pembayaran', 'Silakan selesaikan pembayaran.', 'info'); setIsPaymentLoading(false); },
          onError: function(result){ Swal.fire('Gagal', 'Pembayaran gagal.', 'error'); setIsPaymentLoading(false); },
          onClose: function(){ setIsPaymentLoading(false); }
        });
      } else { Swal.fire('Error', 'Midtrans Snap.js error.', 'error'); setIsPaymentLoading(false); }
    } catch (err) { console.error(err); Swal.fire('Gagal', err.message, 'error'); setIsPaymentLoading(false); }
  };

  const handleRegisterVolunteer = async () => {
    const token = localStorage.getItem('token');
    if (!token) { Swal.fire({ icon: 'warning', title: 'Login Dulu', text: 'Anda harus login untuk mendaftar.' }).then(() => navigate('/login')); return; }
    const result = await Swal.fire({ title: 'Daftar Relawan?', text: `Gabung di "${activity.judul}"?`, icon: 'question', showCancelButton: true, confirmButtonText: 'Ya, Daftar!' });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`http://localhost:8000/api/activities/${id}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      Swal.fire('Berhasil!', data.message, 'success').then(() => window.location.reload());
    } catch (err) { Swal.fire('Gagal', err.message, 'error'); }
  };

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light"><h3 className="text-danger fw-bold">Terjadi Kesalahan</h3><p className="text-muted">{error}</p><Link to="/" className="btn btn-outline-primary rounded-pill px-4">Kembali ke Beranda</Link></div>;
  
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* 1. NAVBAR SERAGAM */}
      <Navbar />

      <main className="container py-5">
        
        {/* 2. TOMBOL KEMBALI DI ATAS KONTEN */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <Link className="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-bold" to={localStorage.getItem('role') === 'admin' ? '/admin/dashboard' : '/kegiatan-publik'}>
                <i className="bi bi-arrow-left me-2"></i> Kembali
            </Link>
        </div>

        {/* 3. JUDUL "DETAIL KEGIATAN" DI TENGAH */}
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark display-6">Detail Kegiatan</h2>
          <div className="bg-primary mx-auto mt-2" style={{width: '60px', height: '4px', borderRadius: '5px'}}></div>
        </div>

        {/* 4. GAMBAR HEADER  */}
        <div className="row mb-5 justify-content-center">
          <div className="col-lg-12">
            <div className="card border-0 shadow-sm overflow-hidden rounded-4">
                 <img 
                    src={activity.gambar_url ? `http://localhost:8000/${activity.gambar_url}` : 'https://via.placeholder.com/1200x500?text=Gambar+Kegiatan'} 
                    className="img-fluid w-100" 
                    alt={activity.judul} 
                    style={{ height: '450px', objectFit: 'cover' }} 
                 />
            </div>
          </div>
        </div>

        <div className="row g-5">
          {/* INFO DETAIL */}
          <div className="col-lg-7">
            <div className="mb-4">
                 <span className={`badge rounded-pill px-3 py-2 mb-3 ${activity.tipe === 'donasi' ? 'bg-warning text-dark' : 'bg-info text-white'}`}>
                    {activity.tipe === 'donasi' ? <><i className="bi bi-coin me-1"></i> Open Donasi</> : <><i className="bi bi-people-fill me-1"></i> Open Volunteer</>}
                 </span>
                 <h1 className="fw-bold display-6 mb-3 text-dark">{activity.judul}</h1>
                 
                 {/* INFO LOKASI & WAKTU */}
                 <div className="d-flex flex-wrap gap-4 text-muted mb-4 border-bottom pb-4">
                    <div className="d-flex align-items-center">
                        <div className="bg-white p-2 rounded-circle shadow-sm me-3 border">
                            <i className="bi bi-geo-alt-fill text-danger fs-5"></i>
                        </div>
                        <div>
                            <small className="d-block text-uppercase fw-bold text-secondary" style={{fontSize: '0.7rem'}}>LOKASI</small>
                            <span className="fw-bold text-dark">{activity.lokasi || 'Online'}</span>
                        </div>
                    </div>
                    
                    <div className="d-flex align-items-center">
                        <div className="bg-white p-2 rounded-circle shadow-sm me-3 border">
                            <i className="bi bi-calendar-event-fill text-primary fs-5"></i>
                        </div>
                        <div>
                            <small className="d-block text-uppercase fw-bold text-secondary" style={{fontSize: '0.7rem'}}>TANGGAL PELAKSANAAN</small>
                            <span className="fw-bold text-dark">{formatDate(activity.tanggal_mulai)}</span>
                        </div>
                    </div>
                 </div>
            </div>

            <h4 className="fw-bold mb-3 text-dark"><i className="bi bi-file-text me-2"></i>Deskripsi Kegiatan</h4>
            <div className="text-muted fs-6" style={{ lineHeight: '1.8', whiteSpace: 'pre-line', textAlign: 'justify' }}>
                {activity.deskripsi || 'Belum ada deskripsi mendetail untuk kegiatan ini.'}
            </div>
          </div>

          {/* KOTAK AKSI */}
          <div className="col-lg-5">
            <div className="card border-0 shadow p-4 sticky-top bg-white" style={{ top: '100px', borderRadius: '15px' }}>
              
              {activity.tipe === 'donasi' ? (
                <>
                  <h5 className="fw-bold mb-3 text-center">Progress Donasi</h5>
                  <div className="text-center mb-3">
                     <h2 className="text-success fw-bold mb-0">{formatCurrency(activity.donasi_terkumpul)}</h2>
                     <small className="text-muted">terkumpul dari target <b>{formatCurrency(activity.target_donasi)}</b></small>
                  </div>
                  
                  <div className="progress mb-4 shadow-sm" style={{ height: '12px', borderRadius: '10px', backgroundColor: '#e9ecef' }}>
                    <div className="progress-bar bg-success progress-bar-striped progress-bar-animated" style={{ width: `${(activity.donasi_terkumpul / (activity.target_donasi || 1)) * 100}%` }}></div>
                  </div>

                  <div className="bg-light p-3 rounded-3 mb-3 border">
                    <label className="form-label fw-bold small text-uppercase text-muted">Masukkan Nominal (Rp)</label>
                    <div className="input-group input-group-lg">
                        <span className="input-group-text border-0 bg-white fw-bold text-success">Rp</span>
                        <input 
                            type="number" 
                            className="form-control border-0 bg-white fw-bold fs-4" 
                            placeholder="0"
                            value={jumlahDonasi}
                            onChange={(e) => setJumlahDonasi(e.target.value)}
                            disabled={isPaymentLoading}
                        />
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-success w-100 fw-bold py-3 rounded-pill shadow btn-lg"
                    onClick={handleDonasi} 
                    disabled={isPaymentLoading}
                  >
                    {isPaymentLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-heart-fill me-2"></i>}
                    {isPaymentLoading ? 'Memproses...' : 'DONASI SEKARANG'}
                  </button>
                  <p className="text-center text-muted small mt-3"><i className="bi bi-shield-lock-fill me-1 text-success"></i> Pembayaran via Midtrans (Aman)</p>
                </>
              ) : (
                <>
                  <h5 className="fw-bold mb-3 text-center">Status Pendaftaran</h5>
                  
                  <div className="text-center mb-4 p-3 bg-light rounded-3 border">
                     <h1 className="text-primary fw-bold mb-0">{Math.max(0, activity.target_peserta - activity.peserta_terdaftar)}</h1>
                     <p className="text-muted small mb-0 text-uppercase fw-bold">Sisa Kuota Relawan</p>
                  </div>
                  
                  <div className="d-flex justify-content-between small fw-bold mb-2 px-1">
                     <span>Terdaftar: <span className="text-primary">{activity.peserta_terdaftar}</span></span>
                     <span>Target: {activity.target_peserta}</span>
                  </div>
                  <div className="progress mb-4 shadow-sm" style={{ height: '10px', borderRadius: '10px', backgroundColor: '#e9ecef' }}>
                    <div className="progress-bar bg-primary" style={{ width: `${(activity.peserta_terdaftar / (activity.target_peserta || 1)) * 100}%` }}></div>
                  </div>

                  <ul className="list-unstyled mb-4 small text-secondary">
                      <li className="mb-2 d-flex align-items-center"><i className="bi bi-check-circle-fill text-success fs-5 me-2"></i> <span>Sertifikat Elektronik Resmi</span></li>
                      <li className="mb-2 d-flex align-items-center"><i className="bi bi-check-circle-fill text-success fs-5 me-2"></i> <span>Menambah Relasi & Pengalaman</span></li>
                  </ul>
                  
                  <button 
                    className={`btn w-100 fw-bold py-3 rounded-pill shadow btn-lg ${activity.peserta_terdaftar >= activity.target_peserta ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleRegisterVolunteer}
                    disabled={activity.peserta_terdaftar >= activity.target_peserta}
                  >
                    {activity.peserta_terdaftar >= activity.target_peserta ? 'KUOTA PENUH' : 'DAFTAR SEBAGAI RELAWAN'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ActivityDetail;