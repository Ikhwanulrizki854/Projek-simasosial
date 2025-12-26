import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper Format Rupiah
const formatCurrency = (number) => {
  if (!number) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// Helper Format Tanggal & Waktu
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + 
         date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

function AdminDashboard() {
  // Inisialisasi state awal agar tidak error saat render pertama
  const [stats, setStats] = useState({
    totalKegiatan: 0,
    totalUser: 0,
    donasiPending: 0,
    totalUangDonasi: 0,
    aktivitasTerbaru: [] 
  });
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const response = await fetch('http://localhost:8000/api/admin/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Gagal mengambil data statistik');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  // Fungsi Helper untuk Badge Status
  const renderBadge = (item) => {
    // 1. Jika ini aktivitas Relawan
    if (item.tipe_aktivitas === 'Relawan') {
        return <span className="badge bg-primary">Daftar Relawan</span>;
    }
    // 2. Jika ini aktivitas Donasi (Cek statusnya)
    switch(item.status) {
        case 'terverifikasi': return <span className="badge bg-success">Donasi Berhasil</span>;
        case 'pending': return <span className="badge bg-warning text-dark">Donasi Pending</span>;
        case 'gagal': return <span className="badge bg-danger">Gagal</span>;
        default: return <span className="badge bg-secondary">{item.status}</span>;
    }
  };

  if (loading) return <div className="p-5 text-center">Loading Dashboard...</div>;

  return (
    <div>
      <h2 className="fw-bold mb-4">Dashboard Admin</h2>

      {/* --- KARTU STATISTIK --- */}
      <div className="row mb-4">
        
        {/* Total Kegiatan */}
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-primary">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-bold">Kegiatan Aktif</div>
              <div className="fs-2 fw-bold text-primary">{stats.totalKegiatan}</div>
              <div className="small text-muted">Program sedang berjalan</div>
            </div>
          </div>
        </div>

        {/* Total Mahasiswa */}
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-success">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-bold">Total Relawan</div>
              <div className="fs-2 fw-bold text-success">{stats.totalUser}</div>
              <div className="small text-muted">Mahasiswa terdaftar</div>
            </div>
          </div>
        </div>

        {/* Donasi Pending */}
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-bold">Donasi Pending</div>
              <div className="fs-2 fw-bold text-warning">{stats.donasiPending}</div>
              <div className="small text-muted">Menunggu pembayaran</div>
            </div>
          </div>
        </div>

        {/* Total Uang Donasi */}
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100 border-start border-4 border-info">
            <div className="card-body">
              <div className="text-muted small text-uppercase fw-bold">Total Donasi</div>
              <div className="fs-3 fw-bold text-info">{formatCurrency(stats.totalUangDonasi)}</div>
              <div className="small text-muted">Dana terkumpul (Verified)</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABEL AKTIVITAS --- */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Aktivitas Pengguna Terbaru</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Pengguna</th>
                  <th>Kegiatan</th>
                  <th>Detail Aksi</th>
                  <th>Status/Tipe</th>
                  <th className="text-end pe-4">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {(!stats.aktivitasTerbaru || stats.aktivitasTerbaru.length === 0) ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">Belum ada aktivitas terbaru.</td></tr>
                ) : (
                  stats.aktivitasTerbaru.map((item, index) => (
                    <tr key={index}>
                      <td className="ps-4 fw-bold">{item.nama_lengkap}</td>
                      <td><small>{item.nama_kegiatan}</small></td>
                      <td>
                         {/* Logika Tampilan: Jika Donasi tampilkan Uang, Jika Relawan tampilkan Teks */}
                         {item.tipe_aktivitas === 'Donasi' ? (
                             <span className="fw-bold text-dark">
                                {formatCurrency(item.info_tambahan)}
                             </span>
                         ) : (
                             <span className="text-muted fst-italic">
                                <i className="bi bi-person-raised-hand me-1"></i> Mendaftar Volunteer
                             </span>
                         )}
                      </td>
                      <td>{renderBadge(item)}</td>
                      <td className="text-end pe-4 small text-muted">
                        {formatDateTime(item.waktu)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white text-center py-3">
          <small className="text-muted">Menampilkan 5 aktivitas terakhir (Donasi & Relawan)</small>
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;