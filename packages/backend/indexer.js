const { createPublicClient, http, parseAbiItem } = require('viem');
const { sepolia } = require('viem/chains');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');

const CONTRACT_ADDRESS = '0x115E877D0eA462c9B2F78fF43bf0E87E5EC5c18b';
const START_BLOCK = 9383665;

console.log('zkKYC Backend Indexer v3.0 - Blockchain Status Sync');
const db = new sqlite3.Database('./kyc-events.db');

db.serialize(() => {
  console.log('Initializing database...');
  db.run('CREATE TABLE IF NOT EXISTS kyc_submissions (user_address TEXT PRIMARY KEY, timestamp INTEGER, status INTEGER DEFAULT 1, block_number INTEGER, tx_hash TEXT, last_updated INTEGER)');
  db.run('CREATE INDEX IF NOT EXISTS idx_status ON kyc_submissions(status)');
  db.run('CREATE TABLE IF NOT EXISTS indexer_state (id INTEGER PRIMARY KEY DEFAULT 1, last_block INTEGER, last_sync INTEGER, total_events INTEGER DEFAULT 0)');
  db.run('INSERT OR IGNORE INTO indexer_state (id, last_block, last_sync, total_events) VALUES (1, ' + (START_BLOCK - 1) + ', 0, 0)');
  console.log('Database ready');
});

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
});

async function indexEvents() {
  try {
    const currentBlock = await client.getBlockNumber();
    db.get('SELECT * FROM indexer_state WHERE id = 1', async (err, row) => {
      if (err) { console.error('DB error:', err); return; }
      const fromBlock = BigInt(row.last_block + 1);
      const toBlock = currentBlock;
      if (fromBlock > toBlock) return;
      
      console.log('Syncing blocks ' + fromBlock + ' -> ' + toBlock);
      const CHUNK_SIZE = BigInt(1000);
      let f = fromBlock;
      let totalNewEvents = 0;
      
      while (f <= toBlock) {
        const t = f + CHUNK_SIZE > toBlock ? toBlock : f + CHUNK_SIZE;
        try {
          const submittedLogs = await client.getLogs({
            address: CONTRACT_ADDRESS,
            event: parseAbiItem('event KYCSubmitted(address indexed user, uint256 timestamp)'),
            fromBlock: f,
            toBlock: t,
          });
          
          for (const log of submittedLogs) {
            const user = log.args.user.toLowerCase();
            const timestamp = Number(log.args.timestamp);
            db.run('INSERT OR REPLACE INTO kyc_submissions (user_address, timestamp, status, block_number, tx_hash, last_updated) VALUES (?, ?, 1, ?, ?, ?)', 
              [user, timestamp, Number(log.blockNumber), log.transactionHash, Date.now()]);
            totalNewEvents++;
          }
          
          if (submittedLogs.length > 0) {
            console.log('  ' + f + '-' + t + ': ' + submittedLogs.length + ' submissions');
          }
        } catch (error) {
          console.error('  Error ' + f + '-' + t + ':', error.message);
        }
        f = t + BigInt(1);
      }
      
      db.run('UPDATE indexer_state SET last_block = ?, last_sync = ? WHERE id = 1', 
        [Number(toBlock), Date.now()]);
      if (totalNewEvents > 0) {
        console.log('Sync complete! Added ' + totalNewEvents + ' submissions');
      }
    });
  } catch (error) {
    console.error('Indexer error:', error);
  }
}

async function syncBlockchainStatuses() {
  db.all('SELECT user_address FROM kyc_submissions', async (err, rows) => {
    if (err) return;
    let updated = 0;
    for (const row of rows) {
      try {
        const status = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: [parseAbiItem('function getKYCStatus(address) external view returns (uint8)')],
          functionName: 'getKYCStatus',
          args: [row.user_address],
        });
        const statusNum = Number(status);
        await new Promise((resolve) => {
          db.run('UPDATE kyc_submissions SET status = ?, last_updated = ? WHERE user_address = ?',
            [statusNum, Date.now(), row.user_address], resolve);
        });
        updated++;
      } catch (error) {
        // Ignore
      }
    }
    if (updated > 0) {
      console.log('Status sync: Updated ' + updated + ' users from blockchain');
    }
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', version: '3.0' }));
app.get('/api/status', (req, res) => {
  db.get('SELECT * FROM indexer_state WHERE id = 1', (err, row) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ lastBlock: row.last_block, lastSync: row.last_sync, totalEvents: row.total_events });
  });
});
app.get('/api/submissions', (req, res) => {
  db.all('SELECT * FROM kyc_submissions ORDER BY timestamp DESC', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else { res.json({ submissions: rows, count: rows.length }); }
  });
});
app.get('/api/submissions/pending', (req, res) => {
  db.all('SELECT * FROM kyc_submissions WHERE status = 1 ORDER BY timestamp DESC', (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ submissions: rows, count: rows.length });
  });
});
app.get('/api/submissions/:address', (req, res) => {
  const address = req.params.address.toLowerCase();
  db.get('SELECT * FROM kyc_submissions WHERE user_address = ?', [address], (err, row) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(row || { error: 'Not found' });
  });
});
app.post('/api/submissions/:address/status', (req, res) => {
  const address = req.params.address.toLowerCase();
  const status = req.body.status;
  if (![1, 2, 3].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.run('UPDATE kyc_submissions SET status = ?, last_updated = ? WHERE user_address = ?', 
    [status, Date.now(), address], (err) => {
    if (err) res.status(500).json({ error: err.message });
    else { res.json({ success: true }); }
  });
});
app.get('/api/kyc/pending', (req, res) => {
  db.all('SELECT * FROM kyc_submissions ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ applications: [], total: 0, pending: 0 });
    } else {
      const pending = rows ? rows.filter(r => r.status === 1).length : 0;
      res.json({ 
        applications: rows ? rows.filter(r => r.status === 1) : [], 
        total: rows ? rows.length : 0,
        pending: pending
      });
    }
  });
});

app.get('/api/stats', (req, res) => {
  db.all('SELECT COUNT(*) as total, SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as rejected FROM kyc_submissions', 
    (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows[0]);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('API Server: http://localhost:' + PORT);
  console.log('Event indexing + Blockchain status sync every 30s');
  setTimeout(indexEvents, 2000);
  setInterval(indexEvents, 30000);
  setTimeout(syncBlockchainStatuses, 5000);
  setInterval(syncBlockchainStatuses, 60000); // Every 60s sync statuses
});
