# AA Sharing - Deployment Guide

## 🚀 Quick Deployment

### Prerequisites

1. **Node.js**: Use v18 or v20 (v23 has compatibility warnings with Hardhat)
2. **Private Key**: Export from your wallet (without 0x prefix)
3. **RPC Access**: Alchemy, Infura, or direct node access
4. **USDC Addresses**: For each target network

### Environment Setup

```bash
# Copy and fill environment file
cp .env.example .env

# Edit with your values
PRIVATE_KEY=your_private_key_here
FLOW_ACCOUNT_ADDRESS=0x000000000000000000000002D399f1eB0b5CF334
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-key
```

### Compilation & Testing

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Gas analysis
npm run test:gas
```

## 🌐 Network Deployment

### Flow Mainnet (Primary Target)

```bash
# Using Hardhat Ignition (Recommended)
npm run ignition:flowMainnet

# Or traditional script
npm run deploy:flowMainnet

# Verify contracts
npm run verify:flowMainnet <CONTRACT_ADDRESS>
```

### Flow Testnet (Testing)

```bash
npm run ignition:flowTestnet
```

### Cross-Chain Networks

```bash
# Arbitrum
npm run deploy:arbitrum

# Ethereum
ETHEREUM_RPC_URL=your_rpc npm run deploy:ethereum
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] **Environment Variables**: All required variables set
- [ ] **Network Config**: RPC URLs and chain IDs correct
- [ ] **USDC Addresses**: Verified for each network
- [ ] **Gas Estimation**: Sufficient ETH/Flow for deployment
- [ ] **Contract Compilation**: No errors or warnings
- [ ] **Test Coverage**: All tests passing

### Post-Deployment

- [ ] **Contract Verification**: Etherscan/Flowscan verification
- [ ] **Initial Testing**: Deploy small test amounts
- [ ] **Documentation Update**: Record deployed addresses
- [ ] **Monitoring Setup**: Transaction monitoring
- [ ] **Security Audit**: If mainnet deployment

## 🔒 Security Considerations

### Private Key Management

```bash
# Use environment variables (never commit to git)
export PRIVATE_KEY=your_key_here

# Or use hardware wallet with Ledger integration
npm install @ledgerhq/hw-app-eth
```

### Network Security

- **RPC Endpoints**: Use trusted providers
- **Gas Limits**: Set appropriate limits
- **Transaction Monitoring**: Monitor for unusual activity

### Contract Security

- **Access Control**: Only owner can pause/unpause
- **Reentrancy Protection**: All critical functions protected
- **Input Validation**: All parameters validated
- **Emergency Functions**: Pause and emergency withdrawal

## 📊 Gas Estimates

| Contract | Deploy Cost | Function Costs |
|----------|-------------|----------------|
| AASharing | ~2.5M gas | Create: 200k, Add: 150k |
| CrossChainBridge | ~1.8M gas | Initiate: 100k, Complete: 180k |
| MockUSDC | ~1.2M gas | Mint: 50k, Transfer: 35k |

### Flow Network Costs

- **Base Fee**: ~1 Gwei
- **Priority Fee**: ~1 Gwei
- **Total Deploy**: ~$10-20 USD equivalent

## 🛠 Deployment Scripts

### Basic Deployment

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy Mock USDC (testnet only)
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy("USD Coin", "USDC", 6);
  
  // Deploy AASharing
  const AASharing = await ethers.getContractFactory("AASharing");
  const aaSharing = await AASharing.deploy(await usdc.getAddress());
  
  console.log("AASharing deployed to:", await aaSharing.getAddress());
}
```

### Advanced Deployment with Ignition

```javascript
// ignition/modules/AASharing.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AASharing", (m) => {
  const usdc = m.contract("MockUSDC", ["USD Coin", "USDC", 6]);
  const aaSharing = m.contract("AASharing", [usdc]);
  const bridge = m.contract("CrossChainBridge", [usdc, aaSharing, m.getParameter("validator")]);
  
  return { aaSharing, bridge, usdc };
});
```

## 🔍 Verification Process

### Flow Networks

```bash
# After deployment, verify contracts
npx hardhat verify --network flowMainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Example
npx hardhat verify --network flowMainnet 0x123... "0x456..."
```

### Custom Verification

```javascript
// Verification script
await hre.run("verify:verify", {
  address: contractAddress,
  constructorArguments: [usdcAddress],
  contract: "contracts/AASharing.sol:AASharing"
});
```

## 📈 Monitoring & Maintenance

### Transaction Monitoring

```javascript
// Monitor contract events
const filter = aaSharing.filters.PartnershipCreated();
aaSharing.on(filter, (partnershipId, partner1, partner2, event) => {
  console.log(`New partnership: ${partnershipId}`);
});
```

### Health Checks

```javascript
// Regular health check script
async function healthCheck() {
  const stats = await aaSharing.getContractStats();
  console.log("Total Partnerships:", stats._totalPartnerships);
  console.log("Total USDC Locked:", ethers.formatUnits(stats._totalUSDCLocked, 6));
}
```

## 🚨 Emergency Procedures

### Contract Pause

```bash
# If security issue detected
npx hardhat run scripts/emergency-pause.js --network flowMainnet
```

### Fund Recovery

```bash
# Emergency withdrawal (owner only)
npx hardhat run scripts/emergency-withdraw.js --network flowMainnet
```

## 📱 Frontend Integration

### Contract Addresses

```typescript
// Frontend configuration
export const CONTRACTS = {
  flowMainnet: {
    aaSharing: "0x...",
    bridge: "0x...",
    usdc: "0x..."
  },
  flowTestnet: {
    aaSharing: "0x...",
    bridge: "0x...", 
    usdc: "0x..."
  }
};
```

### ABI Integration

```typescript
import { abi as AASharing_ABI } from './abis/AASharing.json';
import { abi as Bridge_ABI } from './abis/CrossChainBridge.json';

const aaSharing = new ethers.Contract(address, AASharing_ABI, signer);
```

## 🎯 Next Steps

1. **Deploy to Flow Testnet**: Test all functionality
2. **Security Audit**: Professional audit before mainnet
3. **Frontend Integration**: Connect with React app
4. **Cross-Chain Setup**: Configure Avail Nexus
5. **Mainnet Launch**: Deploy to Flow mainnet

---

*For support: create GitHub issue or contact team*