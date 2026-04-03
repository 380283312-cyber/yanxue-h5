const https = require('https');
const KEY = process.argv[2];

// Test non-streaming first
const postData = JSON.stringify({
  model: 'minimax/minimax-m2.5',
  messages: [{ role: 'user', content: 'What is 1+1? Answer in 3 words.' }],
  max_tokens: 50,
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

console.log('NON-STREAMING TEST:');
const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (c) => { body += c.toString(); });
  res.on('end', () => {
    try {
      const p = JSON.parse(body);
      const msg = p.choices && p.choices[0] && p.choices[0].message;
      console.log('content:', JSON.stringify(msg && msg.content));
      console.log('reasoning:', JSON.stringify(msg && msg.reasoning && String(msg.reasoning).slice(0, 100)));
    } catch(e) { console.log('ERR:', e.message, body.slice(0, 200)); }
  });
});
req.on('error', (e) => { console.log('REQ ERR:', e.message); });
req.write(postData);
req.end();
