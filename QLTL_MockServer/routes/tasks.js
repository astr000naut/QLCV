const express = require('express');
const db = require('../db/postgres');
const { authMiddleware } = require('./auth');
const router = express.Router();

router.use(authMiddleware);

// GET /api/tasks
router.get('/', async (req, res) => {
    // This API returns pending documents for the logged-in user or all pending if admin.
    try {
        const user = req.user;
        let query;
        let params = [];

        // A simple interpretation: Admins see all pending tasks, others see none.
        // A more complex system might have explicit assignments.
        if (user.role === 'Admin') {
            query = `
                SELECT d.id, d.name, d.status, d.uploadedAt, u.id as uploader_id, u.name as uploader_name
                FROM documents d
                JOIN users u ON d.uploaderId = u.id
                WHERE d.status = 'pending'
                ORDER BY d.uploadedAt DESC
            `;
        } else {
            // Non-admins don't see any tasks in this simple model
            // You could change this to `WHERE d.uploaderId = $1 AND d.status = 'pending'`
            // if users should see their own pending documents as tasks.
            query = `SELECT 1 WHERE 1=0`; // Returns no rows
        }

        const { rows } = await db.query(query, params);

        const tasks = rows.map(d => ({
            id: d.id,
            name: d.name,
            status: d.status,
            uploader: { id: d.uploader_id, name: d.uploader_name },
            uploadedAt: d.uploadedat
        }));

        res.json(tasks);
    } catch (error) {
        console.error('Failed to get tasks:', error);
        res.status(500).json({ message: 'Failed to retrieve tasks.' });
    }
});

module.exports = router;
