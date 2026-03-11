#!/usr/bin/env node

const http = require('http');

const port = Number(process.env.PORT || 8787);

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/exec') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const required = ['title', 'platform', 'url', 'userDifficulty', 'solvedAt'];
        const missing = required.filter((field) => !payload[field]);

        if (missing.length > 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: `Missing fields: ${missing.join(', ')}` }));
          return;
        }

        console.log('\n[Mock Apps Script] Received payload:');
        console.log(JSON.stringify(payload, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'Row appended (mock).' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON body' }));
      }
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Not Found' }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[Mock Apps Script] Listening on http://127.0.0.1:${port}/exec`);
});
