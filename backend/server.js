/**
 * ============================================================================
 * KOOLA PROJECT - MAIN SERVER FILE
 * ============================================================================
 * 
 * Mục đích: Entry point của backend server
 * - Khởi tạo Express app
 * - Cấu hình middleware
 * - Đăng ký routes
 * - Kết nối database
 * - Xử lý lỗi tập trung
 * 
 * Công nghệ: Node.js v22, Express.js, MongoDB
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/error.middleware');
const notFound = require('./middlewares/not-found.middleware');

// ============================================================================
// IMPORT ROUTES
// ============================================================================
const sessionRoutes = require('./routes/session.routes');
const userRoutes = require('./routes/user.routes');
const settingRoutes = require('./routes/setting.routes');
const systemRoutes = require('./routes/system.routes');
const logRoutes = require('./routes/log.routes');

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
connectDB();

// ============================================================================
// EXPRESS APP INITIALIZATION
// ============================================================================
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// CORS - Cho phép cross-origin requests từ frontend
app.use(cors());

// Body Parser - Parse JSON và URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust Proxy - Lấy real IP address (quan trọng cho IP blocking)
app.set('trust proxy', true);

// ============================================================================
// API ROUTES REGISTRATION
// ============================================================================
// Tất cả routes đều bắt đầu với /api prefix theo chuẩn REST

app.use('/api/sessions', sessionRoutes); // Session routes (login)
app.use('/api/users', userRoutes);       // User CRUD routes
app.use('/api/settings', settingRoutes); // Settings management routes
app.use('/api/system', systemRoutes);    // System information routes
app.use('/api/logs', logRoutes);         // Activity logs routes (lv3 only)

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================
// 404 handler cần đứng trước error handler để bắt route không tồn tại.
app.use(notFound);

// QUAN TRỌNG: Error handler phải được đăng ký cuối cùng
// Xử lý tập trung tất cả các lỗi trong ứng dụng
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 API Base URL: http://localhost:${PORT}/api`);
});
