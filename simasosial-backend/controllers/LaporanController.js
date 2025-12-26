const db = require('../config/Database');

// Laporan Donasi
const getLaporanDonasi = (req, res) => {
    const { tgl_awal, tgl_akhir, id_kegiatan } = req.query; 

    if (!tgl_awal || !tgl_akhir) return res.status(400).json({ message: "Tanggal wajib diisi." });

    // Base Query
    let query = `
        SELECT d.id, d.tanggal_donasi, u.nama_lengkap AS nama_donatur, 
               a.judul AS nama_kegiatan, d.jumlah AS gross_amount, d.status_donasi 
        FROM donations d
        JOIN users u ON d.user_id = u.id
        JOIN activities a ON d.activity_id = a.id
        WHERE d.status_donasi = 'terverifikasi' 
        AND DATE(d.tanggal_donasi) BETWEEN ? AND ?
    `;

    let queryParams = [tgl_awal, tgl_akhir];

    // LOGIKA FILTER KEGIATAN
    if (id_kegiatan && id_kegiatan !== 'all') {
        query += ` AND d.activity_id = ?`;
        queryParams.push(id_kegiatan);
    }

    query += ` ORDER BY d.tanggal_donasi DESC`;

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error Laporan Donasi:", err);
            return res.status(500).json({ message: "Database Error" });
        }
        res.json(results);
    });
};

// Laporan Volunteer
const getLaporanVolunteer = (req, res) => {
    const { tgl_awal, tgl_akhir, id_kegiatan } = req.query; 

    if (!tgl_awal || !tgl_akhir) return res.status(400).json({ message: "Tanggal wajib diisi." });

    let query = `
        SELECT r.id, r.tanggal_registrasi AS tgl_daftar, u.nama_lengkap AS nama_relawan, 
               a.judul AS judul_kegiatan, r.status_kehadiran AS status_hadir 
        FROM activity_registrations r
        JOIN users u ON r.user_id = u.id
        JOIN activities a ON r.activity_id = a.id
        WHERE DATE(r.tanggal_registrasi) BETWEEN ? AND ?
    `;

    let queryParams = [tgl_awal, tgl_akhir];

    // LOGIKA FILTER KEGIATAN
    if (id_kegiatan && id_kegiatan !== 'all') {
        query += ` AND r.activity_id = ?`;
        queryParams.push(id_kegiatan);
    }

    query += ` ORDER BY r.tanggal_registrasi DESC`;

    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        
        const finalData = results.map(item => ({
            ...item,
            status_hadir: item.status_hadir === 'hadir'
        }));
        res.json(finalData);
    });
};

module.exports = { getLaporanDonasi, getLaporanVolunteer };