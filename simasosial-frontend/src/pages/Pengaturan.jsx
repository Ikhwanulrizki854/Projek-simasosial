import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Pengaturan() {
  const [activeTab, setActiveTab] = useState('profil');
  const navigate = useNavigate();

  // State Profil
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Fetch Profil Saat Ini
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:8000/api/admin/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Gagal memuat profil');
        const data = await res.json();
        setNama(data.nama_lengkap);
        setEmail(data.email);
        setTelepon(data.no_telepon || '');
      } catch (err) {
        console.error(err);
      }
    };
    if (activeTab === 'profil') fetchProfile();
  }, [activeTab]);

  // Handle Update Profil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_lengkap: nama,
          email: email,
          no_telepon: telepon,
          password_baru: passwordBaru || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Swal.fire('Sukses', data.message, 'success');
      setPasswordBaru('');
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Test Email
  const handleTestEmail = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/admin/email/test', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      Swal.fire('Terkirim!', data.message, 'success');
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="fw-bold mb-4">Pengaturan</h1>
      <ul className="nav nav-tabs nav-fill mb-4">
        <li className="nav-item">
          <button className={`nav-link fs-5 ${activeTab === 'profil' ? 'active' : ''}`} onClick={() => setActiveTab('profil')}>Profil Admin</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fs-5 ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>Email</button>
        </li>
      </ul>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">

          {/* TAB PROFIL */}
          {activeTab === 'profil' && (
            <form onSubmit={handleProfileSubmit}>
              <h4 className="fw-bold mb-3">Informasi Profil Admin</h4>
              <div className="mb-3"><label className="form-label">Nama Lengkap</label><input type="text" className="form-control" value={nama} onChange={(e) => setNama(e.target.value)} required /></div>
              <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="mb-3"><label className="form-label">No. Telephone</label><input type="tel" className="form-control" value={telepon} onChange={(e) => setTelepon(e.target.value)} /></div>
              <hr className="my-4" />
              <h5 className="fw-bold">Ganti Password</h5>
              <div className="mb-3"><label className="form-label">Password Baru</label><input type="password" className="form-control" value={passwordBaru} onChange={(e) => setPasswordBaru(e.target.value)} placeholder="(Kosongkan jika tidak ingin ganti)" /></div>
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
              </div>
            </form>
          )}

          {/* TAB EMAIL */}
          {activeTab === 'email' && (
            <div className="text-center py-4">
              <i className="bi bi-envelope-check-fill text-success" style={{ fontSize: '4rem' }}></i>
              <h4 className="fw-bold mt-3 mb-3">Konfigurasi Email</h4>
              <p className="text-muted mb-4">
                Sistem menggunakan Nodemailer dengan akun yang telah dikonfigurasi di server.
              </p>
              
              <div className="alert alert-info d-inline-block text-start">
                <strong>Info:</strong> Klik tombol di bawah untuk mengirim email tes ke alamat email Anda sendiri.<br/>
                Ini memastikan fitur notifikasi dan lupa password berjalan lancar.
              </div>
              <br/><br/>

              <button className="btn btn-lg btn-success" onClick={handleTestEmail} disabled={loading}>
                {loading ? 'Mengirim...' : <><i className="bi bi-send-fill me-2"></i> Kirim Email Tes</>}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Pengaturan;