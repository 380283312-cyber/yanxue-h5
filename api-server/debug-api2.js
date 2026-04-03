const https = require('https');
const KEY = process.argv[2];

const postData = JSON.stringify({
  model: 'minimax/minimax-m2.5',
  messages: [{ role: 'user', content: '用4个字形容研学旅行' }],
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
      console.log('Full response keys:', Object.keys(p));
      console.log('Choices:', JSON.stringify(p.choices && p.choices[0], null, 2).slice(0, 500));
    } catch(e) {
      console.log('Not JSON. Raw data:', data.slice(0, 300));
    }
  });
});
req.on('error', (e) => { console.error('Error:', e.message); });
req.write(postData);
req.end();
