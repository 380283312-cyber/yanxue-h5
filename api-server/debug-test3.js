const https = require('https');
const KEY = process.argv[2];

const postData = JSON.stringify({
  model: 'minimax/minimax-m2.5',
  messages: [{ role: 'user', content: 'Say hello in exactly 3 words.' }],
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

console.log('Starting request...');
const req = https.request(options, (res) => {
  console.log('Response status:', res.statusCode);
  let buf = '';
  let count = 0;
  res.on('data', (c) => {
    buf += c.toString();
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const l of lines) {
      if (l.startsWith('data: ') && count < 25) {
        count++;
        const raw = l.slice(6).trim();
        if (raw === '[DONE]') { console.log('---DONE---'); continue; }
        try {
          const p = JSON.parse(raw);
          const delta = p.choices && p.choices[0] && p.choices[0].delta;
          const txt = delta && delta.content;
          const reas = delta && delta.reasoning;
          if (txt !== undefined) console.log('CONTENT[' + count + ']:', JSON.stringify(txt));
          else if (reas !== undefined) console.log('REASONING[' + count + ']:', String(reas).slice(0, 50));
          else console.log('OTHER[' + count + ']:', JSON.stringify(delta));
        } catch(e) { console.log('PARSE ERR[' + count + ']:', raw.slice(0, 100)); }
      }
    }
  });
  res.on('end', () => { console.log('STREAM END'); });
  res.on('error', (e) => { console.log('RES ERR:', e.message); });
});
req.on('error', (e) => { console.log('REQ ERR:', e.message); });
req.write(postData);
req.end();
console.log('Request sent');
