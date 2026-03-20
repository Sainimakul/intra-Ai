require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
console.log(process.env.FRONTEND_URL)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/api/chat', cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: 'Too many requests.' } });
app.use('/api/', globalLimiter);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many auth attempts.' } });

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bots', require('./routes/bots'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/knowledge', require('./routes/knowledge'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 INTRA AI Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
});

module.exports = app;
