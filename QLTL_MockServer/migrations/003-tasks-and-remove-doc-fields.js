const { pool } = require('../db/postgres');

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add tasks tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        assigneeId INT REFERENCES users(id) ON DELETE SET NULL,
        dueDate TIMESTAMPTZ,
        createdBy INT REFERENCES users(id) ON DELETE SET NULL,
        createdAt TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS task_approvers (
        taskId INT REFERENCES tasks(id) ON DELETE CASCADE,
        approverId INT REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (taskId, approverId)
      );

      CREATE TABLE IF NOT EXISTS task_documents (
        taskId INT REFERENCES tasks(id) ON DELETE CASCADE,
        documentId INT REFERENCES documents(id) ON DELETE CASCADE,
        PRIMARY KEY (taskId, documentId)
      );

      CREATE TABLE IF NOT EXISTS task_history (
        id SERIAL PRIMARY KEY,
        taskId INT REFERENCES tasks(id) ON DELETE CASCADE,
        action VARCHAR(255) NOT NULL,
        actorId INT REFERENCES users(id) ON DELETE SET NULL,
        comment TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS task_messages (
        id SERIAL PRIMARY KEY,
        taskId INT REFERENCES tasks(id) ON DELETE CASCADE,
        senderId INT REFERENCES users(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        sentAt TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Remove handlerId and deadline from documents if exist
    const columns = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'documents';
    `);
    const names = columns.rows.map(r => r.column_name);
    if (names.includes('handlerid')) {
      await client.query('ALTER TABLE documents DROP COLUMN handlerId');
    }
    if (names.includes('deadline')) {
      await client.query('ALTER TABLE documents DROP COLUMN deadline');
    }

    await client.query('COMMIT');
    console.log('Migration 003 completed');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration 003 failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();


