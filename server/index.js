const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = require('./config/database');

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

// Import routes
const personnelRoutes = require('./routes/personnel');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const matchingRoutes = require('./routes/matching');

// Use routes
app.use('/api/personnel', personnelRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/matching', matchingRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Skills Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});