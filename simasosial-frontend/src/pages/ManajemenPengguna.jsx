import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';           
import autoTable from 'jspdf-autotable'; 

function ManajemenPengguna() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // State Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJurusan, setFilterJurusan] = useState(''); 
  const [filterRole, setFilterRole] = useState('');       
  const [filterAngkatan, setFilterAngkatan] = useState('');
  
  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Gagal mengambil data pengguna');
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data); 
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
      if (err.message.includes('Token')) { localStorage.clear(); navigate('/login'); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  // --- 1. FUNGSI EXPORT PDF ---
  const handleExportPDF = () => {
    if (filteredUsers.length === 0) {
      Swal.fire('Info', 'Tidak ada data untuk diexport!', 'info');
      return;
    }

    const doc = new jsPDF();

    // Judul PDF
    doc.text("Laporan Data Pengguna - SIMASOSIAL FST", 14, 20);
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 28);

    // Definisi Kolom
    const tableColumn = ["No", "Nama Lengkap", "NIM", "Jurusan", "Angkatan", "No. HP", "Role"];
    
    // Mapping Data
    const tableRows = [];
    filteredUsers.forEach((user, index) => {
      const rowData = [
        index + 1,
        user.nama_lengkap,
        user.nim || '-',
        user.jurusan || '-',
        user.angkatan || '-',
        user.no_telepon || '-',
        user.role
      ];
      tableRows.push(rowData);
    });

    // Generate Tabel
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [13, 71, 161] } 
    });

    // Simpan File
    doc.save("Data_Pengguna_SIMASOSIAL.pdf");
  };

  // --- 2. FUNGSI EXPORT EXCEL (TETAP ADA) ---
  const handleExportExcel = async () => {
    setExporting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/admin/users/export-excel', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Gagal export Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Data_Pengguna_SIMASOSIAL.xlsx'); 
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

  // LOGIKA FILTER
  useEffect(() => {
    const results = users.filter(user => {
      const matchSearch = 
        user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.nim && user.nim.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchJurusan = filterJurusan ? user.jurusan === filterJurusan : true;
      const matchRole = filterRole ? user.role === filterRole : true;
      const matchAngkatan = filterAngkatan ? user.angkatan === filterAngkatan : true;

      return matchSearch && matchJurusan && matchRole && matchAngkatan;
    });

    setFilteredUsers(results);
    setCurrentPage(1); 
  }, [searchTerm, filterJurusan, filterRole, filterAngkatan, users]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- FUNGSI UBAH ROLE ---
  const handleRoleChange = async (user) => {
    if (user.id === 3) {
      Swal.fire({
        icon: 'error', title: 'Akses Ditolak',
        text: 'Role Admin Utama tidak dapat diubah!', confirmButtonColor: '#d33'
      });
      return;
    }

    const newRole = user.role === 'admin' ? 'mahasiswa' : 'admin';
    const result = await Swal.fire({
      title: 'Ubah Role?',
      html: `Ubah role <b>${user.nama_lengkap}</b> menjadi <b>${newRole.toUpperCase()}</b>?`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Ubah!',
      confirmButtonColor: '#3085d6', cancelButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newRole })
      });

      if (!response.ok) {
        const errData = await response.json(); throw new Error(errData.message || 'Gagal update role.');
      }

      const updatedUsers = users.map(u => u.id === user.id ? { ...u, role: newRole } : u);
      setUsers(updatedUsers);
      Swal.fire('Berhasil!', `Role berhasil diubah menjadi ${newRole}.`, 'success');
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    }
  };

  // --- FUNGSI HAPUS USER ---
  const handleDeleteUser = async (user) => {
    if (user.id === 3) {
      Swal.fire('Dilarang!', 'Admin Utama tidak boleh dihapus.', 'error'); return;
    }

    const result = await Swal.fire({
      title: 'Hapus Pengguna?',
      html: `Apakah Anda yakin ingin menghapus <b>${user.nama_lengkap}</b>?<br/><small style="color:red">PERINGATAN: Semua data (Sertifikat, Donasi, Kegiatan) milik user ini akan ikut terhapus permanen!</small>`,
      icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6', confirmButtonText: 'Ya, Hapus Permanen!'
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${user.id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal menghapus user');

      const remainingUsers = users.filter(u => u.id !== user.id);
      setUsers(remainingUsers);
      Swal.fire('Terhapus!', 'Pengguna berhasil dihapus.', 'success');
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    }
  };

  const daftarJurusan = [...new Set(users.map(u => u.jurusan).filter(j => j))];
  const daftarAngkatan = [...new Set(users.map(u => u.angkatan).filter(a => a))].sort();

  if (loading) return <div className="text-center p-5">Loading data pengguna...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">Manajemen Data Pengguna</h1>
        
        {/* CONTAINER TOMBOL EXPORT */}
        <div className="d-flex gap-2">
            {/* Tombol PDF */}
            <button 
              className="btn btn-danger" 
              onClick={handleExportPDF} 
            >
              <i className="bi bi-file-earmark-pdf me-2"></i> Export PDF
            </button>

            {/* Tombol Excel */}
            <button 
              className="btn btn-success" 
              onClick={handleExportExcel} 
              disabled={exporting}
            >
              {exporting ? 'Downloading...' : <><i className="bi bi-file-earmark-excel me-2"></i> Export Excel</>}
            </button>
        </div>
      </div>

      {/* BAR FILTER */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Cari Nama / NIM..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterJurusan} onChange={(e) => setFilterJurusan(e.target.value)}>
                <option value="">Semua Jurusan</option>
                {daftarJurusan.map((jurusan, index) => <option key={index} value={jurusan}>{jurusan}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" value={filterAngkatan} onChange={(e) => setFilterAngkatan(e.target.value)}>
                <option value="">Semua BP</option>
                {daftarAngkatan.map((angkatan, index) => <option key={index} value={angkatan}>{angkatan}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="">Semua Role</option>
                <option value="mahasiswa">Mahasiswa</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mahasiswa</th>
                  <th>Kontak</th>
                  <th>Jurusan</th>
                  <th>BP</th>
                  <th>Role</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted py-4">Data tidak ditemukan.</td></tr>
                ) : (
                  currentItems.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="fw-bold">{user.nama_lengkap}</div>
                        <div className="small text-muted">{user.nim}</div>
                      </td>
                      <td>
                        <div className="small">{user.email}</div>
                        <div className="small text-muted">{user.no_telepon || '-'}</div>
                      </td>
                      <td>{user.jurusan}</td>
                      <td>{user.angkatan}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="text-end">
                        {user.id !== 3 ? (
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              title="Ubah Role" 
                              onClick={() => handleRoleChange(user)}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              title="Hapus Pengguna" 
                              onClick={() => handleDeleteUser(user)}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        ) : (
                          <span className="badge bg-warning text-dark">
                            <i className="bi bi-shield-lock-fill me-1"></i> Utama
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="text-muted small">
              Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} dari {filteredUsers.length} pengguna
            </div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(i + 1)}>{i + 1}</button>
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

export default ManajemenPengguna;