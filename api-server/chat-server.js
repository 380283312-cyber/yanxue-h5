const http = require('http');
const https = require('https');

const PORT = 3001;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'minimax/minimax-m2.5';

if (!OPENROUTER_KEY) {
  console.error('OPENROUTER_API_KEY not set!');
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || !req.url.startsWith('/chat')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  if (!OPENROUTER_KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API key not configured' }));
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { messages, model } = JSON.parse(body);

      const postData = JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages,
        max_tokens: 2048,
        stream: true,
      });

      const urlObj = new URL(OPENROUTER_URL);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://yanxue-h5.vercel.app',
          'X-Title': 'yanxue-h5',
        }
      };

      const miniReq = https.request(options, (miniRes) => {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });
        miniRes.on('data', (chunk) => { res.write(chunk); });
        miniRes.on('end', () => { res.end(); });
      });

      miniReq.on('error', (e) => {
        console.error('OpenRouter error:', e.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upstream error' }));
      });

      miniReq.write(postData);
      miniReq.end();

    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request: ' + e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Chat API server running on port ${PORT} (OpenRouter)`);
});
