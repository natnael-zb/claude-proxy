/**
 * Claude API Proxy for Letena Ethiopia
 * Runs on Render.com (Oregon, US) to bypass regional restrictions.
 * Forwards requests to api.anthropic.com without exposing client IP.
 */

const express = require('express');
const https = require('https');
const app = express();

app.use(express.raw({ type: '*/*', limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Letena Claude Proxy', region: 'US-Oregon' });
});

// Proxy POST requests to Anthropic
app.post('/v1/messages', (req, res) => {
  const options = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': req.headers['x-api-key'] || '',
      'anthropic-version': req.headers['anthropic-version'] || '2023-06-01',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    res.set('Content-Type', 'application/json');
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(502).json({ error: 'Proxy error', message: err.message });
  });

  proxyReq.write(req.body);
  proxyReq.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Claude proxy running on port ${PORT}`));
