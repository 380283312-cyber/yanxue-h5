const https = require('https');
const KEY = process.argv[2];

const postData = JSON.stringify({
  model: 'minimax/minimax-m2.5',
  messages: [{ role: 'user', content: 'What is 1+1? Answer in 3 words.' }],
  max_tokens: 50,
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
  let count = 0;
  res.on('data', (c) => {
    buf += c.toString();
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const l of lines) {
      if (l.startsWith('data: ') && count < 30) {
        count++;
        const raw = l.slice(6).trim();
        if (raw === '[DONE]') { console.log('DONE'); continue; }
        try {
          const p = JSON.parse(raw);
          const delta = p.choices && p.choices[0] && p.choices[0].delta;
          const txt = delta && delta.content;
          const reas = delta && delta.reasoning;
          if (txt) console.log('CONTENT:', txt);
          else if (reas) console.log('REASONING:', String(reas).slice(0, 40));
        } catch(e) {}
      }
    }
  });
  res.on('end', () => {});
});
req.on('error', (e) => { console.log('ERR:', e.message); });
req.write(postData);
req.end();
