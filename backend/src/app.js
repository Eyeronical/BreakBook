const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { errorHandler } = require('./utils/errors');

const employeesRoutes = require('./routes/employees.routes');
const leavesRoutes = require('./routes/leaves.routes');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => res.send('✅ BreakBook API running'));

app.use('/api/v1/employees', employeesRoutes);
app.use('/api/v1/leaves', leavesRoutes);

app.use(errorHandler);

module.exports = app;
