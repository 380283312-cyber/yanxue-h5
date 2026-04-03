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
        stream: false,  // non-streaming to get clean complete response
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
            const rawText = String(msg.content || msg.reasoning || '').trim();

            // Extract clean answer text
            const answer = extractAnswer(rawText);

            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            });

            if (!answer) {
              res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
              res.end();
              return;
            }

            // Stream answer in sentence-level chunks
            const chunks = splitIntoChunks(answer, 80);
            let i = 0;
            function sendNext() {
              if (i >= chunks.length) {
                res.write('data: ' + JSON.stringify({ type: 'done' }) + '\n\n');
                res.end();
                return;
              }
              res.write('data: ' + JSON.stringify({ type: 'chunk', text: chunks[i] }) + '\n\n');
              i++;
              // Send next chunk after short delay for visible streaming effect
              setTimeout(sendNext, 40);
            }
            sendNext();

          } catch (e) {
            console.error('Parse error:', e.message);
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

// Split text into chunks at sentence boundaries (max 80 chars each)
function splitIntoChunks(text, maxChars) {
  const chunks = [];
  // Split by Chinese sentence endings, newlines, or major punctuation
  const sentences = text.split(/(?<=[。！？\n])/);
  let current = '';

  for (const sent of sentences) {
    if (sent.trim() === '') continue;
    if (current.length + sent.length <= maxChars) {
      current += sent;
    } else {
      if (current) chunks.push(current.trim());
      // If a single sentence is longer than maxChars, break it by words
      if (sent.length > maxChars) {
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

// Extract the actual answer from reasoning field
// The reasoning contains thinking + final answer mixed together
function extractAnswer(text) {
  if (!text) return '';
  const t = text.trim();
  if (!t) return '';

  // Strategy: Look for answer after key answer indicators
  const patterns = [
    // Chinese: "答：...以下是..."
    /(?:答[案是：:]\s*)([\s\S]{10,1000})/,
    // Chinese: "以下是...（完整方案/报告/内容）"
    /(?:以下是[\s\S]{0,30})([\u4e00-\u9fff][\s\S]{10,800})/,
    // Chinese: "总结[：:]\s*"
    /(?:总结[：:]\s*)([\s\S]{10,500})/,
    // Chinese: "完整" answer
    /(?:完整[的]?\s*)([\u4e00-\u9fff][\s\S]{20,500})/,
    // After "---" divider (common in model outputs)
    /(?:[-—]{5,}[\s\S]*?)([\s\S]{20,800})/,
  ];

  for (const p of patterns) {
    const m = t.match(p);
    if (m) {
      const answer = m[1].trim();
      // Clean up the answer
      const cleaned = answer
        .replace(/^其?实?[，,]?\s*/, '')
        .replace(/^(The user|I think|I believe|In conclusion|In summary)[，,:\s]*/gi, '')
        .trim();
      if (cleaned.length > 5) return cleaned;
    }
  }

  // Fallback: get the last substantial Chinese paragraph (last 400 chars of meaningful content)
  // Find Chinese text blocks
  const chineseBlocks = t.match(/[\u4e00-\u9fff][^\n]{10,400}/g) || [];
  if (chineseBlocks.length > 0) {
    // Return the last substantial Chinese block
    const last = chineseBlocks[chineseBlocks.length - 1].trim();
    if (last.length > 10) return last;
  }

  // Last resort: return last 300 chars of the reasoning
  const last300 = t.slice(-300).trim();
  if (last300.length > 10) return last300;

  return t.slice(-150);
}

server.listen(PORT, '127.0.0.1', () => {
  console.log('Chat API server running on port', PORT, '(clean sentence streaming)');
});
