const express = require('express');
const db = require('../db/postgres');
const { authMiddleware } = require('./auth');
const router = express.Router();

router.use(authMiddleware);

// Helper function to build folder tree
const buildTree = (folders) => {
    const map = {};
    const roots = [];
    folders.forEach(folder => {
        map[folder.id] = { ...folder, children: [] };
    });

    folders.forEach(folder => {
        if (folder.parentid !== null && map[folder.parentid]) {
            map[folder.parentid].children.push(map[folder.id]);
        } else {
            roots.push(map[folder.id]);
        }
    });
    return roots;
};

// GET /api/folders
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM folders ORDER BY name');
        const tree = buildTree(rows);
        res.json(tree);
    } catch (error) {
        console.error('Failed to get folders:', error);
        res.status(500).json({ message: 'Failed to retrieve folders.' });
    }
});

// POST /api/folders
router.post('/', async (req, res) => {
    const { name, parentId } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO folders (name, parentId) VALUES ($1, $2) RETURNING *',
            [name, parentId || null]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Failed to create folder:', error);
        res.status(500).json({ message: 'Failed to create folder.' });
    }
});

// PUT /api/folders/{id}
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, parentId } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE folders SET name = $1, parentId = $2 WHERE id = $3 RETURNING *',
            [name, parentId, id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Failed to update folder:', error);
        res.status(500).json({ message: 'Failed to update folder.' });
    }
});

// DELETE /api/folders/{id}
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Check if folder has documents or subfolders
        const docsCheck = await db.query('SELECT id FROM documents WHERE folderId = $1 LIMIT 1', [id]);
        if (docsCheck.rowCount > 0) {
            return res.status(400).json({ message: 'Cannot delete folder with documents.' });
        }
        const subfoldersCheck = await db.query('SELECT id FROM folders WHERE parentId = $1 LIMIT 1', [id]);
        if (subfoldersCheck.rowCount > 0) {
            return res.status(400).json({ message: 'Cannot delete folder with subfolders.' });
        }

        const { rowCount } = await db.query('DELETE FROM folders WHERE id = $1', [id]);
        if (rowCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Folder not found' });
        }
    } catch (error) {
        console.error('Failed to delete folder:', error);
        res.status(500).json({ message: 'Failed to delete folder.' });
    }
});

module.exports = router;
