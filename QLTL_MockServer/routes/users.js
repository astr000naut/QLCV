const express = require('express');
const db = require('../db/postgres');
const { authMiddleware } = require('./auth');
const router = express.Router();

router.use(authMiddleware);

// GET /api/users
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    try {
        let query, countQuery, params, countParams;

        const baseSelect = `
            SELECT u.id, u.name, u.email, r.name as role, u.createdAt 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
        `;
        const baseCount = `SELECT COUNT(*) FROM users u LEFT JOIN roles r ON u.role_id = r.id`;

        if (search) {
            const searchTerm = `%${search.toLowerCase()}%`;
            query = `${baseSelect} WHERE LOWER(u.name) LIKE $1 OR LOWER(u.email) LIKE $1 ORDER BY u.createdAt DESC LIMIT $2 OFFSET $3`;
            countQuery = `${baseCount} WHERE LOWER(u.name) LIKE $1 OR LOWER(u.email) LIKE $1`;
            params = [searchTerm, limit, offset];
            countParams = [searchTerm];
        } else {
            query = `${baseSelect} ORDER BY u.createdAt DESC LIMIT $1 OFFSET $2`;
            countQuery = baseCount;
            params = [limit, offset];
            countParams = [];
        }

        const { rows: users } = await db.query(query, params);
        const { rows: countResult } = await db.query(countQuery, countParams);
        const total = parseInt(countResult[0].count, 10);

        res.json({
            data: users,
            pagination: { total, page, limit },
        });

    } catch (error) {
        console.error('Failed to get users:', error);
        res.status(500).json({ message: 'Failed to retrieve users.' });
    }
});

// GET /api/users/{id}
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT u.id, u.name, u.email, r.name as role, u.createdAt 
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1`, 
            [req.params.id]
        );
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Failed to get user:', error);
        res.status(500).json({ message: 'Failed to retrieve user.' });
    }
});

// POST /api/users
router.post('/', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [role]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
        const role_id = roleResult.rows[0].id;

        const query = `
            INSERT INTO users (name, email, password, role_id, createdAt)
            VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, email, createdAt`;
        const { rows } = await db.query(query, [name, email, password, role_id]);
        
        const newUser = { ...rows[0], role };
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Failed to create user:', error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
});

// PUT /api/users/{id}
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, role } = req.body;
    try {
        const roleResult = await db.query('SELECT id FROM roles WHERE name = $1', [role]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
        const role_id = roleResult.rows[0].id;

        const query = `UPDATE users SET name = $1, role_id = $2 WHERE id = $3 RETURNING id, name, email, createdAt`;
        const { rows } = await db.query(query, [name, role_id, id]);
        if (rows.length > 0) {
            const updatedUser = { ...rows[0], role };
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Failed to update user:', error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
});

// DELETE /api/users/{id}
router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        if (rowCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Failed to delete user:', error);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
});

module.exports = router;
