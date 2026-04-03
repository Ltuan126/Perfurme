require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Database connection (must be before models)
require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/review');
const qaRoutes = require('./routes/qa');
const paymentRoutes = require('./routes/payment');

// Import middleware
const { authRequired } = require('./middleware/auth');
const { getMe, updateMe } = require('./controllers/authController');
const { validateProfileUpdate } = require('./middleware/validate');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize app
const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --- Global Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/qas', qaRoutes);
app.use('/api/payment', paymentRoutes);

// User profile route
app.get('/api/me', authRequired, getMe);
app.put('/api/me', authRequired, validateProfileUpdate, updateMe);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} không tồn tại` });
});

// --- Global Error Handler (must be last) ---
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy ở cổng ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});
