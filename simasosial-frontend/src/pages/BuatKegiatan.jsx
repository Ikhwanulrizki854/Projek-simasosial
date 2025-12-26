import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function BuatKegiatan() {
  const [judul, setJudul] = useState('');
  const [tipe, setTipe] = useState('donasi'); 
  const [status, setStatus] = useState('published');
  const [deskripsi, setDeskripsi] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [targetDonasi, setTargetDonasi] = useState(0);
  const [targetPeserta, setTargetPeserta] = useState(0);
  const [jamKontribusi, setJamKontribusi] = useState(0); 
  const [gambar, setGambar] = useState(null); 

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setGambar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDASI INPUT (Mencegah Error)
    if (tipe === 'donasi' && targetDonasi < 0) {
      Swal.fire('Error', 'Target Dana tidak boleh negatif!', 'warning');
      return;
    }
    if (tipe === 'volunteer') {
      if (targetPeserta < 0) {
        Swal.fire('Error', 'Target Peserta tidak boleh negatif!', 'warning');
        return;
      }
      if (jamKontribusi < 0) {
        Swal.fire('Error', 'Jam Kontribusi tidak boleh negatif!', 'warning');
        return;
      }
    }
    if (!judul || !tanggalMulai) {
        Swal.fire('Error', 'Judul dan Tanggal wajib diisi!', 'warning');
        return;
    }

    setLoading(true);

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('tipe', tipe);
    formData.append('status', status);
    formData.append('deskripsi', deskripsi);
    formData.append('lokasi', lokasi);
    formData.append('tanggal_mulai', tanggalMulai);
    formData.append('target_donasi', tipe === 'donasi' ? targetDonasi : 0);
    formData.append('target_peserta', tipe === 'volunteer' ? targetPeserta : 0);
    formData.append('jam_kontribusi', jamKontribusi); 

    if (gambar) {
      formData.append('gambar', gambar);
    }

    try {
      const response = await fetch('http://localhost:8000/api/admin/activities', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Gagal menyimpan data.');
      }

      // Sukses dengan SweetAlert
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kegiatan baru telah ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/admin/manajemen-kegiatan');

    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Buat Kegiatan Baru</h1>
        <Link to="/admin/manajemen-kegiatan" className="btn btn-outline-secondary">
          Batal
        </Link>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            <div className="mb-3">
              <label className="fw-bold">Judul Kegiatan*</label>
              <input type="text" className="form-control" value={judul} onChange={(e) => setJudul(e.target.value)} required />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="fw-bold">Jenis Kegiatan*</label>
                <select className="form-select" value={tipe} onChange={(e) => setTipe(e.target.value)}>
                  <option value="donasi">Donasi</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="fw-bold">Status*</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="published">Published (Tayang)</option>
                  <option value="draft">Draft (Sembunyikan)</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="fw-bold">Deskripsi</label>
              <textarea className="form-control" rows="5" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)}></textarea>
            </div>

            <div className="mb-3">
              <label className="fw-bold">Upload Gambar</label>
              <input type="file" className="form-control" onChange={handleFileChange} />
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="fw-bold">Lokasi</label>
                <input type="text" className="form-control" value={lokasi} onChange={(e) => setLokasi(e.target.value)} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="fw-bold">Tanggal Mulai*</label>
                <input type="date" className="form-control" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} required />
              </div>
            </div>
            
            {tipe === 'donasi' ? (
              <div className="mb-3">
                <label className="fw-bold">Target Dana (Rp)</label>
                <input type="number" className="form-control" value={targetDonasi} onChange={(e) => setTargetDonasi(e.target.value)} placeholder="Contoh: 5000000" />
                <small className="text-muted">Masukkan angka positif.</small>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="fw-bold">Target Peserta</label>
                  <input type="number" className="form-control" value={targetPeserta} onChange={(e) => setTargetPeserta(e.target.value)} placeholder="Contoh: 50" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="fw-bold">Jam Kontribusi</label>
                  <input type="number" step="0.5" className="form-control" value={jamKontribusi} onChange={(e) => setJamKontribusi(e.target.value)} placeholder="Contoh: 8" />
                </div>
              </div>
            )}
            
            <div className="d-flex justify-content-end mt-4">
              <Link to="/admin/manajemen-kegiatan" className="btn btn-outline-secondary me-2">Batal</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                   <span><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</span>
                ) : 'Simpan Kegiatan'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}

export default BuatKegiatan;