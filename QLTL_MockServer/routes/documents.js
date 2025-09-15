const express = require('express');
const config = require('../config');
const multer = require('multer');
const { authMiddleware } = require('./auth');
const db = require('../db/postgres');
const { minioClient, bucketName } = require('../services/minio');
const router = express.Router();

// Store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authMiddleware);

// GET /api/documents - Get documents with filtering and pagination
router.get('/', async (req, res) => {
    const { status, folderId, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT d.*, u.name as uploader_name
        FROM documents d
        LEFT JOIN users u ON d.uploaderId = u.id
    `;
    let countQuery = `SELECT COUNT(*) FROM documents`;
    const params = [];
    const countParams = [];
    let whereClauses = [];

    if (status) {
        params.push(status);
        countParams.push(status);
        whereClauses.push(`status = $${params.length}`);
    }
    if (folderId) {
        params.push(folderId);
        countParams.push(folderId);
        whereClauses.push(`folderId = $${params.length}`);
    }
    if (search) {
        params.push(`%${search.toLowerCase()}%`);
        countParams.push(`%${search.toLowerCase()}%`);
        whereClauses.push(`LOWER(d.name) LIKE $${params.length}`);
    }

    if (whereClauses.length > 0) {
        const whereString = whereClauses.join(' AND ');
        query += ` WHERE ${whereString}`;
        countQuery += ` WHERE ${whereString}`;
    }

    query += ` ORDER BY uploadedAt DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    try {
        const { rows } = await db.query(query, params);
        const { rows: countRows } = await db.query(countQuery, countParams);
        const total = parseInt(countRows[0].count, 10);
        
        // Map database result to expected API response structure
        const formattedData = rows.map(doc => ({
            id: doc.id,
            name: doc.name,
            description: doc.description,
            status: doc.status,
            fileUrl: doc.fileurl,
            uploader: {
                id: doc.uploaderid,
                name: doc.uploader_name
            },
            uploadedAt: doc.uploadedat,
            folderId: doc.folderid,
            // History would need a separate query if needed in this list view
        }));


        res.json({
            data: formattedData,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
            }
        });
    } catch (error) {
        console.error('Failed to fetch documents:', error);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});


// GET /api/documents/recent
router.get('/recent', async (req, res) => {
    try {
        const query = `
            SELECT d.id, d.name, u.name as uploader_name, d.uploadedAt
            FROM documents d
            JOIN users u ON d.uploaderId = u.id
            ORDER BY d.uploadedAt DESC
            LIMIT 5
        `;
        const { rows } = await db.query(query);
        const recentDocs = rows.map(d => ({
            id: d.id,
            name: d.name,
            uploader: d.uploader_name,
            uploadedAt: d.uploadedat
        }));
        res.json(recentDocs);
    } catch (error) {
        console.error('Failed to fetch recent documents:', error);
        res.status(500).json({ message: 'Failed to fetch recent documents' });
    }
});


// GET /api/documents/{id}
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Get document details
        const docQuery = `
            SELECT d.*, u.id as uploader_id, u.name as uploader_name
            FROM documents d
            LEFT JOIN users u ON d.uploaderId = u.id
            WHERE d.id = $1
        `;
        const { rows: docRows } = await db.query(docQuery, [id]);
        if (docRows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        const doc = docRows[0];

        // Get document history
        const historyQuery = `SELECT * FROM document_history WHERE documentId = $1 ORDER BY timestamp DESC`;
        const { rows: historyRows } = await db.query(historyQuery, [id]);

        // Format response
        const response = {
            id: doc.id,
            name: doc.name,
            description: doc.description,
            status: doc.status,
            fileUrl: doc.fileurl,
            uploader: {
                id: doc.uploader_id,
                name: doc.uploader_name
            },
            uploadedAt: doc.uploadedat,
            folderId: doc.folderid,
            history: historyRows.map(h => ({
                action: h.action,
                user: h.user,
                timestamp: h.timestamp,
                comment: h.comment,
            })),
        };

        res.json(response);
    } catch (error) {
        console.error(`Failed to fetch document ${id}:`, error);
        res.status(500).json({ message: 'Failed to fetch document' });
    }
});

// POST /api/documents - Upload a new document
router.post('/', upload.single('file'), async (req, res) => {
    const { name, description, folderId } = req.body;
    const uploaderId = req.user.id;
    const parsedFolderId = folderId ? parseInt(folderId, 10) : null;

    if (!req.file) {
        return res.status(400).json({ message: 'File is required.' });
    }

    const fileName = `${Date.now()}-${req.file.originalname.replace(/\s/g, '_')}`;
    const fileUrl = `http://${config.minio.endPoint}:${config.minio.port}/${bucketName}/${fileName}`;

    try {
        // Upload to Minio
        await minioClient.putObject(bucketName, fileName, req.file.buffer, {
            'Content-Type': req.file.mimetype
        });

        // Insert into PostgreSQL
        const query = `
            INSERT INTO documents (name, description, folderId, status, fileUrl, uploaderId, uploadedAt)
            VALUES ($1, $2, $3, 'pending', $4, $5, NOW())
            RETURNING *;
        `;
        const { rows } = await db.query(query, [name, description, parsedFolderId, fileUrl, uploaderId]);
        const newDoc = rows[0];

        // Add to history
        await db.query(
            'INSERT INTO document_history (action, "user", timestamp, documentId) VALUES ($1, $2, NOW(), $3)',
            ['Uploaded', req.user.name, newDoc.id]
        );
        
        res.status(201).json({
            ...newDoc,
            fileurl: newDoc.fileurl
        });

    } catch (error) {
        console.error('Failed to upload document:', error);
        res.status(500).json({ message: 'Failed to upload document.' });
    }
});

// PUT /api/documents/{id}
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        const query = `
            UPDATE documents SET name = $1, description = $2
            WHERE id = $3 RETURNING *`;
        const { rows } = await db.query(query, [name, description, id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(`Failed to update document ${id}:`, error);
        res.status(500).json({ message: 'Failed to update document' });
    }
});

// DELETE /api/documents/{id}
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // First, get the fileUrl to delete from Minio
        const { rows } = await db.query('SELECT fileUrl FROM documents WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }
        const fileUrl = rows[0].fileurl;
        const objectName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

        // Delete from Minio
        await minioClient.removeObject(bucketName, objectName);

        // Delete from DB
        await db.query('DELETE FROM documents WHERE id = $1', [id]);

        res.status(204).send();
    } catch (error) {
        console.error(`Failed to delete document ${id}:`, error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
});

// POST /api/documents/{id}/status
router.post('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, comment } = req.body;
    const adminUser = req.user;

    try {
        const updateQuery = `UPDATE documents SET status = $1 WHERE id = $2 RETURNING *`;
        const { rows } = await db.query(updateQuery, [status, id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const historyQuery = `
            INSERT INTO document_history (action, "user", timestamp, comment, documentId)
            VALUES ($1, $2, NOW(), $3, $4)`;
        const action = status === 'approved' ? 'Approved' : 'Rejected';
        await db.query(historyQuery, [action, adminUser.name, comment, id]);

        res.json({ message: 'Document status updated successfully' });
    } catch (error) {
        console.error(`Failed to update status for document ${id}:`, error);
        res.status(500).json({ message: 'Failed to update document status' });
    }
});


module.exports = router;
