require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, '../uploads/pdfs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Invalid or expired token',
    });
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'SCI Past Papers API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is working' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database()');
    res.json({ status: 'OK', database: result.rows[0].current_database });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed' });
  }
});

// PUBLIC — the 15 schools shown on Home
app.get('/api/schools', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name
      FROM schools
      ORDER BY name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch schools' });
  }
});

// Kept for backward compatibility / admin use
app.get('/api/departments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        departments.id,
        departments.name,
        schools.name AS school_name
      FROM departments
      INNER JOIN schools ON departments.school_id = schools.id
      ORDER BY schools.name, departments.name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch departments' });
  }
});

// PUBLIC — only approved papers, with department and school attached
app.get('/api/papers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        papers.id,
        papers.code,
        papers.title,
        papers.year,
        papers.semester,
        papers.type,
        papers.pdf_url,
        papers.status,
        papers.created_at,
        departments.id AS department_id,
        departments.name AS department_name,
        schools.id AS school_id,
        schools.name AS school_name
      FROM papers
      INNER JOIN departments ON papers.department_id = departments.id
      INNER JOIN schools ON departments.school_id = schools.id
      WHERE papers.status = 'approved'
      ORDER BY papers.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching papers:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch papers' });
  }
});

// PUBLIC — upload now takes a school (must exist) and a free-text department
app.post('/api/papers', upload.single('pdf'), async (req, res) => {
  try {
    const { school, department, code, title, year, semester, type } = req.body;

    if (!school || !department || !code || !title || !year || !semester || !type) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required fields',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'PDF file is required',
      });
    }

    const schoolResult = await pool.query(
      'SELECT id FROM schools WHERE name = $1',
      [school]
    );

    if (schoolResult.rows.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: `Unknown school: ${school}`,
      });
    }

    const schoolId = schoolResult.rows[0].id;
    const departmentName = department.trim();

    // Find an existing department under this school with the same
    // name (case-insensitive), or create a new one.
    let departmentId;

    const existingDept = await pool.query(
      `SELECT id FROM departments
       WHERE school_id = $1 AND LOWER(name) = LOWER($2)`,
      [schoolId, departmentName]
    );

    if (existingDept.rows.length > 0) {
      departmentId = existingDept.rows[0].id;
    } else {
      const newDept = await pool.query(
        `INSERT INTO departments (name, school_id) VALUES ($1, $2) RETURNING id`,
        [departmentName, schoolId]
      );
      departmentId = newDept.rows[0].id;
    }

    const pdfUrl = `/uploads/pdfs/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO papers (code, title, year, semester, type, pdf_url, department_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING id, code, title, year, semester, type, pdf_url, status, created_at, department_id`,
      [code, title, Number(year), semester, type, pdfUrl, departmentId]
    );

    res.status(201).json({ status: 'OK', paper: result.rows[0] });
  } catch (error) {
    console.error('Error uploading paper:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to upload paper' });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Report message is required',
      });
    }

    const result = await pool.query(
      `INSERT INTO reports (message) VALUES ($1) RETURNING id, message, status, created_at`,
      [message.trim()]
    );

    res.status(201).json({ status: 'OK', report: result.rows[0] });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to submit report' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Username and password are required',
      });
    }

    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'ERROR', message: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ status: 'ERROR', message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ status: 'OK', token, username: admin.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'ERROR', message: 'Login failed' });
  }
});

app.get('/api/admin/papers', requireAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'pending';

    const baseQuery = `
      SELECT
        papers.id,
        papers.code,
        papers.title,
        papers.year,
        papers.semester,
        papers.type,
        papers.pdf_url,
        papers.status,
        papers.created_at,
        departments.name AS department_name,
        schools.name AS school_name
      FROM papers
      INNER JOIN departments ON papers.department_id = departments.id
      INNER JOIN schools ON departments.school_id = schools.id
    `;

    const result =
      status === 'all'
        ? await pool.query(`${baseQuery} ORDER BY papers.created_at DESC`)
        : await pool.query(
            `${baseQuery} WHERE papers.status = $1 ORDER BY papers.created_at DESC`,
            [status]
          );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin papers:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch papers' });
  }
});

app.post('/api/admin/papers/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE papers SET status = 'approved' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Paper not found' });
    }

    res.json({ status: 'OK', paper: result.rows[0] });
  } catch (error) {
    console.error('Error approving paper:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to approve paper' });
  }
});

app.post('/api/admin/papers/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE papers SET status = 'rejected' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Paper not found' });
    }

    res.json({ status: 'OK', paper: result.rows[0] });
  } catch (error) {
    console.error('Error rejecting paper:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to reject paper' });
  }
});

app.delete('/api/admin/papers/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM papers WHERE id = $1 RETURNING pdf_url`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Paper not found' });
    }

    const { pdf_url } = result.rows[0];

    if (pdf_url) {
      const filePath = path.join(__dirname, '..', pdf_url);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting PDF file:', err);
        }
      });
    }

    res.json({ status: 'OK', message: 'Paper deleted' });
  } catch (error) {
    console.error('Error deleting paper:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to delete paper' });
  }
});

app.get('/api/admin/reports', requireAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'new';

    const result = await pool.query(
      `SELECT id, message, status, created_at FROM reports WHERE status = $1 ORDER BY created_at DESC`,
      [status]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch reports' });
  }
});

app.post('/api/admin/reports/:id/resolve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE reports SET status = 'resolved' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'ERROR', message: 'Report not found' });
    }

    res.json({ status: 'OK', report: result.rows[0] });
  } catch (error) {
    console.error('Error resolving report:', error);
    res.status(500).json({ status: 'ERROR', message: 'Failed to resolve report' });
  }
});

app.use((err, req, res, next) => {
  console.error('Upload error:', err.message);
  res.status(400).json({ status: 'ERROR', message: err.message || 'Upload failed' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SCI Past Papers API running on http://localhost:${PORT}`);
});