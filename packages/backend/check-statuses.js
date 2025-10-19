const { createPublicClient, http, parseAbiItem } = require('viem');
const { sepolia } = require('viem/chains');

const CONTRACT_ADDRESS = '0x134233af7C2842B8F5Dc83CE5C151e74f4F55913';

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
});

const addresses = [
  '0xDb67F66C65982170daCA6f0B8D39DCb4E1B83AeC', // Senin approved bildiğin address
];

async function checkStatuses() {
  for (const addr of addresses) {
    try {
      const status = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: [parseAbiItem('function getKYCStatus(address) external view returns (uint8)')],
        functionName: 'getKYCStatus',
        args: [addr],
      });
      console.log(`${addr}: ${status} (0=None, 1=Pending, 2=Approved, 3=Rejected)`);
    } catch (error) {
      console.error(`Error checking ${addr}:`, error.message);
    }
  }
}

checkStatuses();
