const https = require('https');

const KEY = process.argv[2];
const MODEL = 'minimax/minimax-m2.5';

const postData = JSON.stringify({
  model: MODEL,
  messages: [{ role: 'user', content: 'say hi' }],
  max_tokens: 30,
  stream: true,
});

const options = {
  hostname: 'openrouter.ai',
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${KEY}`,
    'HTTP-Referer': 'https://yanxue-h5.vercel.app',
    'X-Title': 'yanxue-h5',
  }
};

const req = https.request(options, (res) => {
  let buf = '';
  res.on('data', (chunk) => {
    buf += chunk.toString();
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') {
          console.log('---DONE---');
          continue;
        }
        try {
          const p = JSON.parse(raw);
          const delta = p.choices && p.choices[0] && p.choices[0].delta;
          console.log('delta.content:', JSON.stringify(delta && delta.content));
          console.log('whole delta:', JSON.stringify(delta));
        } catch(e) {
          console.log('parse error:', raw.slice(0, 100));
        }
      }
    }
  });
  res.on('end', () => { console.log('END'); });
  res.on('error', (e) => { console.log('RES ERR:', e.message); });
});
req.on('error', (e) => { console.log('REQ ERR:', e.message); });
req.write(postData);
req.end();
