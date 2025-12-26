import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [jurusan, setJurusan] = useState(''); 
  const [telepon, setTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setError(''); 
    setSuccess(''); 

    if (!nama || !nim || !email || !password || !jurusan) {
      setError('Semua field wajib diisi (kecuali No. Telepon).');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: nama,
          nim: nim,
          jurusan: jurusan,
          telepon: telepon,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registrasi gagal.');
      } else {
        setSuccess(data.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Tidak dapat terhubung ke server.');
    }
  };

  return (
    <main className="container-fluid d-flex vh-100 justify-content-center align-items-center">
      <div className="col-12 col-md-5 col-lg-4">
        <div className="card shadow-sm border-0" style={{ borderRadius: '1rem' }}>
          <div className="card-body p-4 p-lg-5">
            
            <form onSubmit={handleSubmit}>
              <h3 className="text-center fw-bold mb-2">Bergabung Bersama Kami</h3>
              <p className="text-center text-muted mb-4">Daftar untuk memulai kontribusi dari hati</p>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="mb-3">
                <label htmlFor="nama" className="form-label">Nama Lengkap</label>
                <input type="text" className="form-control" id="nama" placeholder="Masukkan nama lengkap"
                  value={nama} onChange={(e) => setNama(e.target.value)} />
              </div>

              <div className="mb-3">
                <label htmlFor="nim" className="form-label">NIM</label>
                <input type="text" className="form-control" id="nim" placeholder="Contoh: 2217020148"
                  value={nim} onChange={(e) => setNim(e.target.value)} />
              </div>

              <div className="mb-3">
                <label htmlFor="jurusan" className="form-label">Jurusan</label>
                <select className="form-select" id="jurusan" 
                  value={jurusan} onChange={(e) => setJurusan(e.target.value)}>
                  <option value="" disabled>Pilih Jurusan</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Matematika">Matematika</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="telepon" className="form-label">Nomor Telepon (Opsional)</label>
                <input type="tel" className="form-control" id="telepon" placeholder="08xxxxxxxxxx"
                  value={telepon} onChange={(e) => setTelepon(e.target.value)} />
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" placeholder="nama@student.fst.ac.id"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" placeholder="Masukkan password"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>

              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="tosCheck" required />
                <label className="form-check-label" htmlFor="tosCheck">
                  Saya setuju dengan Syarat & Ketentuan
                </label>
              </div>

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-warning btn-lg fw-bold text-white">Daftar Sekarang</button>
              </div>

              <p className="text-center text-muted">
                Sudah punya akun? <Link to="/login" className="text-decoration-none fw-bold">Login di sini</Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;