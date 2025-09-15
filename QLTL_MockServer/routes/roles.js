const express = require('express');
const router = express.Router();
const db = require('../db/postgres');

// GET /api/roles
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, name, description FROM roles ORDER BY name');
        res.json({ data: rows });
    } catch (error) {
        console.error('Failed to get roles:', error);
        res.status(500).json({ message: 'Failed to retrieve roles.' });
    }
});

// POST /api/roles
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    try {
        const { rows } = await db.query(
            'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
            [name, description || '']
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Failed to create role:', error);
        res.status(500).json({ message: 'Failed to create role.' });
    }
});

// GET /api/roles/:id - This endpoint is removed as it's not in the new API documentation.
/*
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Get role details
        const roleResult = await db.query('SELECT * FROM roles WHERE id = $1', [id]);
        if (roleResult.rows.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }
        const role = roleResult.rows[0];

        // Get associated permissions
        const permResult = await db.query(
            'SELECT permissionId FROM role_permissions WHERE roleId = $1',
            [id]
        );
        role.permissions = permResult.rows.map(p => p.permissionid);

        res.json(role);
    } catch (error) {
        console.error('Failed to get role details:', error);
        res.status(500).json({ message: 'Failed to retrieve role details.' });
    }
});
*/

// PUT /api/roles/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE roles SET name = $1, description = $2 WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Failed to update role:', error);
        res.status(500).json({ message: 'Failed to update role.' });
    }
});

// DELETE /api/roles/:id
router.delete('/:id', async (req, res) => {
    try {
        const { rowCount } = await db.query('DELETE FROM roles WHERE id = $1', [req.params.id]);
        if (rowCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Role not found' });
        }
    } catch (error) {
        console.error('Failed to delete role:', error);
        res.status(500).json({ message: 'Failed to delete role.' });
    }
});

// GET /api/roles/:id/permissions - Not strictly needed as GET /:id now returns permissions
router.get('/:id/permissions', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(
            `SELECT p.id, p.name
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permissionId
             WHERE rp.roleId = $1`, [id]
        );
        res.json({ data: rows });
    } catch (error) {
        console.error('Failed to get role permissions:', error);
        res.status(500).json({ message: 'Failed to retrieve role permissions.' });
    }
});

// PUT /api/roles/:id/permissions
router.put('/:id/permissions', async (req, res) => {
    const { id } = req.params;
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: 'Permissions must be an array of permission IDs' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        // Clear existing permissions for the role
        await client.query('DELETE FROM role_permissions WHERE roleId = $1', [id]);
        // Insert new permissions
        for (const permId of permissions) {
            await client.query('INSERT INTO role_permissions (roleId, permissionId) VALUES ($1, $2)', [id, permId]);
        }
        await client.query('COMMIT');
        res.json({ message: 'Permissions updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to update role permissions:', error);
        res.status(500).json({ message: 'Failed to update permissions.' });
    } finally {
        client.release();
    }
});

module.exports = router;
