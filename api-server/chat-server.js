const http = require('http');
const https = require('https');

const PORT = 3001;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'minimax/minimax-m2.5';

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
        stream: false,
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
        let data = '';
        res2.on('data', (c) => { data += c.toString(); });
        res2.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const msg = parsed.choices && parsed.choices[0] && parsed.choices[0].message || {};
            // Use content if available, otherwise reasoning
            let text = msg.content || String(msg.reasoning || '');

            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            });

            if (!text) {
              res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
              res.end();
              return;
            }

            // Clean up the text: remove thinking markers like "The user asks... They want..." pattern
            // and extract the actual answer portion
            const cleaned = cleanText(text);

            // Stream cleaned text in sentence chunks
            const chunks = splitIntoChunks(cleaned, 60);
            let i = 0;
            function sendNext() {
              if (i >= chunks.length) {
                res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
                res.end();
                return;
              }
              res.write('data: ' + JSON.stringify({ type: 'chunk', text: chunks[i] }) + '\n\n');
              i++;
              setTimeout(sendNext, 30);
            }
            sendNext();

          } catch (e) {
            console.error('Parse error:', e.message, 'data:', data.slice(0, 200));
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to parse response' }));
          }
        });
      });

      req2.on('error', (e) => {
        console.error('OpenRouter error:', e.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upstream error' }));
      });

      req2.write(postData);
      req2.end();

    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request: ' + e.message }));
    }
  });
});

// Split text into sentence-level chunks (max 60 chars each)
function splitIntoChunks(text, maxChars) {
  const chunks = [];
  const sentences = text.split(/(?<=[。！？\n])/);
  let current = '';

  for (const sent of sentences) {
    if (sent.trim() === '') continue;
    if (current.length + sent.length <= maxChars) {
      current += sent;
    } else {
      if (current) chunks.push(current.trim());
      if (sent.length > maxChars) {
        // Break long sentence by character count
        let sub = sent;
        while (sub.length > maxChars) {
          chunks.push(sub.slice(0, maxChars));
          sub = sub.slice(maxChars);
        }
        current = sub;
      } else {
        current = sent;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Clean thinking-heavy text to extract just the answer
function cleanText(text) {
  if (!text) return '';
  const t = text.trim();
  if (!t) return '';

  // If the text is mostly answer-like (Chinese characters present, reasonable length)
  // return it directly
  const chineseCount = (t.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chineseCount > 20) {
    // Likely Chinese answer - remove leading/trailing noise
    const m = t.match(/([\u4e00-\u9fff][\s\S]{10,})/);
    if (m) return m[1].trim();
    return t;
  }

  // For English/thinking-heavy text, try to extract the answer after "Answer:" or "The"
  const answerMatch = t.match(/(?:answer is|answer:|the answer is|答案是)[:\s]*(["\u4e00-\u9fff][^"]*)/i)
                   || t.match(/^(.{20,})$/);
  if (answerMatch) return answerMatch[1].trim();

  // Last resort: return last 200 chars (usually contains the final answer)
  return t.slice(-200).trim();
}

server.listen(PORT, '127.0.0.1', () => {
  console.log('Chat API server running on port', PORT);
});
