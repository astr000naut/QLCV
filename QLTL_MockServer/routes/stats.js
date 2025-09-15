const express = require('express');
const db = require('../db/postgres');
const { authMiddleware } = require('./auth');
const router = express.Router();

router.use(authMiddleware);

// GET /api/stats
router.get('/stats', async (req, res) => {
    try {
        const docStatsQuery = `
            SELECT
                COUNT(*) AS total,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected
            FROM documents
        `;
        const userStatsQuery = `SELECT COUNT(*) AS total FROM users`;

        const { rows: docRows } = await db.query(docStatsQuery);
        const { rows: userRows } = await db.query(userStatsQuery);

        res.json({
            totalDocuments: parseInt(docRows[0].total),
            pendingDocuments: parseInt(docRows[0].pending),
            approvedDocuments: parseInt(docRows[0].approved),
            rejectedDocuments: parseInt(docRows[0].rejected),
            totalUsers: parseInt(userRows[0].total),
        });
    } catch (error) {
        console.error('Failed to get stats:', error);
        res.status(500).json({ message: 'Failed to retrieve stats.' });
    }
});

// GET /api/reports
router.get('/reports', async (req, res) => {
    const { type = 'byUser' } = req.query;
    let reportData = {};

    try {
        if (type === 'byUser') {
            const query = `
                SELECT u.id as userId, u.name, COUNT(d.id) as documentCount
                FROM users u
                LEFT JOIN documents d ON u.id = d.uploaderId
                GROUP BY u.id, u.name
                ORDER BY documentCount DESC
                LIMIT 10;
            `;
            const { rows } = await db.query(query);
            reportData = rows;
        } else if (type === 'byFolder') {
             const query = `
                SELECT f.id as folderId, f.name, COUNT(d.id) as documentCount
                FROM folders f
                LEFT JOIN documents d ON f.id = d.folderId
                GROUP BY f.id, f.name
                ORDER BY documentCount DESC;
            `;
             const { rows } = await db.query(query);
             reportData = rows;
        }

        res.json({
            reportType: type,
            data: reportData,
        });

    } catch (error) {
        console.error('Failed to get reports:', error);
        res.status(500).json({ message: 'Failed to retrieve reports.' });
    }
});

module.exports = router;
