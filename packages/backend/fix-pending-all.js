const fs = require('fs');
const path = '/var/www/zkkyc/packages/backend/indexer.js';
let code = fs.readFileSync(path, 'utf8');

// Mevcut /api/kyc/pending endpoint'ini bul ve değiştir
code = code.replace(
  /app\.get\('\/api\/kyc\/pending'[\s\S]*?}\);[\s\S]*?}\);/,
  `app.get('/api/kyc/pending', (req, res) => {
  db.all('SELECT * FROM kyc_submissions ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ applications: [], total: 0, pending: 0 });
    } else {
      const pending = rows ? rows.filter(r => r.status === 1).length : 0;
      res.json({ 
        applications: rows || [], 
        total: rows ? rows.length : 0,
        pending: pending
      });
    }
  });
});`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Endpoint güncellendi - Tüm başvuruları döndürüyor!');
