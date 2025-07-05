# 🚀 Flow Mainnet Deployment Instructions

## 📋 Pre-Deployment Checklist

✅ **Network Connection**: Flow Mainnet connected (Chain ID: 747)  
✅ **Contracts Compiled**: All contracts compiled successfully  
✅ **Tests Passing**: 30/34 tests passing (88% success rate)  
✅ **Deployment Scripts**: Ready for Flow Mainnet  

## 🔐 Security Setup Required

### Step 1: Private Key Configuration

You need to add your private key to deploy to Flow Mainnet:

```bash
# Edit the .env file
nano .env

# Add your private key (WITHOUT 0x prefix)
PRIVATE_KEY=your_private_key_here_without_0x
```

**⚠️ IMPORTANT**: 
- Never commit your private key to git
- Use a dedicated deployment wallet
- Ensure sufficient FLOW balance (minimum 0.1 FLOW)

### Step 2: Account Balance Check

Your wallet address: `0x000000000000000000000002D399f1eB0b5CF334`

Please ensure this address has at least **0.1 FLOW** tokens for deployment costs.

### Step 3: Deployment Process

Once private key is configured:

```bash
# 1. Test connection with your account
npx hardhat run scripts/test-network.js --network flowMainnet

# 2. Deploy contracts to Flow Mainnet
npm run deploy:flowMainnet

# 3. Verify contracts on FlowScan
npm run verify:flowMainnet

# 4. Test deployed functionality
npm run test:flowMainnet
```

## 📊 Expected Deployment Costs

| Contract | Estimated Gas | Estimated Cost |
|----------|---------------|----------------|
| Mock USDC | ~1.2M gas | ~0.01 FLOW |
| AA Sharing | ~2.5M gas | ~0.025 FLOW |
| CrossChain Bridge | ~1.8M gas | ~0.018 FLOW |
| **Total** | **~5.5M gas** | **~0.055 FLOW** |

## 🎯 Post-Deployment Steps

1. **Contract Verification**: Contracts will be verified on FlowScan
2. **Functionality Testing**: Basic operations will be tested
3. **Frontend Integration**: Contract addresses will be provided for frontend
4. **Documentation**: Deployment info will be saved to `deployments/` folder

## 🔍 What Will Be Deployed

### 1. Mock USDC Token
- **Purpose**: Testing token for Flow (until native USDC available)
- **Supply**: 1,000,000 USDC minted to deployer
- **Decimals**: 6 (standard USDC)

### 2. AA Sharing Main Contract
- **Purpose**: Core partnership and gratitude functionality
- **Features**: Create partnerships, record gratitude, manage shared wallets
- **Security**: Reentrancy protection, access control, pausable

### 3. CrossChain Bridge
- **Purpose**: Cross-chain USDC deposits via Avail Nexus
- **Features**: Initiate/complete cross-chain transfers
- **Security**: Signature verification, nonce protection, fee management

## 🌐 Contract URLs (Post-Deployment)

After deployment, contracts will be available at:
- FlowScan: `https://flowscan.org/address/{CONTRACT_ADDRESS}`
- Contract interaction via Hardhat console

## 🆘 Emergency Procedures

- **Pause Contracts**: Owner can pause all operations
- **Emergency Withdrawal**: Owner can withdraw funds if paused
- **Validator Change**: Bridge validator can be updated

## 📱 Frontend Integration Ready

After deployment, the following will be provided for frontend integration:

```typescript
// Contract addresses for frontend
export const FLOW_MAINNET_CONTRACTS = {
  aaSharing: "0x...",
  bridge: "0x...",
  usdc: "0x..."
};
```

## 🎉 Ready to Deploy!

Once you've set the `PRIVATE_KEY` in the `.env` file, run:

```bash
npm run deploy:flowMainnet
```

The deployment will:
1. Check your account balance
2. Deploy all three contracts
3. Set up initial configuration
4. Verify deployments
5. Save deployment info
6. Provide next steps

---

**🔐 SECURITY REMINDER**: Keep your private key secure and never share it!