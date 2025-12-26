import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const ManajemenDonasi = () => {
  const [donasiList, setDonasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Filter
  const [filterStatus, setFilterStatus] = useState(''); 
  const [filterActivity, setFilterActivity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');     

  // Fungsi mengambil data dari Backend
  const fetchDonations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); 
      
      // Menggunakan Bearer Token 
      const response = await fetch('http://localhost:8000/api/admin/donations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDonasiList(data);
      } else {
        console.error("Gagal mengambil data. Status:", response.status);
      }
    } catch (error) {
      console.error("Error koneksi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // --- LOGIKA FILTERING ---
  const uniqueActivities = [...new Set(donasiList.map(item => item.nama_kegiatan))];

  const filteredData = donasiList.filter(item => {
    const matchSearch = item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus ? item.status_donasi === filterStatus : true;
    const matchActivity = filterActivity ? item.nama_kegiatan === filterActivity : true;
    return matchSearch && matchStatus && matchActivity;
  });

  // --- FORMATTER ---
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const formatRupiah = (angka) => {
    return parseInt(angka).toLocaleString('id-ID');
  };

  // --- FUNGSI EXPORT PDF ---
  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    const doc = new jsPDF();

    // Header PDF
    doc.text("Laporan Riwayat Donasi - SIMASOSIAL FST", 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);

    // Persiapan Data Tabel
    const tableColumn = ["No", "Nama Donatur", "Kegiatan", "Tanggal", "Jumlah (Rp)", "Status"];
    const tableRows = [];

    filteredData.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.nama_lengkap,
        item.nama_kegiatan,
        formatDate(item.tanggal_donasi),
        formatRupiah(item.jumlah),
        item.status_donasi
      ];
      tableRows.push(rowData);
    });

    // Generate Tabel (Menggunakan variabel autoTable)
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [13, 71, 161] } // Biru header
    });

    // Simpan File
    doc.save("Laporan_Donasi_SIMASOSIAL.pdf");
  };

  // Badge Warna Status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'terverifikasi':
      case 'settlement':
        return <span className="badge bg-success">Berhasil</span>;
      case 'pending':
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 'expire':
      case 'cancel':
      case 'gagal':
        return <span className="badge bg-danger">Gagal</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Manajemen Donasi</h2>
        
        <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={fetchDonations}>
                <i className="bi bi-arrow-clockwise me-2"></i>Refresh
            </button>
            {/* Tombol Export PDF */}
            <button className="btn btn-danger" onClick={handleExportPDF}>
                <i className="bi bi-file-earmark-pdf me-2"></i>Export PDF
            </button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          
          {/* --- FILTER BAR --- */}
          <div className="row mb-3 g-2">
            
            {/* 1. Pencarian Nama */}
            <div className="col-md-4">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Cari nama donatur..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* 2. Filter Nama Kegiatan */}
            <div className="col-md-4">
              <select 
                className="form-select" 
                value={filterActivity}
                onChange={(e) => setFilterActivity(e.target.value)}
              >
                <option value="">Semua Kegiatan</option>
                {uniqueActivities.map((kegiatan, index) => (
                    <option key={index} value={kegiatan}>
                        {kegiatan}
                    </option>
                ))}
              </select>
            </div>

            {/* 3. Filter Status */}
            <div className="col-md-4">
              <select 
                className="form-select" 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="terverifikasi">Berhasil (Terverifikasi)</option>
                <option value="pending">Pending</option>
                <option value="gagal">Gagal/Expire</option>
              </select>
            </div>
          </div>

          {/* Tabel */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>No</th>
                  <th>Nama Donatur</th>
                  <th>Kegiatan</th>
                  <th>Tanggal</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-2">Memuat data donasi...</p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Tidak ada data donasi ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td className="fw-bold">{item.nama_lengkap}</td>
                      <td>{item.nama_kegiatan}</td>
                      <td>{formatDate(item.tanggal_donasi)}</td>
                      <td>Rp {formatRupiah(item.jumlah)}</td>
                      <td>{getStatusBadge(item.status_donasi)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-3 text-muted small">
            Menampilkan {filteredData.length} data dari total {donasiList.length} donasi.
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManajemenDonasi;