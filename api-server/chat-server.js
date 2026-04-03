const http = require('http');
const https = require('https');

const PORT = 3001;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'minimax/minimax-m2.5';

function transformToAnthropicFormat(data) {
  try {
    const choice = data.choices && data.choices[0];
    if (!choice) return null;
    
    const delta = choice.delta;
    if (!delta) return null;

    // Stream chunk with content
    if (delta.content !== undefined) {
      return JSON.stringify({ type: "chunk", text: delta.content });
    }
    
    // Final chunk with finish_reason
    if (choice.finish_reason) {
      return JSON.stringify({ type: "done" });
    }
    
    return null;
  } catch (e) {
    return null;
  }
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

      const req2 = https.request(options, (res2) => {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });

        let buffer = '';
        res2.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const raw = line.slice(6).trim();
              if (raw === '[DONE]') {
                res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
                continue;
              }
              const transformed = transformToAnthropicFormat(JSON.parse(raw));
              if (transformed) {
                res.write('data: ' + transformed + '\n\n');
              }
            }
          }
        });

        res2.on('end', () => {
          // flush remaining buffer
          if (buffer.trim() && buffer.startsWith('data: ')) {
            const raw = buffer.slice(6).trim();
            if (raw !== '[DONE]') {
              try {
                const transformed = transformToAnthropicFormat(JSON.parse(raw));
                if (transformed) res.write('data: ' + transformed + '\n\n');
              } catch (e) {}
            }
          }
          res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
          res.end();
        });
      });

      req2.on('error', (e) => {
        console.error('OpenRouter error:', e.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upstream error: ' + e.message }));
      });

      req2.write(postData);
      req2.end();

    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request: ' + e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Chat API server running on port', PORT);
});
