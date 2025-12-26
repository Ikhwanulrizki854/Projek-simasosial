const express = require('express');
const router = express.Router();
const { getLaporanDonasi, getLaporanVolunteer } = require('../controllers/LaporanController');
const verifyToken = require('../middleware/verifyToken');

// Middleware Admin Sederhana
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).json({ message: "Akses Ditolak. Khusus Admin." });
};

router.get('/api/laporan/donasi', verifyToken, adminOnly, getLaporanDonasi);
router.get('/api/laporan/volunteer', verifyToken, adminOnly, getLaporanVolunteer);

module.exports = router;