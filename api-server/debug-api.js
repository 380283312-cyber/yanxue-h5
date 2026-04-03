const https = require('https');
const KEY = process.argv[2];
const prompt = process.argv[3] || '用4个字形容研学旅行';

const postData = JSON.stringify({
  model: 'minimax/minimax-m2.5',
  messages: [{ role: 'user', content: prompt }],
  max_tokens: 2048,
  stream: false,
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
  let data = '';
  res.on('data', (c) => { data += c.toString(); });
  res.on('end', () => {
    try {
      const p = JSON.parse(data);
      const msg = p.choices && p.choices[0] && p.choices[0].message || {};
      console.error('content:', JSON.stringify(msg.content));
      console.error('reasoning type:', typeof msg.reasoning);
      console.error('reasoning:', String(msg.reasoning).slice(0, 500));
    } catch(e) {
      console.error('Parse error:', e.message, 'data:', data.slice(0, 300));
    }
  });
});
req.on('error', (e) => { console.error('Error:', e.message); });
req.write(postData);
req.end();
