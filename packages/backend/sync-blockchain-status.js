const { createPublicClient, http, parseAbiItem } = require('viem');
const { sepolia } = require('viem/chains');
const sqlite3 = require('sqlite3').verbose();

const CONTRACT_ADDRESS = '0x134233af7C2842B8F5Dc83CE5C151e74f4F55913';
const db = new sqlite3.Database('./kyc-events.db');

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
});

async function syncStatuses() {
  db.all('SELECT user_address FROM kyc_submissions', async (err, rows) => {
    if (err) { console.error(err); return; }
    
    console.log(`Syncing status for ${rows.length} users from blockchain...`);
    
    for (const row of rows) {
      try {
        const status = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: [parseAbiItem('function getKYCStatus(address) external view returns (uint8)')],
          functionName: 'getKYCStatus',
          args: [row.user_address],
        });
        
        const statusNum = Number(status);
        
        if (statusNum !== 1) { // Not pending
          db.run('UPDATE kyc_submissions SET status = ?, last_updated = ? WHERE user_address = ?',
            [statusNum, Date.now(), row.user_address]);
          console.log(`Updated ${row.user_address}: status ${statusNum}`);
        }
      } catch (error) {
        console.error(`Error ${row.user_address}:`, error.message);
      }
    }
    
    console.log('Sync complete!');
    process.exit(0);
  });
}

syncStatuses();
