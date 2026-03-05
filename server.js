const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── API Route – gọi Claude AI ──
app.post('/api/claude', (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { message: 'ANTHROPIC_API_KEY chưa được cài. Vào Render Dashboard → Environment → Add ANTHROPIC_API_KEY.' }
    });
  }

  const bodyStr = JSON.stringify(req.body);
  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => { data += chunk; });
    apiRes.on('end', () => {
      try {
        res.status(apiRes.statusCode).json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: { message: 'Parse error: ' + e.message } });
      }
    });
  });

  apiReq.on('error', (e) => {
    res.status(500).json({ error: { message: 'Lỗi kết nối: ' + e.message } });
  });

  apiReq.write(bodyStr);
  apiReq.end();
});

// ── Health check – kiểm tra server & API key ──
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKey: process.env.ANTHROPIC_API_KEY ? '✅ Đã cài' : '❌ Chưa cài'
  });
});

// ── Fallback – trả về index.html ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ VPP AI Champions chạy tại http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${process.env.ANTHROPIC_API_KEY ? 'Đã cài ✅' : 'CHƯA CÀI ❌'}`);
});
