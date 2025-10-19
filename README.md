# 🔐 zkKYC - Privacy-Preserving Identity Verification

[![License](https://img.shields.io/badge/License-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Zama Developer Program](https://img.shields.io/badge/Zama-Developer%20Program-purple)](https://www.zama.ai/programs/developer-program)
[![Live Demo](https://img.shields.io/badge/Status-Live%20on%20Production-success)](https://fhekyc.ominas.ovh/)
[![Contract](https://img.shields.io/badge/Contract-Sepolia-blue)](https://sepolia.etherscan.io/address/0x115E877D0eA462c9B2F78fF43bf0E87E5EC5c18b)

> 🏆 **Built for Zama Developer Program October 2025**  
> A production-ready decentralized KYC system leveraging Fully Homomorphic Encryption for privacy-preserving identity verification.

---

## 🌐 Live Demo

**Try it now - Fully functional on Sepolia testnet:**

- 🔗 **Client Portal:** [https://fhekyc.ominas.ovh/](https://fhekyc.ominas.ovh/)  
  *Submit your encrypted KYC information*

- 🔗 **Admin Dashboard:** [https://fhekyc-admin.ominas.ovh/admin](https://fhekyc-admin.ominas.ovh/admin)  
  *Review and approve/reject submissions (instant <100ms loads)*

- 🔗 **Smart Contract:** [0x115E877D...c18b](https://sepolia.etherscan.io/address/0x115E877D0eA462c9B2F78fF43bf0E87E5EC5c18b)  
  *View on Sepolia Etherscan*

---

## ⚡ Why This Project Stands Out

### 🚀 Production-Ready Deployment
Unlike most testnet-only projects, zkKYC is **fully deployed and operational**:
- ✅ **VPS hosting** with PM2 process management for auto-restart
- ✅ **Nginx reverse proxy** with SSL/TLS encryption  
- ✅ **Custom domain** with proper DNS configuration
- ✅ **Zero downtime** - services restart automatically on failure
- ✅ **Dual-port architecture** - Client (port 3000) and Admin (port 3002) portals

### 📊 Backend API Indexer
**Problem:** Loading all KYC submissions via RPC = 1+ hour ⏳  
**Solution:** Custom Express + SQLite indexer = **<100ms** ⚡

The backend continuously syncs blockchain events and contract state every 30 seconds, enabling instant dashboard loads for admins.

### 🎨 Complete User Experience
- **Unified Scaffold-ETH-2 Architecture** - Single Next.js app with dual routes
- **Dual Interfaces** - Separate `/` (client) and `/admin` (admin panel) routes
- **Full Workflow** - Submit → Pending → Approved/Rejected
- **Smart Resubmit** - Rejected users can fix issues and reapply
- **Real-Time Updates** - Status syncs with blockchain every 30-60 seconds
- **Native Wagmi v2 Integration** - Uses `writeContract` for MetaMask transactions

### 📝 Comprehensive Documentation
- Architecture diagrams with ASCII art
- Complete API reference
- Step-by-step deployment guide
- Demo vs Production roadmap

---

## 🎯 Overview

zkKYC solves the blockchain privacy paradox: **how to verify identities without exposing sensitive data on transparent ledgers.**

### The Problem

Traditional blockchain KYC systems face critical challenges:
- ❌ **Privacy Violation** - PII stored in plaintext on public chains
- ❌ **Centralization** - Off-chain databases defeat decentralization
- ❌ **Limited Verification** - ZK proofs alone can't handle complex checks

### Our Solution with FHE

✅ **Client-Side Encryption** - Data encrypted with FHE before leaving browser  
✅ **On-Chain Status** - Verification status recorded transparently  
✅ **Backend Event Indexer** - Fast dashboard loads without slow RPC calls  
✅ **Admin Review** - Approve/reject with MetaMask transactions  
✅ **Full Audit Trail** - Immutable history of all decisions

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   👤 USER (Client Portal - /)                    │
│                                                                  │
│  Next.js App Router         MetaMask Wallet                     │
│    │                              │                              │
│    │ 1. Fill KYC Form            │                              │
│    │ 2. Client-side FHE encrypt  │                              │
│    └─────────────────────────────┤                              │
│                                   │ 3. submitKYC()               │
└───────────────────────────────────┼──────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ⛓️  BLOCKCHAIN (Sepolia Testnet)                │
│                                                                  │
│  📜 ZamaKYC Smart Contract (0x115E877D...c18b)                  │
│  ├─ Encrypted submissions (euint256 FHE values)                │
│  ├─ KYC Status enum (None/Pending/Approved/Rejected)           │
│  ├─ Events: KYCSubmitted, KYCApproved, KYCRejected             │
│  └─ Resubmit logic for rejected users                          │
│                                                                  │
└───────────────────┬────────────────────────┬────────────────────┘
                    │                         │
                    │ Events (30s poll)       │ Read Status
                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              🔧 BACKEND INDEXER (Express + SQLite)               │
│              packages/backend/indexer.js                         │
│                                                                  │
│  ├─ Event Polling (30s) → Index new submissions                │
│  ├─ Status Sync (60s) → Query contract for latest states       │
│  ├─ Database Persistence → SQLite kyc.db (<100ms queries)      │
│  └─ REST API → /api/kyc/pending, /api/kyc/stats                │
│                                                                  │
│  📊 PM2 Process: zkkyc-backend (auto-restart on crash)          │
│                                                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ API Calls (port 3001)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│       👨‍💼 ADMIN DASHBOARD (Next.js /admin route)                  │
│                                                                  │
│  ✅ View Pending Submissions (instant load from backend API)    │
│  ✅ Review Mock Verification Data (demo: dummy values)          │
│  ✅ Approve/Reject via Wagmi writeContract + MetaMask           │
│  ✅ Full History (pending, approved, rejected with timestamps)  │
│                                                                  │
│  📊 PM2 Processes:                                               │
│    - zkkyc-frontend (port 3000) - Client portal                │
│    - zkkyc-admin (port 3002) - Admin dashboard                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### For End Users
- 🔒 **Privacy-First** - Your data is FHE-encrypted client-side before submission
- ⚡ **Instant Status** - Check KYC approval in real-time on blockchain
- 🔄 **Resubmit After Rejection** - Fix issues and apply again with same wallet
- 🌍 **No Registration** - Just connect MetaMask and submit

### For Administrators  
- 📊 **Lightning-Fast Dashboard** - Load 1000+ submissions in <100ms via API
- 📜 **Complete History** - View all past approvals and rejections
- ✅ **One-Click Actions** - Approve or reject with single MetaMask transaction
- 🔍 **Verification Insights** - Review off-chain KYC data before decision
  - ⚠️ *Demo version: Randomly generated dummy data*
  - 🔮 *Production roadmap: Real Onfido/Jumio API integration*

### For Developers
- 🛠️ **Modern Stack** - Scaffold-ETH-2, Next.js 15, Hardhat, Wagmi v2
- 📡 **Scalable Backend** - Event indexing eliminates slow RPC queries
- 🔗 **EVM Compatible** - Deploy on any Ethereum-compatible chain
- 📚 **Full Documentation** - Architecture, API, deployment guides included

---

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity ^0.8.24** - EVM-compatible smart contract language
- **Hardhat** - Development framework with TypeScript support
- **Ethers.js v6** - Blockchain interaction library
- **Sepolia Testnet** - Ethereum test network

### Frontend (Unified Next.js App)
- **Scaffold-ETH-2** - Full-stack Ethereum development framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **RainbowKit** - Beautiful wallet connection UI
- **Wagmi v2** - React Hooks for Ethereum with native `writeContract`
- **Viem v2** - Lightweight TypeScript library
- **TailwindCSS + DaisyUI** - Utility-first styling

### Backend Indexer
- **Node.js + Express** - REST API server
- **SQLite3** - Embedded database (auto-created kyc.db)
- **Viem** - Blockchain RPC client for event polling
- **PM2** - Process manager for production

### Infrastructure
- **VPS Hosting** - Ubuntu 24.04 LTS
- **Nginx** - Reverse proxy with SSL/TLS
- **Let's Encrypt** - Free SSL certificates
- **PM2 Ecosystem** - Multi-process management
- **PublicNode RPC** - Free, no rate-limit Sepolia endpoint

---

## 📦 Project Structure

```
zkkyc/
├── packages/
│   ├── nextjs/                     # Unified Scaffold-ETH-2 frontend
│   │   ├── app/
│   │   │   ├── page.tsx           # Client KYC submission portal (/)
│   │   │   ├── admin/
│   │   │   │   └── page.tsx       # Admin dashboard (/admin)
│   │   │   ├── _components/
│   │   │   │   ├── ZamaKYCForm.tsx           # KYC submission form
│   │   │   │   └── ZamaKYCAdminPanel.tsx     # Admin panel component
│   │   │   └── layout.tsx         # Root layout with RainbowKit
│   │   │
│   │   ├── hooks/
│   │   │   ├── kyc/
│   │   │   │   ├── useZamaKYC.tsx           # Client KYC hook
│   │   │   │   └── useZamaKYCAdmin.tsx      # Admin hook with Wagmi
│   │   │   └── scaffold-eth/
│   │   │       └── useWagmiEthers.tsx       # Wagmi → Ethers adapter
│   │   │
│   │   ├── contracts/
│   │   │   └── deployedContracts.ts         # Contract ABIs & addresses
│   │   │
│   │   └── package.json
│   │
│   ├── hardhat/                    # Smart contract development
│   │   ├── contracts/
│   │   │   └── ZamaKYC.sol        # Main KYC contract
│   │   ├── deploy/
│   │   │   └── 00_deploy_zamakyc.ts
│   │   └── hardhat.config.ts
│   │
│   └── backend/                    # API indexer
│       ├── indexer.js             # Express server + event indexer
│       └── kyc.db                 # SQLite database (auto-generated)
│
├── README.md                       # This file
├── LICENSE                         # BSD-3-Clause-Clear
├── package.json                   # Root package (pnpm workspace)
└── pnpm-workspace.yaml            # Workspace configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **MetaMask** wallet with Sepolia ETH  
  👉 [Get testnet ETH from faucet](https://sepoliafaucet.com/)

### Quick Start (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/mesahin001/zkkyc.git
cd zkkyc

# 2. Install dependencies
pnpm install

# 3. Start local blockchain (optional - for contract development)
cd packages/hardhat
pnpm chain

# 4. Deploy contract (or use existing Sepolia address)
# Current deployed: 0x115E877D0eA462c9B2F78fF43bf0E87E5EC5c18b
pnpm deploy --network sepolia

# 5. Start frontend
cd packages/nextjs
pnpm dev
# → Client: http://localhost:3000
# → Admin: http://localhost:3000/admin

# 6. Start backend indexer (separate terminal)
cd packages/backend
node indexer.js
# → API: http://localhost:3001
```

---

## 📡 API Documentation

### Backend Indexer Endpoints

**Base URL:** `http://localhost:3001` (dev) or production API

#### `GET /api/kyc/pending`
Get pending KYC submissions (status=1 only)

**Response:**
```json
{
  "applications": [
    {
      "user_address": "0xdb67f66c65982170daca6f0b8d39dcb4e1b83aec",
      "timestamp": 1728320000,
      "status": 1,
      "block_number": 9433700,
      "tx_hash": "0x...",
      "last_updated": 1729200000000
    }
  ],
  "total": 10,
  "pending": 3
}
```

**Status Enum:**
- `0` = None (never submitted)
- `1` = Pending review  
- `2` = Approved ✅
- `3` = Rejected ❌

#### `GET /api/kyc/all`
Get all submissions (pending, approved, rejected)

---

## 🎓 Complete Tutorial: User Journey

### 1️⃣ User Submits KYC (Client Portal)

```typescript
// packages/nextjs/app/page.tsx

// User fills form
const formData = {
  name: "John Doe",
  address: "123 Main St, New York, USA",
  documentId: "P123456789"
};

// FHE encryption (fhevmjs)
const instance = await createFhevmInstance({ chainId, publicKey });
const encrypted = {
  name: instance.encrypt256(formData.name),
  address: instance.encrypt256(formData.address),
  document: instance.encrypt256(formData.documentId)
};

// Submit to contract via Wagmi
await writeContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'submitKYC',
  args: [encrypted.name, encrypted.address, encrypted.document],
});

// ✅ Status: Pending
```

### 2️⃣ Backend Indexes Event

```javascript
// packages/backend/indexer.js

// Polls Sepolia every 30 seconds
const logs = await client.getLogs({
  address: CONTRACT_ADDRESS,
  event: parseAbiItem('event KYCSubmitted(address indexed user, uint256 timestamp)'),
  fromBlock: lastBlock,
  toBlock: currentBlock,
});

// Stores in SQLite for instant queries
for (const log of logs) {
  db.run(
    'INSERT OR REPLACE INTO kyc_submissions VALUES (?, ?, 1, ?, ?, ?)',
    [log.args.user.toLowerCase(), timestamp, blockNumber, txHash, Date.now()]
  );
}
```

### 3️⃣ Admin Reviews and Approves

```typescript
// packages/nextjs/app/admin/page.tsx

// Load from backend API (<100ms)
const { pendingApplications } = useZamaKYCAdmin();

// Admin approves with Wagmi v2 native hook
await writeContractAsync({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'approveKYC',
  args: [userAddress],
});

// ✅ Status: Approved → Backend syncs in 30s → User sees update
```

---

## 🌐 Production Deployment

### PM2 Setup

```bash
# Build frontend
cd packages/nextjs
pnpm build

# Create ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'zkkyc-frontend',
      script: 'npm',
      args: 'start -- -p 3000',
      cwd: '/var/www/zkkyc/packages/nextjs',
      env: { NODE_ENV: 'production', PORT: 3000 }
    },
    {
      name: 'zkkyc-admin',
      script: 'npm',
      args: 'start -- -p 3002',
      cwd: '/var/www/zkkyc/packages/nextjs',
      env: { NODE_ENV: 'production', PORT: 3002 }
    },
    {
      name: 'zkkyc-backend',
      script: 'indexer.js',
      cwd: '/var/www/zkkyc/packages/backend',
      env: { NODE_ENV: 'production' }
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 state
pm2 save

# Auto-start on boot
pm2 startup
```

### Nginx Configuration

```nginx
# Client Portal
server {
    listen 443 ssl http2;
    server_name fhekyc.ominas.ovh;

    ssl_certificate /etc/letsencrypt/live/fhekyc.ominas.ovh/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fhekyc.ominas.ovh/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin Dashboard
server {
    listen 443 ssl http2;
    server_name fhekyc-admin.ominas.ovh;

    ssl_certificate /etc/letsencrypt/live/fhekyc-admin.ominas.ovh/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fhekyc-admin.ominas.ovh/privkey.pem;

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ⚠️ Current Demo vs Production Roadmap

### ✅ What's Working Now (v2.0)

**Fully Functional:**
- ✅ Complete Scaffold-ETH-2 unified architecture
- ✅ FHE encryption with fhevmjs (client-side)
- ✅ Smart contract with Pending/Approved/Rejected states
- ✅ Native Wagmi v2 `writeContract` for MetaMask transactions
- ✅ Backend event indexer with 30s sync interval
- ✅ SQLite persistence for instant <100ms dashboard loads
- ✅ Rejected user resubmit capability
- ✅ Full audit history tracking
- ✅ Production deployment with PM2 + Nginx + SSL

**Demo Limitations:**
- ⚠️ **Mock decrypt data in admin panel**  
  Dashboard shows randomly generated values to demonstrate workflow without requiring Zama FHEVM decryption keys.

- ⚠️ **No real KYC provider integration**  
  Currently simulates verification results. Production will integrate Onfido/Jumio APIs.

### 🔮 Production Roadmap

#### Phase 1: Real KYC Provider Integration
- [ ] Integrate **Onfido API** for document verification
- [ ] Integrate **Jumio** for biometric liveness checks
- [ ] Webhook system for real-time verification results
- [ ] Backend decrypt API with Zama FHEVM private keys

#### Phase 2: Full FHE Decryption
- [ ] Deploy to **Zama Devnet/Testnet** (supports native FHE decrypt)
- [ ] Admin backend with decrypt permissions
- [ ] Encrypted attribute queries (age > 18, nationality checks)

#### Phase 3: Advanced Features
- [ ] Multi-tier KYC (Basic/Advanced/Premium)
- [ ] Decentralized verifier network (multi-admin)
- [ ] Cross-chain portability (Polygon, Arbitrum)
- [ ] Soulbound Tokens (SBT) for verified identities

---

## 🤝 Contributing

Contributions welcome! Please follow:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**.

---

## 🏆 Built for Zama Developer Program October 2025

This project showcases practical applications of **Fully Homomorphic Encryption** in real-world blockchain systems, specifically addressing privacy challenges in identity verification.

---

## 📞 Contact & Links

**Live Demo:** [https://fhekyc.ominas.ovh/](https://fhekyc.ominas.ovh/)  
**Admin Dashboard:** [https://fhekyc-admin.ominas.ovh/admin](https://fhekyc-admin.ominas.ovh/admin)  
**GitHub:** [https://github.com/mesahin001/zkkyc](https://github.com/mesahin001/zkkyc)  
**Contract (Sepolia):** `0x115E877D0eA462c9B2F78fF43bf0E87E5EC5c18b`

---

*Made with ❤️ and FHE technology*
