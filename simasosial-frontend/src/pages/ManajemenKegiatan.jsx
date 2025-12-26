import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';           
import autoTable from 'jspdf-autotable'; 

// Fungsi helper (tanggal & rupiah)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const formatCurrency = (number) => {
  if (number === 0 || !number) return '-';
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(number);
};

function ManajemenKegiatan() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  
  // State Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // State Pagination 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); 
  const navigate = useNavigate();

  // Fetch Data
  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const response = await fetch('http://localhost:8000/api/admin/activities', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
          }
          throw new Error('Gagal mengambil data kegiatan');
        }

        const data = await response.json();
        setActivities(data);
        setFilteredActivities(data); 
      } catch (err) {
        const Toast = Swal.mixin({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
        });
        Toast.fire({ icon: 'error', title: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [navigate]);

  // Logika Filter & Reset Pagination
  useEffect(() => {
    const results = activities.filter(act => {
      const matchSearch = act.judul.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipe = filterTipe ? act.tipe === filterTipe : true;
      const matchStatus = filterStatus ? act.status === filterStatus : true;

      return matchSearch && matchTipe && matchStatus;
    });
    setFilteredActivities(results);
    setCurrentPage(1); 
  }, [searchTerm, filterTipe, filterStatus, activities]);

  // Logika Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- 1. FUNGSI EXPORT EXCEL ---
  const handleExportExcel = async () => {
    setExporting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/admin/activities/export-excel', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Gagal export Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Laporan_Kegiatan_SIMASOSIAL.xlsx'); 
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
      });
      Toast.fire({ icon: 'success', title: 'Excel berhasil diunduh' });

    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  // --- 2. FUNGSI EXPORT PDF ---
  const handleExportPDF = () => {
    if (filteredActivities.length === 0) {
      Swal.fire('Info', 'Tidak ada data kegiatan untuk diexport!', 'info');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); 

    // Judul PDF
    doc.text("Laporan Daftar Kegiatan - SIMASOSIAL FST", 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);

    // Definisi Kolom
    const tableColumn = ["No", "Judul Kegiatan", "Tipe", "Lokasi", "Target", "Status", "Tanggal"];
    
    // Mapping Data
    const tableRows = [];
    filteredActivities.forEach((act, index) => {
      // Format Target sesuai tipe
      const detailTarget = act.tipe === 'donasi' 
          ? formatCurrency(act.target_donasi) 
          : `${act.target_peserta} Orang`;

      const rowData = [
        index + 1,
        act.judul,
        act.tipe.toUpperCase(),
        act.lokasi || '-',
        detailTarget,
        act.status,
        formatDate(act.tanggal_mulai)
      ];
      tableRows.push(rowData);
    });

    // Generate Tabel
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 }, 
      headStyles: { fillColor: [13, 71, 161] } 
    });

    // Simpan File
    doc.save("Laporan_Kegiatan_SIMASOSIAL.pdf");
  };

  // Fungsi Delete
  const handleDelete = async (id, judul) => {
    const result = await Swal.fire({
      title: 'Hapus Kegiatan?',
      text: `Anda yakin ingin menghapus "${judul}"? Data peserta & donasi terkait akan hilang!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (!result.isConfirmed) return; 

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/activities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Gagal menghapus kegiatan.');

      setActivities(prev => prev.filter(act => act.id !== id));
      Swal.fire('Terhapus!', 'Kegiatan telah dihapus.', 'success');

    } catch (err) {
      Swal.fire('Gagal!', err.message, 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Manajemen Kegiatan</h1>
        
        {/* CONTAINER TOMBOL AKSI */}
        <div className="d-flex gap-2">
            {/* Tombol PDF */}
            <button 
              className="btn btn-danger" 
              onClick={handleExportPDF} 
              title="Export ke PDF"
            >
              <i className="bi bi-file-earmark-pdf me-2"></i> PDF
            </button>

            {/* Tombol Excel */}
            <button 
              className="btn btn-success" 
              onClick={handleExportExcel} 
              disabled={exporting}
              title="Export ke Excel"
            >
              {exporting ? '...' : <><i className="bi bi-file-earmark-excel me-2"></i> Excel</>}
            </button>

            {/* Tombol Tambah */}
            <Link to="/admin/kegiatan/baru" className="btn btn-primary">
                <i className="bi bi-plus-circle-fill me-2"></i> Tambah Kegiatan
            </Link>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body bg-light rounded">
          <div className="row g-2">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Cari berdasarkan Nama Kegiatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}>
                <option value="">Semua Jenis</option>
                <option value="donasi">Donasi</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Judul Kegiatan</th>
                <th>Jenis</th>
                <th>Detail (Target)</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted py-4">Tidak ada kegiatan yang cocok.</td></tr>
              ) : (
                currentItems.map(act => (
                  <tr key={act.id}>
                    <td className="fw-bold">{act.judul}</td>
                    <td>
                      <span className={`badge ${act.tipe === 'donasi' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                        {act.tipe}
                      </span>
                    </td>
                    <td>
                      {act.tipe === 'donasi' 
                        ? formatCurrency(act.target_donasi)
                        : `${act.peserta_terdaftar}/${act.target_peserta || '∞'} Peserta`
                      }
                    </td>
                    <td>
                      <span className={`badge ${act.status === 'published' ? 'bg-success' : 'bg-secondary'}`}>
                        {act.status}
                      </span>
                    </td>
                    <td>{formatDate(act.tanggal_mulai)}</td>
                    <td>
                      <Link to={`/admin/kegiatan/edit/${act.id}`} className="btn btn-sm btn-outline-secondary me-2" title="Edit">
                        <i className="bi bi-pencil-fill"></i>
                      </Link>
                      <button className="btn btn-sm btn-outline-danger" title="Hapus" onClick={() => handleDelete(act.id, act.judul)}>
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* PAGINATION FOOTER */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted small">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredActivities.length)} dari {filteredActivities.length} kegiatan
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                </li>

                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ManajemenKegiatan;