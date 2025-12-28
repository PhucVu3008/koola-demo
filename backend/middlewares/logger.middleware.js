/**
 * ============================================================================
 * ACTIVITY LOGGER MIDDLEWARE
 * ============================================================================
 * 
 * Mục đích: Ghi log tất cả hoạt động CRUD và login
 * - Logs được lưu SAU KHI action thành công
 * - Lưu userId, action, details, IP, timestamp
 * - Bonus requirement: "Ghi log login và thao tác CRUD"
 * ============================================================================
 */

const ActivityLog = require('../models/ActivityLog.model');

/**
 * Log Activity Middleware
 * 
 * IMPORTANT: Middleware này được gọi TRƯỚC controller.
 * Nó intercept res.json() để log SAU KHI controller thành công.
 * 
 * Flow:
 * 1. Save original res.json
 * 2. Override res.json to intercept
 * 3. Call next() → controller runs
 * 4. When controller calls res.json() → our interceptor runs → log → original res.json
 */
const logActivity = (action) => {
  return (req, res, next) => {
    // Save original methods
    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);
    
    // Track status code
    let statusCode = 200;
    
    // Override res.status to track status code
    res.status = function(code) {
      statusCode = code;
      return originalStatus(code);
    };
    
    // Override res.json
    res.json = function(data) {
      // Log asynchronously (don't block response)
      (async () => {
        try {
          // Log if authenticated and successful
          if (req.user && statusCode >= 200 && statusCode < 300) {
            console.log(`🔄 Attempting to log: ${action} (status: ${statusCode})`);
            
            const log = await ActivityLog.create({
              userId: req.user._id,
              action: action,
              details: JSON.stringify({
                method: req.method,
                path: req.originalUrl,
                body: req.body,
                params: req.params
              }),
              ip: req.ip || req.connection.remoteAddress || '0.0.0.0'
            });
            
            console.log(`✅ Logged: ${action} by user ${req.user._id} - Log ID: ${log._id}`);
          } else {
            console.log(`⏭️  Skipping log: user=${!!req.user}, status=${statusCode}`);
          }
        } catch (error) {
          console.error('❌ Logger middleware error:', error);
        }
      })();
      
      // Call original res.json immediately
      return originalJson(data);
    };
    
    next();
  };
};

module.exports = logActivity;
