const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const documentRoutes = require('./routes/documents');
const folderRoutes = require('./routes/folders');
const taskRoutes = require('./routes/tasks');
const statsRoutes = require('./routes/stats');
const roleRoutes = require('./routes/roles');
const permissionRoutes = require('./routes/permissions');
const systemRoutes = require('./routes/system'); // Import system routes


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Remove serving static files from local "uploads" directory
// app.use('/uploads', express.static('uploads'));


app.get('/', (req, res) => {
  res.send('QLTL Mock Server is running!');
});

// Mount the routes
app.use('/api/auth', authRoutes.router);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes); // for /api/stats and /api/reports
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/system', systemRoutes); // Mount system routes


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
