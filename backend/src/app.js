// backend/src/app.js
const express = require('express');
const cors = require('cors'); // Enable CORS support

// Routers
const employeesRoutes = require('./routes/employees.routes');
const leavesRoutes = require('./routes/leaves.routes');

// Error utilities
const { errorHandler, notFound } = require('./utils/errors');

const app = express();

/* 
   ---- CORS CONFIG ----
   Allow localhost:5173 (Vite dev) and your deployed Vercel frontend.
   You can also set these in .env as: CORS_ORIGIN=http://localhost:5173,https://breakbook.vercel.app
*/
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,https://breakbook.vercel.app')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: function (origin, cb) {
    // allow REST clients without origin (curl/Postman) and allowed list
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Handle preflight requests for all routes
app.options('*', cors());

/* ---- Global middleware ---- */
app.use(express.json());

/* ---- Health endpoint ---- */
app.get('/', (req, res) => {
  res.send('✅ BreakBook API running');
});

/* ---- API routes ---- */
app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/leaves', leavesRoutes);

/* ---- 404 for /api paths ---- */
app.use('/api', notFound);

/* ---- Global error handler ---- */
app.use(errorHandler);

module.exports = app;
