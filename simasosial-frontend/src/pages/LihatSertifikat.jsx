import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from "react-qr-code";

function LihatSertifikat() {
  const { kodeUnik } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/verify-certificate/${kodeUnik}`)
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(err => console.error(err));
  }, [kodeUnik]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (!data) return <div className="text-center p-5">Memuat Sertifikat...</div>;

  return (
    <div className="container-fluid p-0">
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@300;400;500&display=swap');

          /* Tampilan Layar (Preview) */
          .preview-wrapper {
            padding: 40px;
            background-color: #f0f4f9;
            display: flex;
            justify-content: center;
            min-height: 100vh;
            align-items: center;
          }

          /* Kotak Sertifikat Utama */
          .certificate-box {
            width: 297mm; 
            height: 210mm; 
            background-color: white;
            position: relative;
            color: #333;
            font-family: 'Times New Roman', serif;
            padding: 10mm; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            box-sizing: border-box;
          }

          /* Bingkai Ganda */
          .border-outer {
            border: 5px solid #0d47a1; /* Biru Tua */
            height: 100%;
            padding: 3px;
          }
          
          .border-inner {
            border: 2px solid #d4af37; /* Emas */
            height: 100%;
            padding: 5mm 15mm; /* Padding dikurangi agar muat banyak */
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background-image: radial-gradient(circle, #fff 0%, #fdfdfd 100%);
          }

          /* Font Styles (DIPERKECIL) */
          .cert-title {
            font-family: 'Playfair Display', serif;
            font-size: 30pt; /* Dikecilkan dari 36pt */
            color: #d4af37;
            text-transform: uppercase;
            letter-spacing: 4px;
            font-weight: 700;
            margin-bottom: 2px;
          }
          .cert-name {
            font-family: 'Playfair Display', serif;
            font-size: 32pt; /* Dikecilkan dari 38pt */
            font-weight: 700;
            color: #0d47a1;
            margin: 5px 0;
            border-bottom: 1px solid #ccc;
            display: inline-block;
            padding: 0 20px 5px 20px;
          }
          .cert-body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt; /* Dikecilkan dari 14pt */
            line-height: 1.5;
            margin: 10px 0;
          }
          .cert-event {
            font-weight: bold;
            font-size: 18pt; /* Dikecilkan dari 20pt */
            color: #333;
            margin: 5px 0;
          }

          /* PRINT SETTINGS KHUSUS */
          @media print {
            @page { size: A4 landscape; margin: 0; }
            body, html { margin: 0; padding: 0; height: 100%; width: 100%; background-color: white; }
            .no-print { display: none !important; }
            .preview-wrapper { padding: 0; background: white; display: block; }
            .certificate-box { box-shadow: none; margin: 0; page-break-after: always; }
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
        `}
      </style>

      {/* Tombol Print */}
      <div className="text-center py-4 no-print fixed-top" style={{background: 'rgba(255,255,255,0.9)', borderBottom: '1px solid #ddd'}}>
        <button onClick={() => window.print()} className="btn btn-success btn-lg shadow me-2">
          <i className="bi bi-printer me-2"></i> Cetak / Simpan PDF
        </button>
        <Link to="/sertifikat-saya" className="btn btn-outline-secondary btn-lg">
          Kembali
        </Link>
      </div>

      <div className="preview-wrapper">
        <div className="certificate-box">
          <div className="border-outer">
            <div className="border-inner">
              
              {/* HEADER */}
              <div className="text-center">
                <img 
                  src="/Logo.png" 
                  alt="Logo" 
                  style={{ height: '60px', marginBottom: '5px' }} 
                  onError={(e) => e.target.style.display = 'none'}
                />

                <h1 className="cert-title">Sertifikat Penghargaan</h1>
                <p style={{fontSize: '9pt', color: '#666', letterSpacing: '2px', textTransform: 'uppercase'}}>
                  Nomor: {data.kode_unik}
                </p>
              </div>

              {/* BODY */}
              <div className="text-center">
                <p className="fs-6 mb-0" style={{fontFamily: 'Times New Roman'}}>Diberikan kepada:</p>
                
                <div className="cert-name">{data.nama_lengkap}</div>
                <p className="fs-6 mb-0">NIM: {data.nim}</p>

                <div className="cert-body">
                  <p className="mb-1">
                    Atas dedikasi dan partisipasinya yang luar biasa sebagai <b>Relawan</b> <br/>
                    dalam kegiatan sosial:
                  </p>
                  <div className="cert-event">"{data.nama_kegiatan}"</div>
                  <p className="mt-1 mb-0">
                    Diselenggarakan di <b>{data.lokasi || 'Padang'}</b> pada tanggal <b>{formatDate(data.tanggal_mulai)}</b>.
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="d-flex justify-content-between align-items-end px-4">
                
                {/* QR Code */}
                <div className="text-center" style={{width: '120px'}}>
                  <div style={{ padding: '4px', background: 'white', border: '1px solid #eee', display: 'inline-block' }}>
                     <QRCode 
                        value={`http://localhost:5173/verifikasi?kode=${data.kode_unik}`} 
                        size={70} 
                     />
                  </div>
                  <p style={{fontSize: '8pt', marginTop: '2px', color: '#888'}}>Scan validasi</p>
                </div>

                {/* Tanda Tangan */}
                <div className="text-center" style={{ width: '220px' }}>
                  <p className="mb-0" style={{fontSize: '11pt'}}>Padang, {formatDate(data.tanggal_terbit)}</p>
                  <p className="fw-bold mb-0" style={{fontSize: '10pt'}}>Ketua Himpunan Mahasiswa</p>
                  
                  {/* Area Tanda Tangan */}
                  <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src="/Tanda Tangan Contoh.png" 
                      alt="Tanda Tangan" 
                      style={{ maxHeight: '60px', maxWidth: '100%' }} 
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                  </div>

                  <div style={{ borderBottom: '1px solid #333', marginBottom: '2px' }}></div>
                  <h5 className="fw-bold mb-0" style={{fontSize: '11pt'}}>Imam Yaasir Khairullah</h5>
                  <p className="small text-muted mb-0" style={{fontSize: '9pt'}}>NIM. 2217020167</p>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LihatSertifikat;