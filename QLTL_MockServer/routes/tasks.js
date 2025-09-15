const express = require('express');
const db = require('../db/postgres');
const { authMiddleware } = require('./auth');
const router = express.Router();

router.use(authMiddleware);

// GET /api/tasks - list tasks for user (assigned or created)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const scope = (req.query.scope || '').toLowerCase();

    let where = 't.assigneeid = $1 OR t.createdby = $1';
    if (scope === 'assigned') where = 't.assigneeid = $1';
    else if (scope === 'created') where = 't.createdby = $1';
    else if (scope === 'all' && req.user.role === 'Admin') where = '1=1';

    const params = scope === 'all' && req.user.role === 'Admin' ? [] : [userId];

    const { rows } = await db.query(`
      SELECT t.id, t.name, t.status, t.duedate, t.createdat,
             assignee.id as assignee_id, assignee.name as assignee_name,
             creator.id as creator_id, creator.name as creator_name
      FROM tasks t
      LEFT JOIN users assignee ON t.assigneeid = assignee.id
      LEFT JOIN users creator ON t.createdby = creator.id
      WHERE ${where}
      ORDER BY t.createdat DESC
    `, params);

    res.json({ data: rows });
  } catch (error) {
    console.error('Failed to get tasks:', error);
    res.status(500).json({ message: 'Failed to retrieve tasks.' });
  }
});

// POST /api/tasks - create task
router.post('/', async (req, res) => {
  const { name, description, assigneeId, approverIds = [], dueDate, documentIds = [] } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const taskRes = await client.query(
      `INSERT INTO tasks (name, description, status, assigneeId, dueDate, createdBy)
       VALUES ($1, $2, 'open', $3, $4, $5) RETURNING id`,
      [name, description || '', assigneeId || null, dueDate || null, req.user.id]
    );
    const taskId = taskRes.rows[0].id;

    for (const approverId of approverIds) {
      await client.query('INSERT INTO task_approvers (taskId, approverId) VALUES ($1, $2)', [taskId, approverId]);
    }
    for (const documentId of documentIds) {
      await client.query('INSERT INTO task_documents (taskId, documentId) VALUES ($1, $2)', [taskId, documentId]);
    }
    await client.query('INSERT INTO task_history (taskId, action, actorId, comment) VALUES ($1, $2, $3, $4)', [taskId, 'created', req.user.id, null]);
    await client.query('COMMIT');
    res.status(201).json({ id: taskId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to create task:', error);
    res.status(500).json({ message: 'Failed to create task.' });
  } finally {
    client.release();
  }
});

// GET /api/tasks/:id - task detail
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const taskRes = await db.query(`
      SELECT t.*, assignee.name as assignee_name, creator.name as creator_name
      FROM tasks t
      LEFT JOIN users assignee ON t.assigneeid = assignee.id
      LEFT JOIN users creator ON t.createdby = creator.id
      WHERE t.id = $1
    `, [id]);
    if (taskRes.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    const task = taskRes.rows[0];

    const approversRes = await db.query(`
      SELECT u.id, u.name FROM task_approvers ta JOIN users u ON ta.approverid = u.id WHERE ta.taskid = $1
    `, [id]);
    const documentsRes = await db.query(`
      SELECT d.id, d.name, d.status, d.fileUrl
      FROM task_documents td JOIN documents d ON td.documentid = d.id WHERE td.taskid = $1
    `, [id]);
    const historyRes = await db.query(`
      SELECT th.id, th.action, th.comment, th.timestamp, u.id as actor_id, u.name as actor_name
      FROM task_history th LEFT JOIN users u ON th.actorid = u.id WHERE th.taskid = $1 ORDER BY th.timestamp DESC
    `, [id]);
    const messagesRes = await db.query(`
      SELECT tm.id, tm.message, tm.sentat, u.id as sender_id, u.name as sender_name
      FROM task_messages tm LEFT JOIN users u ON tm.senderid = u.id WHERE tm.taskid = $1 ORDER BY tm.sentat DESC
    `, [id]);

    res.json({
      id: task.id,
      name: task.name,
      description: task.description,
      status: task.status,
      dueDate: task.duedate,
      assignee: task.assigneeid ? { id: task.assigneeid, name: task.assignee_name } : null,
      createdBy: task.createdby ? { id: task.createdby, name: task.creator_name } : null,
      createdAt: task.createdat,
      approvers: approversRes.rows,
      documents: documentsRes.rows.map(d => ({ id: d.id, name: d.name, status: d.status, fileUrl: d.fileurl })),
      history: historyRes.rows,
      messages: messagesRes.rows
    });
  } catch (error) {
    console.error('Failed to get task detail:', error);
    res.status(500).json({ message: 'Failed to retrieve task detail.' });
  }
});

// POST /api/tasks/:id/messages - add message
router.post('/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO task_messages (taskId, senderId, message) VALUES ($1, $2, $3) RETURNING id, sentAt',
      [id, req.user.id, message]
    );
    res.status(201).json({ id: rows[0].id, sentAt: rows[0].sentat });
  } catch (error) {
    console.error('Failed to add message:', error);
    res.status(500).json({ message: 'Failed to add message.' });
  }
});

module.exports = router;
