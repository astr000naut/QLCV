const express = require('express');
const router = express.Router();
const db = require('../db/postgres');

// GET /api/permissions
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM permissions ORDER BY name');
        res.json({ data: rows });
    } catch (error) {
        console.error('Failed to get permissions:', error);
        res.status(500).json({ message: 'Failed to retrieve permissions.' });
    }
});

module.exports = router;
