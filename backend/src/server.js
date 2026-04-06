const express = require('express');
const cors = require('cors');
const config = require('./config');
const whoopRoutes = require('./routes/whoop');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// WHOOP integration routes
app.use('/api/whoop', whoopRoutes);

app.listen(config.port, () => {
  console.log(`Training Intelligence API running on port ${config.port}`);
  console.log(`WHOOP OAuth: GET http://localhost:${config.port}/api/whoop/auth`);
  console.log(`Health check: GET http://localhost:${config.port}/health`);
  console.log(`WHOOP Client ID: ${config.whoop.clientId ? '***configured***' : 'MISSING'}`);
});
