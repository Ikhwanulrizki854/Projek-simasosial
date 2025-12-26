import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  return (
    <main className="container-fluid d-flex vh-100 justify-content-center align-items-center">
      <div className="col-12 col-md-5 col-lg-4">
        
        {/* Menggunakan komponen "Card" dari Bootstrap */}
        <div className="card shadow-sm border-0" style={{ borderRadius: '1rem' }}>
          <div className="card-body p-4 p-lg-5">
            
            <form>
              {/* Judul */}
              <h3 className="text-center fw-bold mb-2">Selamat Datang Kembali</h3>
              <p className="text-center text-muted mb-4">Masuk untuk melanjutkan kegiatan sosial Anda</p>

              {/* Form Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control form-control-lg" id="email" placeholder="nama@student.fst.ac.id" />
              </div>

              {/* Form Password */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control form-control-lg" id="password" placeholder="Masukkan password" />
              </div>
              
              {/* Link Lupa Password */}
              <div className="text-end mb-3">
                <a href="#" className="text-decoration-none">Lupa Password?</a>
              </div>

              {/* Tombol Masuk */}
              <div className="d-grid mb-3">
                <button type="submit" className="btn btn-warning btn-lg fw-bold text-white">Masuk</button>
              </div>

              {/* Link Daftar */}
              <p className="text-center text-muted">
                Belum punya akun? <a href="#" className="text-decoration-none fw-bold">Daftar di sini</a>
              </p>

              {/* Link Kembali ke Beranda */}
              <p className="text-center mt-4">
                <a href="#" className="text-decoration-none">← Kembali ke Beranda</a>
              </p>

            </form>

          </div>
        </div>

      </div>
    </main>
  );
}

export default App
