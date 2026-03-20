const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const {
  getSources,
  uploadFile,
  addUrlSource,
  addDatabaseSource,
  addTextSource,
  deleteSource,
} = require('../controllers/knowledge');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/pdfs');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.txt', '.md', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only PDF, TXT, MD, DOCX files allowed'));
  },
});

router.get('/bot/:botId',          authenticate, getSources);
router.post('/upload/:botId',      authenticate, upload.single('file'), uploadFile);
router.post('/url/:botId',         authenticate, addUrlSource);
router.post('/database/:botId',    authenticate, addDatabaseSource);
router.post('/text/:botId',        authenticate, addTextSource);
router.delete('/:sourceId',        authenticate, deleteSource);

module.exports = router;