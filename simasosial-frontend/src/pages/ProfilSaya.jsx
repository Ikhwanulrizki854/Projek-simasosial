import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

function ProfilSaya() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [nim, setNim] = useState(''); 
  const [jurusan, setJurusan] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:8000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Gagal memuat profil');
        const data = await res.json();
        
        setNama(data.nama_lengkap);
        setEmail(data.email);
        setTelepon(data.no_telepon || '');
        setNim(data.nim);
        setJurusan(data.jurusan);
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:8000/api/profile', {
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

  // Helper untuk mendapatkan inisial nama
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="container py-5 flex-grow-1">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            
            {/* KARTU PROFIL UTAMA */}
            <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '15px' }}>
              
              {/* HEADER BACKGROUND */}
              <div className="bg-primary p-4 text-center text-white" style={{ background: 'linear-gradient(45deg, #0d47a1, #42a5f5)' }}>
                  <div className="bg-white text-primary rounded-circle mx-auto d-flex align-items-center justify-content-center fw-bold shadow" 
                       style={{ width: '100px', height: '100px', fontSize: '2.5rem', border: '4px solid rgba(255,255,255,0.3)' }}>
                      {getInitials(nama)}
                  </div>
                  <h3 className="mt-3 fw-bold">{nama || 'Mahasiswa'}</h3>
                  <p className="mb-0 opacity-75">{jurusan} - {nim}</p>
              </div>

              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  
                  {/* SECTION 1: INFO AKADEMIK (READ ONLY) */}
                  <h6 className="text-uppercase text-muted fw-bold mb-3 small"><i className="bi bi-mortarboard-fill me-2"></i>Info Akademik</h6>
                  <div className="row mb-4 bg-light p-3 rounded mx-0">
                    <div className="col-md-6 mb-3 mb-md-0">
                       <label className="form-label text-muted small fw-bold">NIM (Nomor Induk Mahasiswa)</label>
                       <div className="input-group">
                           <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-card-heading"></i></span>
                           <input type="text" className="form-control bg-white border-start-0 fw-bold text-dark" value={nim} disabled />
                       </div>
                    </div>
                    <div className="col-md-6">
                       <label className="form-label text-muted small fw-bold">Jurusan / Prodi</label>
                       <div className="input-group">
                           <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-book"></i></span>
                           <input type="text" className="form-control bg-white border-start-0 fw-bold text-dark" value={jurusan} disabled />
                       </div>
                    </div>
                  </div>

                  <hr className="my-4 opacity-10"/>

                  {/* SECTION 2: DATA PRIBADI (EDITABLE) */}
                  <h6 className="text-uppercase text-muted fw-bold mb-3 small"><i className="bi bi-person-lines-fill me-2"></i>Data Pribadi</h6>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Nama Lengkap</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white text-muted"><i className="bi bi-person"></i></span>
                        <input type="text" className="form-control" value={nama} onChange={(e) => setNama(e.target.value)} required />
                    </div>
                  </div>

                  <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Email</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white text-muted"><i className="bi bi-envelope"></i></span>
                            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">WhatsApp / Telepon</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white text-muted"><i className="bi bi-whatsapp"></i></span>
                            <input type="text" className="form-control" value={telepon} onChange={(e) => setTelepon(e.target.value)} placeholder="08xxxxxxxx" />
                        </div>
                      </div>
                  </div>

                  <hr className="my-4 opacity-10"/>

                  {/* SECTION 3: KEAMANAN */}
                  <h6 className="text-uppercase text-muted fw-bold mb-3 small"><i className="bi bi-shield-lock-fill me-2"></i>Keamanan Akun</h6>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Ganti Password Baru</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white text-muted"><i className="bi bi-key"></i></span>
                        <input 
                          type="password" 
                          className="form-control" 
                          value={passwordBaru} 
                          onChange={(e) => setPasswordBaru(e.target.value)} 
                          placeholder="Kosongkan jika tidak ingin mengganti" 
                        />
                    </div>
                    <div className="form-text text-muted small ps-1">
                        *Biarkan kosong jika Anda tidak ingin mengubah password saat ini.
                    </div>
                  </div>

                  <div className="d-grid mt-5">
                    <button type="submit" className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm" disabled={loading}>
                      {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                      {loading ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
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

export default ProfilSaya;