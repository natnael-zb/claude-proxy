
const https = require('https');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(200).json({ status: 'ok' });
    return;
  }
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const opts = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': req.headers['x-api-key'] || '',
      'anthropic-version': req.headers['anthropic-version'] || '2023-06-01',
      'Content-Length': Buffer.byteLength(body),
    },
  };
  const p = https.request(opts, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (c) => { data += c; });
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode).setHeader('Content-Type', 'application/json').end(data);
    });
  });
  p.on('error', (e) => { res.status(502).json({ error: e.message }); });
  p.write(body);
  p.end();
};
