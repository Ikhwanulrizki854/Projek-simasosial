import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function VerifikasiEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token tidak ditemukan.');
      return;
    }

    // Panggil API Verifikasi
    fetch('http://localhost:8000/api/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
      if (status === 200) {
        setStatus('success');
        setMessage(body.message);
      } else {
        setStatus('error');
        setMessage(body.message);
      }
    })
    .catch(() => {
      setStatus('error');
      setMessage('Gagal terhubung ke server.');
    });
  }, [token]);

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="card shadow-sm border-0 text-center p-5" style={{ maxWidth: '500px' }}>
        {status === 'loading' && (
          <div>
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h4>Memverifikasi Email...</h4>
          </div>
        )}

        {status === 'success' && (
          <div>
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
            <h3 className="fw-bold mt-3">Verifikasi Berhasil!</h3>
            <p className="text-muted">{message}</p>
            <Link to="/login" className="btn btn-primary mt-3 px-4">Login Sekarang</Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
            <h3 className="fw-bold mt-3">Verifikasi Gagal</h3>
            <p className="text-muted">{message}</p>
            <Link to="/login" className="btn btn-outline-secondary mt-3">Kembali ke Login</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifikasiEmail;