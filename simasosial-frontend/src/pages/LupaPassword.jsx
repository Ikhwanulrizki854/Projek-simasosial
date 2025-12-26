import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function LupaPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      Swal.fire('Email Terkirim', 'Cek inbox (atau spam) email Anda untuk link reset.', 'success');

    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="card shadow-sm border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-5">
          <h3 className="text-center fw-bold mb-3">Lupa Password?</h3>
          <p className="text-muted text-center mb-4">Masukkan email Anda, kami akan mengirimkan link untuk reset password.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email Terdaftar</label>
              <input 
                type="email" className="form-control" 
                value={email} onChange={(e) => setEmail(e.target.value)} 
                required placeholder="nama@student.fst.ac.id"
              />
            </div>
            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </div>
            <div className="text-center">
              <Link to="/login" className="text-decoration-none">Kembali ke Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LupaPassword;