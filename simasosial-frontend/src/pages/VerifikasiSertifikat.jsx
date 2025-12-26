import React, { useState } from 'react';
import Navbar from '../components/Navbar'; 
import { Html5Qrcode } from "html5-qrcode"; 
import Swal from 'sweetalert2';

// Komponen helper untuk format tanggal
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Helper menampilkan ID Kegiatan
const displayActivityId = (cert) => {
    const id = cert.kegiatan_id || cert.activity_id || cert.id_kegiatan;
    return id ? `#${id}` : '-';
};

function VerifikasiSertifikat() {
  const [kode, setKode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sertifikat, setSertifikat] = useState(null); 

  const handleVerifikasi = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSertifikat(null);

    if (!kode) {
      setError('Kode unik tidak boleh kosong.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/verify-certificate/${kode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verifikasi gagal.');
      }

      setSertifikat(data); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FITUR SCAN QR CODE DARI GAMBAR ---
  const handleScanFile = (e) => {
    if (e.target.files.length === 0) return;

    const imageFile = e.target.files[0];
    const html5QrCode = new Html5Qrcode("reader-hidden"); 

    Swal.fire({
        title: 'Memindai QR...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading() }
    });

    html5QrCode.scanFile(imageFile, true)
      .then(decodedText => {
        Swal.close();
        
        // --- LOGIKA PEMBERSIH URL  ---
        let finalCode = decodedText;

        // Cek apakah hasil scan mengandung URL?
        if (decodedText.includes('http') || decodedText.includes('https')) {
            try {
                const urlObj = new URL(decodedText);
                // Ambil nilai parameter 'kode' dari URL
                const codeParam = urlObj.searchParams.get("kode");
                if (codeParam) {
                    finalCode = codeParam;
                }
            } catch (err) {
                console.log("Gagal parsing URL, menggunakan text asli.");
            }
        }
        // ------------------------------------

        setKode(finalCode); 
        
        Swal.fire({
            icon: 'success',
            title: 'QR Code Terbaca!',
            text: `Kode: ${finalCode}`,
            timer: 1500,
            showConfirmButton: false
        });
      })
      .catch(err => {
        Swal.close();
        console.error("Error scanning file.", err);
        Swal.fire('Gagal', 'Tidak ditemukan QR Code yang valid pada gambar ini.', 'error');
      });
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navbar />

      {/* DUMMY DIV UNTUK LIBRARY QR */}
      <div id="reader-hidden" style={{ display: 'none' }}></div>

      <main className="container d-flex flex-column justify-content-center align-items-center flex-grow-1 py-5">
        
        <div className="col-12 col-md-8 col-lg-6">
          
          {/* HEADER SECTION */}
          <div className="text-center mb-5">
            <div className="bg-white d-inline-flex p-4 rounded-circle shadow-sm mb-3 align-items-center justify-content-center" style={{ width: '100px', height: '100px' }}>
                <i className="bi bi-patch-check-fill text-primary display-4"></i>
            </div>
            <h1 className="fw-bold text-dark display-6">Verifikasi Sertifikat</h1>
            <p className="text-muted lead fs-6">
              Scan QR Code pada sertifikat atau masukkan kode unik secara manual untuk mengecek validitas.
            </p>
            <div className="mx-auto mt-3 rounded" style={{ height: '4px', width: '60px', backgroundColor: '#0d6efd' }}></div>
          </div>

          {/* FORM CARD */}
          <div className="card shadow border-0 rounded-4 overflow-hidden mb-5">
            <div className="card-body p-4 p-md-5 bg-white">
              <form onSubmit={handleVerifikasi}>
                <label className="form-label fw-bold text-muted small text-uppercase ls-1 mb-3">Kode Unik Sertifikat</label>
                
                <div className="input-group input-group-lg shadow-sm rounded overflow-hidden">
                  <span className="input-group-text bg-white border-0 ps-3">
                      <i className="bi bi-upc-scan text-primary"></i>
                  </span>
                  
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 fw-bold text-dark" 
                    placeholder="Ketik kode atau upload QR ->" 
                    value={kode}
                    onChange={(e) => setKode(e.target.value)}
                    style={{ fontSize: '1rem', letterSpacing: '1px' }}
                  />

                  {/* TOMBOL UPLOAD QR */}
                  <input 
                    type="file" 
                    id="qr-upload" 
                    accept="image/*" 
                    onChange={handleScanFile} 
                    style={{ display: 'none' }} 
                  />
                  <button 
                    className="btn btn-outline-secondary border-0" 
                    type="button"
                    onClick={() => document.getElementById('qr-upload').click()}
                    title="Upload Gambar QR Code"
                  >
                    <i className="bi bi-qr-code-scan fs-4 text-dark"></i>
                  </button>

                  <button className="btn btn-primary px-4 fw-bold" type="submit" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <span>Cek <i className="bi bi-search ms-1"></i></span>
                    )}
                  </button>
                </div>
                <div className="form-text text-end mt-2 small fst-italic">
                    <i className="bi bi-info-circle me-1"></i> Klik ikon QR untuk scan otomatis dari gambar.
                </div>
              </form>
            </div>
          </div>

          {/* HASIL: ERROR */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center rounded-3 shadow-sm border-0 animate__animated animate__shakeX" role="alert">
              <div className="bg-danger bg-opacity-10 p-2 rounded-circle me-3">
                  <i className="bi bi-exclamation-triangle-fill fs-4 text-danger"></i>
              </div>
              <div>
                <strong className="d-block text-danger">Sertifikat Tidak Valid / Tidak Ditemukan</strong>
                <span className="small text-muted">{error}</span>
              </div>
            </div>
          )}
          
          {/* HASIL: SUKSES (VALID) */}
          {sertifikat && (
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden animate__animated animate__fadeInUp">
              <div className="card-header bg-success text-white text-center py-4 border-0">
                <div className="bg-white text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-check-lg display-6 fw-bold"></i>
                </div>
                <h4 className="fw-bold mt-2 mb-0">SERTIFIKAT VALID</h4>
                <small className="opacity-75">Data terverifikasi di sistem SIMASOSIAL FST</small>
              </div>

              <div className="card-body p-4 text-center bg-white position-relative">
                <i className="bi bi-patch-check-fill position-absolute text-success" style={{ fontSize: '10rem', opacity: '0.05', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></i>
                
                <p className="text-muted mb-1 small text-uppercase fw-bold letter-spacing-1">Diberikan Kepada</p>
                <h2 className="fw-bold text-dark mb-4">{sertifikat.nama_lengkap}</h2>
                
                <div className="bg-light rounded-3 p-4 text-start border">
                   <div className="mb-3">
                       <small className="text-muted d-block fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>Nama Kegiatan</small>
                       <span className="fs-5 fw-bold text-primary">{sertifikat.nama_kegiatan}</span>
                   </div>
                   
                   <div className="row g-3">
                       <div className="col-6">
                           <small className="text-muted d-block fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>Tanggal Terbit</small>
                           <span className="text-dark fw-bold"><i className="bi bi-calendar-check me-1 text-secondary"></i> {formatDate(sertifikat.tanggal_terbit)}</span>
                       </div>
                       <div className="col-6">
                           <small className="text-muted d-block fw-bold text-uppercase" style={{fontSize: '0.7rem'}}>ID Kegiatan</small>
                           <span className="font-monospace text-secondary bg-white px-2 py-1 rounded border">
                               {displayActivityId(sertifikat)}
                           </span>
                       </div>
                   </div>
                </div>

                <div className="mt-4">
                    <small className="text-muted fst-italic"><i className="bi bi-shield-check me-1"></i> Dokumen ini sah dan diterbitkan secara digital.</small>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-5 mt-auto" style={{ backgroundColor: '#010962ff', color: '#ffffffff' }}>
        <div className="container text-center">
          <p className="small mb-0">© 2025 SIMASOSIAL FST. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default VerifikasiSertifikat;