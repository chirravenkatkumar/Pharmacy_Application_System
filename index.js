const express = require('express');
const multer = require('multer');
const { Pool } = require('pg');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads')); // Serve files
app.use(express.static('public')); // Serve static files from 'public'

// Serve index.html for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
});

pool.query(`
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`).then(() => console.log("✅ Table 'files' is ready"))
  .catch(err => console.error("❌ Error creating table:", err));

// Function to generate a 6-digit numeric ID
function generateFileId() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a number between 100000 and 999999
}

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${generateFileId()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 📤 **File Upload API**
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileId = generateFileId(); // Generate a 6-digit numeric ID
  const fileName = req.file.filename;
  const filePath = req.file.path;

  try {
    await pool.query('INSERT INTO files (id, filename, filepath) VALUES ($1, $2, $3)', [fileId, fileName, filePath]);
    
    // Generate QR Code
    const qrCode = await QRCode.toDataURL(fileId);

    res.json({ fileId, qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error uploading file" });
  }
});

// 📥 **File Download API**
app.get('/download/:id', async (req, res) => {
  const fileId = req.params.id;

  try {
    const result = await pool.query('SELECT * FROM files WHERE id = $1', [fileId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = result.rows[0];
    res.download(file.filepath, file.filename);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error retrieving file" });
  }
});

// 🚀 Start Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
