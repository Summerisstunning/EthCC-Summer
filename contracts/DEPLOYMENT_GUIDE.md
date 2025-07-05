# 🌐 Flow EVM Deployment Guide - AA Sharing Smart Contract

## 📋 Current Status
✅ **Smart Contract Ready**: AASharing.sol is production-ready for Flow Mainnet EVM  
✅ **Deployment Tools Configured**: Hardhat + ethers.js setup complete  
✅ **Frontend Integration Ready**: ABI and configuration files prepared  
⏳ **Pending**: Private key setup for mainnet deployment  

## 🚀 Next Steps to Deploy

### 1. Set Up Your Private Key
Create a `.env` file in the `/contracts` directory:
```bash
# Create .env file
touch .env

# Add your Flow private key (keep this secure!)
echo "FLOW_PRIVATE_KEY=your_private_key_here" >> .env
```

### 2. Ensure FLOW Balance
- Your Flow address: `0x000000000000000000000002D399f1eB0b5CF334`
- Check balance at: https://evm.flowscan.org/address/0x000000000000000000000002D399f1eB0b5CF334
- Need minimum ~0.1 FLOW for gas fees

### 3. Deploy to Flow Mainnet EVM
```bash
cd contracts
npm run deploy
# OR
node deploy-simple.js
```

## 🔧 Technical Configuration

### Flow Mainnet EVM Details:
- **Chain ID**: 747
- **RPC URL**: https://mainnet.evm.nodes.onflow.org
- **Explorer**: https://evm.flowscan.org
- **Native Token**: FLOW (18 decimals)

### Contract Features:
- ✅ Partnership creation between two addresses
- ✅ Gratitude recording with optional FLOW contributions
- ✅ Shared goal creation and tracking  
- ✅ Fund splitting functionality
- ✅ Consumer-friendly design for mainstream adoption
- ✅ Full event logging for transparency

### Gas Estimation:
- **Contract Deployment**: ~2,000,000 gas (~0.05 FLOW)
- **Create Partnership**: ~100,000 gas (~0.002 FLOW)
- **Deposit Gratitude**: ~80,000 gas (~0.0016 FLOW)
- **Create Goal**: ~120,000 gas (~0.0024 FLOW)

## 📱 Frontend Integration

After deployment, update your frontend with the contract address:

```typescript
// In your frontend/.env.local
NEXT_PUBLIC_AASHARING_CONTRACT_ADDRESS=0x_DEPLOYED_CONTRACT_ADDRESS_HERE
NEXT_PUBLIC_FLOW_CHAIN_ID=747
```

## 🎯 Hackathon Submission Ready

This contract is optimized for the Flow hackathon "Best Killer App" category:

- **Consumer Focus**: Simple, intuitive interface for couples/friends
- **Real Utility**: Combines emotional engagement with financial planning
- **Flow Native**: Built specifically for Flow EVM with gas optimization
- **Mainstream Appeal**: Gratitude journaling + shared savings = mass adoption potential

## 🔍 Post-Deployment Verification

After deployment, verify the contract on FlowScan:
1. Go to https://evm.flowscan.org/address/YOUR_CONTRACT_ADDRESS
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Upload `AASharing.sol` source code

## 📞 Support

If you encounter any issues:
1. Check Flow EVM documentation: https://developers.flow.com/evm
2. Verify your private key corresponds to your Flow address
3. Ensure sufficient FLOW balance for gas fees
4. Check RPC connectivity to Flow Mainnet EVM

---

**Ready for deployment! 🚀 Your AA Sharing dApp is one step away from going live on Flow Mainnet EVM.**