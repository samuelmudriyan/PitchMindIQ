// ============================================================================
// PITCHMIND BACKEND - server.js
// ============================================================================

const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./stripe-api');

const app = express();

// ============================================================================
// CORS CONFIGURATION - Must allow x-user-id header
// ============================================================================
const corsOptions = {
  origin: [
    'https://pitchmindiq.com',
    'https://www.pitchmindiq.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-user-id',  // <-- This is required for subscription checks
    'X-User-Id',
    'x-clerk-user-id',
  ],
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ============================================================================
// STRIPE WEBHOOK - Must be BEFORE express.json()
// ============================================================================
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// ============================================================================
// BODY PARSERS
// ============================================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// ROUTES
// ============================================================================

// Mount Stripe routes
app.use('/api/stripe', stripeRoutes);
app.use('/api', stripeRoutes);  // Also mount at /api for /api/subscription/status

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'PitchMind API is running' });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found', path: req.url });
});

// ============================================================================
// START SERVER
// ============================================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 PitchMind API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
});

module.exports = app;
