import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Laporan = () => {
    // --- STATE ---
    const [jenisLaporan, setJenisLaporan] = useState('donasi'); 
    const [tglAwal, setTglAwal] = useState('');
    const [tglAkhir, setTglAkhir] = useState('');
    const [pilihKegiatan, setPilihKegiatan] = useState('all'); 
    const [daftarKegiatan, setDaftarKegiatan] = useState([]); 
    
    const [dataLaporan, setDataLaporan] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    
    // STATE BARU UNTUK DETEKSI PENCARIAN
    const [hasSearched, setHasSearched] = useState(false); // <--- TAMBAHAN 1

    // 1. AMBIL DAFTAR KEGIATAN
    useEffect(() => {
        const fetchKegiatan = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/admin/activities', {
                    headers: { Authorization: `Bearer ${token}` }
                }); 
                setDaftarKegiatan(response.data);
            } catch (error) {
                console.error("Gagal ambil list kegiatan", error);
            }
        };
        fetchKegiatan();
    }, []);

    // 2. CARI DATA LAPORAN
    const handleCari = async (e) => {
        e.preventDefault();
        setLoading(true);
        setHasSearched(false); // Reset dulu saat mulai cari
        try {
            const endpoint = jenisLaporan === 'donasi' 
                ? `http://localhost:8000/api/laporan/donasi` 
                : `http://localhost:8000/api/laporan/volunteer`;
            
            const token = localStorage.getItem('token'); 

            const response = await axios.get(endpoint, {
                params: { 
                    tgl_awal: tglAwal, 
                    tgl_akhir: tglAkhir,
                    id_kegiatan: pilihKegiatan 
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setDataLaporan(response.data);
            setHasSearched(true); 
        } catch (error) {
            console.error(error);
            alert("Gagal mengambil data laporan.");
        }
        setLoading(false);
    };

    // Fungsi Reset State ketika Filter Berubah (Opsional, biar UX lebih rapi)
    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setDataLaporan([]);
        setHasSearched(false); 
    };

    // 3. GENERATE PDF LAPORAN FILTER (LPJ)
    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Kop Surat
        doc.setFontSize(18);
        doc.text("SIMASOSIAL FST - UIN IMAM BONJOL", 14, 22);
        doc.setFontSize(12);
        const judulLaporan = jenisLaporan === 'donasi' ? 'LAPORAN KEUANGAN DONASI' : 'LAPORAN DATA RELAWAN';
        doc.text(judulLaporan, 14, 32);

        let namaKegiatanStr = "Semua Kegiatan";
        if (pilihKegiatan !== 'all') {
            const keg = daftarKegiatan.find(k => k.id === parseInt(pilihKegiatan));
            if (keg) namaKegiatanStr = keg.judul;
        }
        
        doc.setFontSize(10);
        doc.text(`Kegiatan : ${namaKegiatanStr}`, 14, 40);
        doc.text(`Periode  : ${new Date(tglAwal).toLocaleDateString('id-ID')} s/d ${new Date(tglAkhir).toLocaleDateString('id-ID')}`, 14, 46);

        // Tabel
        const tableColumn = jenisLaporan === 'donasi' 
            ? ["No", "Tanggal", "Nama Donatur", "Kegiatan", "Nominal (Rp)"]
            : ["No", "Tanggal", "Nama Relawan", "Kegiatan", "Status"];

        const tableRows = [];

        dataLaporan.forEach((item, index) => {
            const rowData = [
                index + 1,
                new Date(item.created_at || item.tgl_daftar || item.tanggal_donasi).toLocaleDateString('id-ID'),
                item.nama_donatur || item.nama_relawan,
                item.nama_kegiatan || item.judul_kegiatan,
                jenisLaporan === 'donasi' 
                    ? `Rp ${parseInt(item.gross_amount).toLocaleString('id-ID')}`
                    : (item.status_hadir ? 'Hadir' : 'Terdaftar')
            ];
            tableRows.push(rowData);
        });

        if (jenisLaporan === 'donasi') {
            const total = dataLaporan.reduce((acc, curr) => acc + parseInt(curr.gross_amount), 0);
            tableRows.push(['', '', '', 'TOTAL DONASI', `Rp ${total.toLocaleString('id-ID')}`]);
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            headStyles: { fillColor: [13, 71, 161] }
        });

        const finalY = doc.lastAutoTable.finalY + 20;
        doc.text(`Padang, ${new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}`, 140, finalY);
        doc.text("Mengetahui, Admin", 140, finalY + 6);
        doc.text("( ................................. )", 140, finalY + 30);

        doc.save(`Laporan_${jenisLaporan}_${tglAwal}_${tglAkhir}.pdf`);
    };

    // 4. DOWNLOAD EXCEL
    const handleExportExcel = async (type) => {
        setDownloading(true);
        try {
            const token = localStorage.getItem('token');
            let url = '';
            let filename = '';

            if (type === 'users') {
                url = 'http://localhost:8000/api/admin/users/export-excel';
                filename = 'Data_Pengguna_Master.xlsx';
            } else if (type === 'activities') {
                url = 'http://localhost:8000/api/admin/activities/export-excel';
                filename = 'Data_Kegiatan_Master.xlsx';
            } else if (type === 'participants') {
                if (pilihKegiatan === 'all') { alert("Pilih kegiatan spesifik dulu!"); setDownloading(false); return; }
                url = `http://localhost:8000/api/admin/activities/${pilihKegiatan}/export-participants-excel`;
                filename = `Peserta_Kegiatan_${pilihKegiatan}.xlsx`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });

            const href = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = href;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(href);

        } catch (error) {
            console.error("Gagal download Excel", error);
            alert("Gagal mendownload file Excel.");
        }
        setDownloading(false);
    };

    // 5. DOWNLOAD PDF MASTER
    const handleExportMasterPDF = async (type) => {
        setDownloading(true);
        try {
            const token = localStorage.getItem('token');
            const doc = new jsPDF();
            doc.setFontSize(16);

            if (type === 'users') {
                const res = await axios.get('http://localhost:8000/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const users = res.data;

                doc.text("DATA MASTER PENGGUNA (USERS)", 14, 20);
                const rows = users.map((u, i) => [
                    i + 1, u.nama_lengkap, u.email, u.role, u.is_verified ? 'Verified' : 'Unverified'
                ]);
                autoTable(doc, { head: [['No', 'Nama Lengkap', 'Email', 'Role', 'Status']], body: rows, startY: 30, theme: 'grid' });
                doc.save('Master_Data_Users.pdf');

            } else if (type === 'activities') {
                const res = await axios.get('http://localhost:8000/api/admin/activities', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const acts = res.data;

                doc.text("DATA MASTER KEGIATAN", 14, 20);
                const rows = acts.map((a, i) => [
                    i + 1, a.judul, new Date(a.tanggal_mulai).toLocaleDateString('id-ID'), a.tipe, a.status
                ]);
                autoTable(doc, { head: [['No', 'Judul Kegiatan', 'Tanggal', 'Tipe', 'Status']], body: rows, startY: 30, theme: 'grid' });
                doc.save('Master_Data_Activities.pdf');
            }

        } catch (error) {
            console.error("Gagal generate PDF Master", error);
            alert("Gagal membuat PDF.");
        }
        setDownloading(false);
    };

    return (
        <div className="container mt-4">
            <h2 className="fs-4 fw-bold mb-3">Laporan Transaksi & Kegiatan (LPJ)</h2>
            <div className="card p-4 mb-5 shadow-sm border-0">
                <form onSubmit={handleCari} className="row g-3">
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Jenis Laporan</label>
                        {/* UPDATE ONCHANGE: Panggil handleFilterChange */}
                        <select className="form-select" value={jenisLaporan} onChange={handleFilterChange(setJenisLaporan)}>
                            <option value="donasi">Laporan Keuangan</option>
                            <option value="volunteer">Laporan Relawan</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Filter Kegiatan</label>
                        {/* UPDATE ONCHANGE: Panggil handleFilterChange */}
                        <select className="form-select" value={pilihKegiatan} onChange={handleFilterChange(setPilihKegiatan)}>
                            <option value="all">-- Semua Kegiatan --</option>
                            {daftarKegiatan.map((keg) => (
                                <option key={keg.id} value={keg.id}>{keg.judul}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Dari Tanggal</label>
                        <input type="date" className="form-control" value={tglAwal} onChange={(e) => setTglAwal(e.target.value)} required />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label fw-bold">Sampai Tanggal</label>
                        <input type="date" className="form-control" value={tglAkhir} onChange={(e) => setTglAkhir(e.target.value)} required />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                            {loading ? 'Loading...' : 'Tampilkan'}
                        </button>
                    </div>
                </form>

                {/* --- BAGIAN INI UNTUK ALERT DATA KOSONG --- */}
                {/* Logic: Sudah Search AND Data Kosong AND Tidak Loading */}
                {hasSearched && dataLaporan.length === 0 && !loading && (
                    <div className="alert alert-info text-center mt-4" role="alert">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        Data tidak ditemukan untuk filter atau periode tanggal tersebut.
                    </div>
                )}
                {/* ------------------------------------------- */}

                {dataLaporan.length > 0 && (
                    <div className="mt-4">
                        <div className="table-responsive">
                            <table className="table table-striped table-hover align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>No</th>
                                        <th>Tanggal</th>
                                        <th>Nama</th>
                                        <th>Kegiatan</th>
                                        {jenisLaporan === 'donasi' ? <th className="text-end">Nominal</th> : <th className="text-center">Status</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataLaporan.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{new Date(item.created_at || item.tgl_daftar || item.tanggal_donasi).toLocaleDateString('id-ID')}</td>
                                            <td>{item.nama_donatur || item.nama_relawan}</td>
                                            <td>{item.nama_kegiatan || item.judul_kegiatan}</td>
                                            {jenisLaporan === 'donasi' ? (
                                                <td className="text-end fw-bold text-success">Rp {parseInt(item.gross_amount).toLocaleString('id-ID')}</td>
                                            ) : (
                                                <td className="text-center">{item.status_hadir ? <span className="badge bg-success">Hadir</span> : <span className="badge bg-secondary">Terdaftar</span>}</td>
                                            )}
                                        </tr>
                                    ))}
                                    {jenisLaporan === 'donasi' && (
                                        <tr className="table-active fw-bold">
                                            <td colSpan="4" className="text-end">TOTAL</td>
                                            <td className="text-end text-primary fs-5">Rp {dataLaporan.reduce((acc, curr) => acc + parseInt(curr.gross_amount), 0).toLocaleString('id-ID')}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={handleDownloadPDF} className="btn btn-danger w-100 mt-2">
                            <i className="bi bi-file-earmark-pdf-fill me-2"></i> Download Laporan (LPJ) PDF
                        </button>
                    </div>
                )}
            </div>

            <hr className="my-5" />

            <h2 className="fs-4 fw-bold mb-3">Export Data Master (Arsip)</h2>
            <div className="card p-4 shadow-sm border-0 mb-5">
                <p className="text-muted">Download seluruh data mentah tanpa filter tanggal.</p>
                <div className="row g-3">
                    <div className="col-md-6">
                        <div className="card h-100 border-light bg-light">
                            <div className="card-body text-center">
                                <h5 className="card-title fw-bold mb-3">Data Pengguna</h5>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button className="btn btn-success" onClick={() => handleExportExcel('users')} disabled={downloading}><i className="bi bi-file-earmark-excel-fill me-2"></i>Excel</button>
                                    <button className="btn btn-danger" onClick={() => handleExportMasterPDF('users')} disabled={downloading}><i className="bi bi-file-earmark-pdf-fill me-2"></i>PDF</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card h-100 border-light bg-light">
                            <div className="card-body text-center">
                                <h5 className="card-title fw-bold mb-3">Data Kegiatan</h5>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button className="btn btn-success" onClick={() => handleExportExcel('activities')} disabled={downloading}><i className="bi bi-file-earmark-spreadsheet-fill me-2"></i>Excel</button>
                                    <button className="btn btn-danger" onClick={() => handleExportMasterPDF('activities')} disabled={downloading}><i className="bi bi-file-earmark-pdf-fill me-2"></i>PDF</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {pilihKegiatan !== 'all' && (
                    <div className="row mt-3">
                        <div className="col-12">
                            <button className="btn btn-outline-success w-100 py-2" onClick={() => handleExportExcel('participants')} disabled={downloading}>
                                <i className="bi bi-people-fill me-2"></i>
                                Download Absensi Peserta (Excel) - {daftarKegiatan.find(k => k.id == pilihKegiatan)?.judul}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Laporan;