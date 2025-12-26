import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2'; // Pastikan import Swal

function EditKegiatan() {
  const { id: activityId } = useParams();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('detail');
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
  const [gambarLama, setGambarLama] = useState('');

  const [participants, setParticipants] = useState([]);
  const [loadingPeserta, setLoadingPeserta] = useState(false);
  
  // State Loading Tombol Export
  const [exportingExcel, setExportingExcel] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Detail
  const fetchActivityDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/activities/${activityId}`);
      if (!response.ok) throw new Error('Gagal mengambil data.');
      const data = await response.json();
      
      setJudul(data.judul);
      setTipe(data.tipe);
      setStatus(data.status || 'published');
      setDeskripsi(data.deskripsi || '');
      setLokasi(data.lokasi || '');
      setTanggalMulai(data.tanggal_mulai ? new Date(data.tanggal_mulai).toISOString().split('T')[0] : '');
      setTargetDonasi(data.target_donasi || 0);
      setTargetPeserta(data.target_peserta || 0);
      setJamKontribusi(data.jam_kontribusi || 0);
      setGambarLama(data.gambar_url || '');
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchParticipants = async () => {
    setLoadingPeserta(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/admin/activities/${activityId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal memuat peserta');
      const data = await res.json();
      setParticipants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingPeserta(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'detail') fetchActivityDetails();
    else if (activeTab === 'peserta') fetchParticipants();
  }, [activityId, activeTab]);

  const handleFileChange = (e) => setGambar(e.target.files[0]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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
    if (gambar) formData.append('gambar', gambar);

    try {
      const response = await fetch(`http://localhost:8000/api/admin/activities/${activityId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error('Gagal update');
      setSuccess('Berhasil diupdate!');
      setTimeout(() => navigate('/admin/manajemen-kegiatan'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (registration_id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8000/api/admin/participants/${registration_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newStatus })
      });
      setParticipants(prev => prev.map(p => p.registration_id === registration_id ? { ...p, status_kehadiran: newStatus } : p));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateCertificates = async () => {
    // Cek apakah ada yang hadir
    const hadirCount = participants.filter(p => p.status_kehadiran === 'hadir').length;
    if (hadirCount === 0) {
        Swal.fire('Info', 'Belum ada peserta yang berstatus HADIR.', 'info');
        return;
    }

    const result = await Swal.fire({
        title: 'Terbitkan Sertifikat?',
        text: `Sertifikat akan diterbitkan untuk ${hadirCount} peserta yang HADIR via Email & Notifikasi.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Terbitkan!'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/admin/activities/${activityId}/generate-certificates`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      Swal.fire('Sukses', data.message, 'success');
      setSuccess(data.message);
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 1. EXPORT EXCEL (SEMUA DATA) ---
  const handleExportExcel = async () => {
    setExportingExcel(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/activities/${activityId}/export-participants-excel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal export Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Peserta_Kegiatan_${activityId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    } finally {
      setExportingExcel(false);
    }
  };

  // --- 2. EXPORT PDF (SEMUA DATA) ---
  const handleExportPDF = () => {
    if (participants.length === 0) {
      Swal.fire('Info', 'Tidak ada peserta untuk diexport!', 'info');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Daftar Semua Peserta: ${judul}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);

    const tableColumn = ["No", "Nama Lengkap", "NIM", "Email", "Status"];
    const tableRows = [];

    participants.forEach((p, index) => {
      const rowData = [index + 1, p.nama_lengkap, p.nim, p.email, p.status_kehadiran];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn], body: tableRows, startY: 35, theme: 'grid',
      headStyles: { fillColor: [100, 100, 100] } // Abu-abu
    });

    doc.save(`Semua_Peserta_${judul}.pdf`);
  };

  // --- 3. EXPORT PDF KHUSUS PENERIMA SERTIFIKAT ---
  const handleExportSertifikatPDF = () => {
    // Filter hanya yang statusnya HADIR
    const receivers = participants.filter(p => p.status_kehadiran === 'hadir');

    if (receivers.length === 0) {
      Swal.fire('Info', 'Belum ada peserta berstatus HADIR (Penerima Sertifikat).', 'warning');
      return;
    }

    const doc = new jsPDF();

    // Header Laporan Resmi
    doc.setFontSize(16);
    doc.text("BERITA ACARA PENERIMA SERTIFIKAT", 105, 20, null, null, "center");
    
    doc.setFontSize(11);
    doc.text(`Nama Kegiatan : ${judul}`, 14, 35);
    doc.text(`Tanggal Cetak : ${new Date().toLocaleDateString('id-ID')}`, 14, 42);
    doc.text(`Total Penerima: ${receivers.length} Orang`, 14, 49);

    const tableColumn = ["No", "Nama Penerima", "NIM", "Email", "Keterangan"];
    const tableRows = [];

    receivers.forEach((p, index) => {
      const rowData = [
        index + 1,
        p.nama_lengkap,
        p.nim,
        p.email,
        "Sertifikat Terbit"
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }, 
      styles: { fontSize: 10 }
    });

    // Tanda Tangan Admin 
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.text("Mengetahui,", 140, finalY);
    doc.text("Admin SIMASOSIAL", 140, finalY + 25);

    doc.save(`Laporan_Penerima_Sertifikat_${judul}.pdf`);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Edit Kegiatan</h1>
        <Link to="/admin/manajemen-kegiatan" className="btn btn-outline-secondary">Kembali</Link>
      </div>
      
      <ul className="nav nav-tabs nav-fill mb-4">
        <li className="nav-item">
          <button className={`nav-link fs-5 ${activeTab === 'detail' ? 'active' : ''}`} onClick={() => setActiveTab('detail')}>Detail Kegiatan</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link fs-5 ${activeTab === 'peserta' ? 'active' : ''}`} onClick={() => setActiveTab('peserta')}>Peserta & Sertifikat</button>
        </li>
      </ul>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          
          {activeTab === 'detail' && (
            <form onSubmit={handleEditSubmit}>
              <div className="mb-3"><label className="fw-bold">Judul</label><input type="text" className="form-control" value={judul} onChange={e => setJudul(e.target.value)} required /></div>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="fw-bold">Tipe</label>
                    <select className="form-select" value={tipe} onChange={e => setTipe(e.target.value)}>
                        <option value="donasi">Donasi</option>
                        <option value="volunteer">Volunteer</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="fw-bold">Status</label>
                    <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="published">Published (Tayang)</option>
                        <option value="draft">Draft (Sembunyikan)</option>
                        <option value="selesai">Selesai</option>
                    </select>
                </div>
              </div>

              <div className="mb-3"><label className="fw-bold">Deskripsi</label><textarea className="form-control" rows="4" value={deskripsi} onChange={e => setDeskripsi(e.target.value)}></textarea></div>
              <div className="row">
                <div className="col-md-6 mb-3"><label className="fw-bold">Lokasi</label><input type="text" className="form-control" value={lokasi} onChange={e => setLokasi(e.target.value)} /></div>
                <div className="col-md-6 mb-3"><label className="fw-bold">Tanggal</label><input type="date" className="form-control" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)} required /></div>
              </div>
              
              {tipe === 'donasi' ? (
                <div className="mb-3"><label className="fw-bold">Target Dana</label><input type="number" className="form-control" value={targetDonasi} onChange={e => setTargetDonasi(e.target.value)} /></div>
              ) : (
                <div className="row">
                  <div className="col-md-6 mb-3"><label className="fw-bold">Target Peserta</label><input type="number" className="form-control" value={targetPeserta} onChange={e => setTargetPeserta(e.target.value)} /></div>
                  <div className="col-md-6 mb-3"><label className="fw-bold">Jam Kontribusi</label><input type="number" step="0.5" className="form-control" value={jamKontribusi} onChange={e => setJamKontribusi(e.target.value)} /></div>
                </div>
              )}
              <div className="mb-3"><label className="fw-bold">Gambar Baru</label><input type="file" className="form-control" onChange={handleFileChange} /></div>
              <button type="submit" className="btn btn-primary float-end" disabled={loading}>Simpan Perubahan</button>
            </form>
          )}

          {/* TAB 2: PESERTA */}
          {activeTab === 'peserta' && (
            <div>
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <h4 className="fw-bold mb-0">Daftar Peserta</h4>
                
                {/* CONTAINER TOMBOL AKSI */}
                <div className="d-flex flex-wrap gap-2">
                  
                   {/* GROUP 1: EXPORT DATA */}
                  <div className="btn-group">
                    <button className="btn btn-outline-danger" onClick={handleExportPDF} title="Download Semua Peserta">
                        <i className="bi bi-file-pdf"></i> All PDF
                    </button>
                    <button className="btn btn-outline-success" onClick={handleExportExcel} disabled={exportingExcel} title="Download Excel">
                        <i className="bi bi-file-excel"></i> Excel
                    </button>
                  </div>

                   {/* GROUP 2: SERTIFIKAT */}
                   <div className="d-flex gap-2 border-start ps-2">
                        {/* Tombol Laporan Sertifikat */}
                        <button className="btn btn-warning text-dark fw-bold" onClick={handleExportSertifikatPDF} title="Cetak Laporan Penerima">
                            <i className="bi bi-printer-fill me-1"></i> Lap. Sertifikat
                        </button>

                        {/* Tombol Terbitkan */}
                        <button className="btn btn-primary" onClick={handleGenerateCertificates} disabled={loading}>
                            <i className="bi bi-patch-check-fill me-1"></i> Terbitkan
                        </button>
                   </div>
                </div>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead className="table-light"><tr><th>Nama</th><th>NIM</th><th>Email</th><th>Status Kehadiran</th></tr></thead>
                    <tbody>
                    {participants.length === 0 ? (
                        <tr><td colSpan="4" className="text-center text-muted py-4">Belum ada peserta terdaftar.</td></tr>
                    ) : (
                        participants.map(p => (
                        <tr key={p.registration_id}>
                            <td>{p.nama_lengkap}</td><td>{p.nim}</td><td>{p.email}</td>
                            <td>
                            <select 
                                className={`form-select form-select-sm fw-bold ${
                                    p.status_kehadiran === 'hadir' ? 'border-success text-success' : 
                                    p.status_kehadiran === 'absen' ? 'border-danger text-danger' : 'border-secondary'
                                }`} 
                                value={p.status_kehadiran} 
                                onChange={e => handleStatusChange(p.registration_id, e.target.value)}
                            >
                                <option value="terdaftar">Terdaftar</option>
                                <option value="hadir">Hadir (Dapat Sertifikat)</option>
                                <option value="absen">Absen</option>
                            </select>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditKegiatan;