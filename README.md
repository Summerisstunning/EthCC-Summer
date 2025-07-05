# EthCC-Summer
# 💖 AA Sharing

> _"A shared emotional ledger and wallet — to record love, grow gratitude, and fulfill dreams, onchain."_

AA Sharing is a consumer-facing Web3 application that helps couples, families, or close friends record what they are grateful for in each other daily, contribute small stablecoin amounts into a shared wallet, and work toward shared goals like traveling together or buying a gift. It brings intimacy and transparency into financial + emotional relationships — powered by **Flow**, **Privy**, and **Avail Nexus SDK**.

---

## 🧩 How It Works

1. **Create a Shared Ledger**
   - Two people connect via wallet/email (using [Privy](https://privy.io)).
   - A joint "Gratitude Ledger" is created.

2. **Daily Gratitude Logging**
   - Each user logs 1–3 things they feel grateful for, with an optional USDC amount (e.g. "She brought me soup – $2").

3. **Joint Wallet & Shared Goals**
   - Gratitude amounts go into a shared wallet.
   - Users can create goal-based milestones like "Trip to Bali – $2000".

4. **Cross-chain Support**
   - Users can use wallets on **different chains** (e.g. Arbitrum and Ethereum) and still contribute to the same shared wallet — powered by [Avail Nexus SDK](https://docs.availproject.org/).

5. **Split or Celebrate**
   - If users choose to end the relationship, the smart contract lets them fairly split the wallet.
   - If a goal is reached, they can "unlock" the funds and plan the event — and optionally **mint an NFT** memory using **Flow**.

---

## 🛠️ Tech Stack

| Layer        | Stack |
|-------------|-------|
| Frontend     | Next.js 14 + TypeScript + Tailwind CSS |
| Wallet Auth  | **Privy SDK** |
| Smart Contract Platform | **Flow (Cadence)** |
| Cross-chain Fund Routing | **Avail Nexus SDK** |
| Backend | Go + Gin + PostgreSQL |
| Stablecoin | USDC / ETH-native stablecoins |

---

## 🧪 Core SDK Integrations

### 🔐 1. Privy — Embedded Wallet + Auth

We used Privy to handle **email-based embedded wallet creation** and **authentication**, enabling even non-crypto-native users to participate.

**Integration Steps:**

```ts
import { PrivyProvider } from '@privy-io/react-auth';

<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
  config={{ embeddedWallets: { createOnLogin: 'users-without-wallets' } }}
>
  <YourApp />
</PrivyProvider>
```

### ⛓️ 2. Flow — Smart Contract Platform

**Flow Smart Contract (Cadence):**
```cadence
pub contract AALedger {
    pub struct Partnership {
        pub let partnerA: Address
        pub let partnerB: Address
        pub var walletBalance: UFix64
        pub var goals: {String: Goal}
        pub var gratitudeEntries: [GratitudeEntry]
    }
    
    pub fun depositGratitude(content: String, amount: UFix64, author: Address)
    pub fun createGoal(name: String, description: String, targetAmount: UFix64)
    pub fun splitFunds(): UFix64
}
```

### 🌐 3. Avail Nexus — Cross-Chain Bridge

```js
import { nexus } from '@/lib/avail-nexus';

// Cross-chain transfer with direct gratitude contribution
await nexus.bridgeAndExecute({
  sourceChain: 'ethereum',
  destinationChain: 'flow',
  token: 'USDC',
  amount: 50,
  callData: {
    to: 'AA_SHARING_CONTRACT_ADDRESS',
    data: encodeGratitudeContribution('Thank you for being amazing!'),
  }
});

// Get unified balance across all chains
const unifiedBalance = await nexus.getUnifiedBalance('USDC');
console.log(`Total USDC: ${unifiedBalance.totalBalance}`);
console.log('Per chain:', unifiedBalance.balancesByChain);
```

**Supported Features:**
- 🔄 **Cross-chain transactions** across 5+ chains (Ethereum, Arbitrum, Polygon, zkSync, Flow)
- 💰 **Unified balances** - Aggregated portfolio view
- ⚡ **Smart execution** - Direct gratitude contributions via cross-chain calls
- 📊 **Transaction simulation** - Preview costs and timing
- 🛠️ **Rich utilities** - Address validation, formatting
- 📱 **Seamless UX** - No manual network switches or bridge interfaces

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Summerisstunning/EthCC-Summer.git
cd EthCC-Summer
```

2. Set up environment variables:

**Frontend (.env.local):**
```
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
NEXT_PUBLIC_FLOW_ACCESS_API=https://rest-testnet.onflow.org
```

**Backend (.env):**
```
DATABASE_URL=postgres://user:password@localhost/aa_sharing?sslmode=disable
JWT_SECRET=your-jwt-secret-key-change-this-in-production
PORT=8080
```

3. Install dependencies:

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
go mod tidy
```

### Running with Docker

```bash
docker-compose up
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379
- Backend API on port 8080
- Frontend on port 3000

### Manual Setup

1. Start PostgreSQL and create database:
```sql
CREATE DATABASE aa_sharing;
```

2. Run the backend:
```bash
cd backend
go run cmd/main.go
```

3. Run the frontend:
```bash
cd frontend
npm run dev
```

## 📱 Current Implementation Status

### ✅ Completed Features
- [x] Next.js frontend with 4 core pages (Home, Gratitude, Wallet, Dashboard)
- [x] Go backend with RESTful API
- [x] PostgreSQL database with full schema
- [x] Flow smart contract (AALedger.cdc)
- [x] Docker development environment
- [x] Privy SDK integration and authentication
- [x] **Avail Nexus cross-chain functionality**
- [x] **Unified balance across 5+ chains**
- [x] **Cross-chain transaction history**
- [x] **Background image support**
- [x] **Mock API for development**

### 🔄 In Progress
- [ ] Flow blockchain integration (connecting to testnet)
- [ ] Real blockchain transactions
- [ ] NFT memory minting on goal completion

## 🗂️ Project Structure

```
EthCC-Summer/
├── frontend/                 # Next.js frontend
│   ├── src/app/             # App router pages
│   │   ├── page.tsx         # Homepage with Privy auth
│   │   ├── gratitude/       # Gratitude logging page
│   │   ├── wallet/          # Wallet contribution page
│   │   └── dashboard/       # Dashboard with goals
│   └── public/              # Static assets
├── backend/                 # Go backend
│   ├── cmd/main.go          # Application entry point
│   ├── internal/
│   │   ├── handlers/        # HTTP handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   └── config/          # Configuration
├── contracts/               # Smart contracts
│   ├── cadence/AALedger.cdc # Main Flow contract
│   └── scripts/deploy.js    # Deployment scripts
└── docker-compose.yml       # Docker configuration
```

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Gratitude
- `POST /api/v1/gratitude` - Create gratitude entry
- `GET /api/v1/gratitude/user/:userId` - Get user's gratitude entries

### Wallet
- `GET /api/v1/wallet/:partnershipId` - Get wallet balance
- `POST /api/v1/wallet/contribute` - Make contribution
- `GET /api/v1/wallet/transactions/:partnershipId` - Get transaction history

### Goals
- `POST /api/v1/goals` - Create goal
- `GET /api/v1/goals/:partnershipId` - Get partnership goals

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💬 Support

For questions or support, please open an issue on GitHub.