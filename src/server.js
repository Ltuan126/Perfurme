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

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server requests or same-origin requests without Origin header.
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0) {
      // Development fallback for local frontend if CORS_ORIGIN is not set.
      if (process.env.NODE_ENV !== 'production' && origin === 'http://localhost:3000') {
        return callback(null, true);
      }
      return callback(new Error('CORS origin not allowed'));
    }

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --- Global Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions));

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
