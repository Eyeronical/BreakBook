const express = require('express');
require('dotenv').config();

const employeesRoutes = require('./routes/employees.routes');
const leavesRoutes = require('./routes/leaves.routes');
const { errorHandler } = require('./utils/errors');

const app = express();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/', (req, res) => res.send('✅ BreakBook API running'));

app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/leaves', leavesRoutes);

app.use(errorHandler);

module.exports = app;
