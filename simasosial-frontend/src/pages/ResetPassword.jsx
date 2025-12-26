import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

function ResetPassword() {
  const { token } = useParams(); 
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      Swal.fire('Error', 'Konfirmasi password tidak cocok.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      await Swal.fire('Berhasil!', 'Password Anda telah diubah. Silakan login.', 'success');
      navigate('/login');

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
          <h3 className="text-center fw-bold mb-4">Buat Password Baru</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Password Baru</label>
              <input 
                type="password" className="form-control" 
                value={password} onChange={(e) => setPassword(e.target.value)} 
                required minLength="6"
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Konfirmasi Password</label>
              <input 
                type="password" className="form-control" 
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                required minLength="6"
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Memproses...' : 'Ubah Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;