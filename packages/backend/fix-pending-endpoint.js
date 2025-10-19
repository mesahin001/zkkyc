const fs = require('fs');
const path = '/var/www/zkkyc/packages/backend/indexer.js';

let code = fs.readFileSync(path, 'utf8');
if (code.includes('app.get(\'/api/kyc/pending\'')) {
    console.log('Endpoint zaten ekli, güncelleniyor...');
    code = code.replace(
        /app\.get\('\/api\/kyc\/pending'[\s\S]*?}\);/g,
        `app.get('/api/kyc/pending', async (req, res) => {
  try {
    const submissions = await db.all('SELECT * FROM submissions ORDER BY timestamp DESC');
    res.json({
      applications: submissions || [],
      total: submissions ? submissions.length : 0,
      pending: submissions ? submissions.filter(s => s.status === 0).length : 0
    });
  } catch (error) {
    console.error('Error fetching pending:', error);
    res.json({ applications: [], total: 0, pending: 0 });
  }
});`
    );
} else {
    let insertAfter = "app.get('/api/submissions'";
    let idx = code.indexOf(insertAfter);
    if (idx === -1) { idx = code.length; }
    code = code.slice(0, idx) +
`
app.get('/api/kyc/pending', async (req, res) => {
  try {
    const submissions = await db.all('SELECT * FROM submissions ORDER BY timestamp DESC');
    res.json({
      applications: submissions || [],
      total: submissions ? submissions.length : 0,
      pending: submissions ? submissions.filter(s => s.status === 0).length : 0
    });
  } catch (error) {
    console.error('Error fetching pending:', error);
    res.json({ applications: [], total: 0, pending: 0 });
  }
});
` + code.slice(idx);
}

fs.writeFileSync(path, code, 'utf8');
console.log('Düzeltme uygulandı!');
