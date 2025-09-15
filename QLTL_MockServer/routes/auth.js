const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db/postgres');
const router = express.Router();

const SECRET_KEY = 'your_super_secret_key';

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await db.query(
            `SELECT u.*, r.name as role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.email = $1 AND u.password = $2`, 
            [username, password]
        );
        if (rows.length > 0) {
            const user = rows[0];

            const permissionsResult = await db.query(
                `SELECT rp.permissionid 
                 FROM role_permissions rp 
                 WHERE rp.roleid = $1`,
                [user.role_id]
            );
            const permissions = permissionsResult.rows.map(p => p.permissionid);

            const token = jwt.sign({ id: user.id, role: user.role_name, name: user.name, permissions }, SECRET_KEY, { expiresIn: '8h' });
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role_name,
                    permissions,
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token is not valid' });
            }
            req.user = decoded; // Contains id, role, name
            next();
        });
    } else {
        res.status(401).json({ message: 'Authorization header is missing' });
    }
};

router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userResult = await db.query(
            `SELECT u.id, u.name, u.email, r.name as role 
             FROM users u
             JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1`, 
            [req.user.id]
        );
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];

            const permissionsResult = await db.query(
                `SELECT rp.permissionid 
                 FROM role_permissions rp 
                 JOIN roles r ON rp.roleid = r.id 
                 WHERE r.name = $1`,
                [user.role]
            );
            const permissions = permissionsResult.rows.map(p => p.permissionid);

            res.json({
                ...user,
                permissions,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = { router, authMiddleware };
