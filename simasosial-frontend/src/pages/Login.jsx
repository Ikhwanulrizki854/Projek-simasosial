import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // STATE (SHOW/HIDE PASSWORD)
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault(); 
    setError(''); 
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login gagal.');
      } else {
        // Simpan token DAN role
        localStorage.setItem('token', data.token); 
        localStorage.setItem('role', data.role);

        // Arahkan pengguna berdasarkan role
        if (data.role === 'admin') {
          navigate('/admin/dashboard'); 
        } else {
          navigate('/');
        }
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-fluid d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="col-12 col-md-5 col-lg-4">
        <div className="card shadow-sm border-0" style={{ borderRadius: '1rem' }}>
          <div className="card-body p-4 p-lg-5">
            
            <form onSubmit={handleLogin}> 
              <h3 className="text-center fw-bold mb-2">Selamat Datang Kembali</h3>
              <p className="text-center text-muted mb-4">Masuk untuk melanjutkan kegiatan sosial Anda</p>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-control form-control-lg" 
                  id="email" 
                  placeholder="nama@student.fst.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* FORM PASSWORD DENGAN ICON MATA */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-group">
                  <input 
                    // Ubah tipe berdasarkan state showPassword
                    type={showPassword ? "text" : "password"} 
                    className="form-control form-control-lg border-end-0" 
                    id="password" 
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="btn btn-light border border-start-0" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ zIndex: 0 }}
                  >
                    {/* Ganti ikon mata berdasarkan state */}
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="text-end mb-3">
                <Link to="/lupa-password" class="text-decoration-none">Lupa Password?</Link>
              </div>

              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-warning btn-lg fw-bold text-white" disabled={loading}>
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </div>

              <p className="text-center text-muted">
                Belum punya akun? <Link to="/register" className="text-decoration-none fw-bold">Daftar di sini</Link>
              </p>
              <p className="text-center mt-4">
                <Link to="/" className="text-decoration-none">← Kembali ke Beranda</Link>
              </p>
            </form>

          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;