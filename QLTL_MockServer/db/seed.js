const fs = require('fs');
const path = require('path');
const { pool } = require('./postgres');
const seedData = require('./seed-data');
const { minioClient, bucketName } = require('../services/minio');


async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log('Starting database seed...');
    await client.query('BEGIN');

    // Run init.sql
    const initSql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await client.query(initSql);
    console.log('Database schema created.');

    // Seed permissions
    for (const p of seedData.permissions) {
      await client.query('INSERT INTO permissions (id, name) VALUES ($1, $2)', [p.id, p.name]);
    }
    console.log('Permissions seeded.');

    // Seed roles and role_permissions
    for (const r of seedData.roles) {
      const res = await client.query('INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) RETURNING id', [r.id, r.name, r.description]);
      const roleId = res.rows[0].id;
      for (const pId of r.permissions) {
        await client.query('INSERT INTO role_permissions (roleId, permissionId) VALUES ($1, $2)', [roleId, pId]);
      }
    }
    console.log('Roles and permissions seeded.');
    
    // Seed users
    for (const u of seedData.users) {
        await client.query(
            'INSERT INTO users (id, name, email, password, role_id, createdAt) VALUES ($1, $2, $3, $4, $5, $6)',
            [u.id, u.name, u.email, u.password, u.role_id, u.createdAt]
        );
    }
    console.log('Users seeded.');

    // Seed folders (requires handling parent-child relationships)
    const seededFolders = {}; // id -> db_id
    for (const f of seedData.folders) {
       const res = await client.query('INSERT INTO folders (id, name, parentId) VALUES ($1, $2, $3) RETURNING id', [f.id, f.name, null]);
       seededFolders[f.id] = res.rows[0].id;
       if (f.children && f.children.length > 0) {
           for (const child of f.children) {
               const childRes = await client.query('INSERT INTO folders (id, name, parentId) VALUES ($1, $2, $3) RETURNING id', [child.id, child.name, seededFolders[f.id]]);
               seededFolders[child.id] = childRes.rows[0].id;
           }
       }
    }
    console.log('Folders seeded.');
    
    // Seed documents
    for (const d of seedData.documents) {
        const docRes = await client.query(
            'INSERT INTO documents (id, name, description, status, fileUrl, uploaderId, uploadedAt, folderId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [d.id, d.name, d.description, d.status, d.fileUrl, d.uploader.id, d.uploadedAt, d.folderId]
        );
        const docId = docRes.rows[0].id;
        for (const h of d.history) {
            await client.query(
                'INSERT INTO document_history (action, "user", timestamp, documentId) VALUES ($1, $2, $3, $4)',
                [h.action, h.user, h.timestamp, docId]
            );
        }
    }
    console.log('Documents seeded.');

    // Seed tasks
    for (const t of seedData.tasks) {
        const tRes = await client.query(
            'INSERT INTO tasks (id, name, description, status, assigneeId, dueDate, createdBy, createdAt) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [t.id, t.name, t.description, t.status, t.assigneeId, t.dueDate, t.createdBy, t.createdAt]
        );
        const taskId = tRes.rows[0].id;
        for (const approverId of t.approverIds) {
            await client.query('INSERT INTO task_approvers (taskId, approverId) VALUES ($1, $2)', [taskId, approverId]);
        }
        for (const documentId of t.documentIds) {
            await client.query('INSERT INTO task_documents (taskId, documentId) VALUES ($1, $2)', [taskId, documentId]);
        }
        await client.query('INSERT INTO task_history (taskId, action, actorId, comment, timestamp) VALUES ($1, $2, $3, $4, $5)', [taskId, 'created', t.createdBy, null, t.createdAt]);
    }
    console.log('Tasks seeded.');

    await client.query('COMMIT');
    console.log('Database seed successful!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Database seed failed:', e);
  } finally {
    client.release();
  }
}

async function resetStorage() {
    try {
        const stream = minioClient.listObjects(bucketName, '', true);
        const objects = [];
        stream.on('data', obj => objects.push(obj.name));
        stream.on('end', () => {
            if (objects.length > 0) {
                minioClient.removeObjects(bucketName, objects, (err) => {
                    if (err) {
                        return console.log('Failed to remove objects', err);
                    }
                    console.log('Removed all objects from bucket ' + bucketName);
                });
            } else {
                console.log('Bucket ' + bucketName + ' is already empty.');
            }
        });
         stream.on('error', err => console.error('Error listing objects for deletion:', err));
    } catch (e) {
        console.error('Failed to reset storage:', e);
    }
}


async function resetAndSeed() {
    await resetStorage();
    await seedDatabase();
}

module.exports = { resetAndSeed };
