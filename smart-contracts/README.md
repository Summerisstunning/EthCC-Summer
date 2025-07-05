# AA Sharing - Smart Contracts

A decentralized love and gratitude ledger for couples and friends to record daily appreciation and build shared savings on-chain.

## 🌟 Features

- **Partnership Creation**: Create shared accounts between two addresses
- **Gratitude Recording**: Log daily gratitude with optional USDC contributions
- **Shared Wallet**: Pool funds together with fair 50/50 withdrawal system
- **Savings Goals**: Set and track financial goals as a couple
- **Cross-Chain Support**: Deposit USDC from multiple chains via Avail Nexus
- **User-Friendly**: Designed for non-crypto users with Privy integration

## 📋 Contracts

### AASharing.sol
Main contract for partnership management and gratitude recording.

**Key Functions:**
- `createPartnership()` - Create a new partnership
- `addGratitude()` - Record gratitude with optional USDC
- `depositFunds()` - Direct USDC deposits
- `withdraw()` - 50/50 withdrawal of shared funds
- `createGoal()` - Set savings goals

### CrossChainBridge.sol
Bridge contract for cross-chain USDC deposits using Avail Nexus.

**Key Functions:**
- `initiateCrossChainDeposit()` - Start cross-chain transfer
- `completeCrossChainDeposit()` - Complete transfer on destination chain

### MockUSDC.sol
Test USDC token for local development and testing.

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ (Note: Hardhat doesn't fully support v23+ yet)
- npm or yarn
- Git

### Installation

```bash
cd smart-contracts
npm install
```

### Environment Setup

1. Copy environment file:
```bash
cp .env.example .env
```

2. Fill in your values:
```bash
PRIVATE_KEY=your_private_key_without_0x
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
FLOW_ACCOUNT_ADDRESS=0x000000000000000000000002D399f1eB0b5CF334
```

### Compilation

```bash
npm run compile
```

### Testing

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run test:coverage
```

## 🛠 Deployment

### Local Development

```bash
# Start local node
npm run node

# Deploy to local node (new terminal)
npm run deploy:local
```

### Flow Testnet

```bash
npm run deploy:flowTestnet
```

### Flow Mainnet

```bash
npm run deploy:flowMainnet
```

### Using Hardhat Ignition (Recommended)

```bash
# Deploy to Flow testnet
npm run ignition:flowTestnet

# Deploy to Flow mainnet  
npm run ignition:flowMainnet
```

## 🌐 Supported Networks

| Network | Chain ID | RPC URL | USDC Address |
|---------|----------|---------|--------------|
| Flow Mainnet | 747 | https://mainnet.evm.nodes.onflow.org | TBD |
| Flow Testnet | 545 | https://testnet.evm.nodes.onflow.org | TBD |
| Ethereum | 1 | Custom RPC | 0xA0b86a33E6441A71F3F5F11CB7F17be1abE70E81 |
| Arbitrum | 42161 | https://arb1.arbitrum.io/rpc | 0xaf88d065e77c8cC2239327C5EDb3A432268e5831 |

## 🧪 Testing

The project includes comprehensive tests:

- **Unit Tests**: Individual contract functionality
- **Integration Tests**: Cross-contract interactions
- **Bridge Tests**: Cross-chain functionality
- **Edge Cases**: Error handling and security

### Test Structure

```
test/
├── AASharing.test.js      # Main contract tests
├── CrossChainBridge.test.js # Bridge functionality
└── Integration.test.js    # End-to-end scenarios
```

### Key Test Scenarios

1. **Partnership Lifecycle**
   - Creation, gratitude recording, withdrawals
   
2. **Cross-Chain Deposits**
   - Initiation, validation, completion
   
3. **Security Features**
   - Reentrancy protection, signature verification
   
4. **Error Handling**
   - Invalid inputs, unauthorized access

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:

- **Packed Structs**: Efficient storage layout
- **Batch Operations**: Multiple actions in single transaction
- **Minimal Storage**: Only essential data on-chain
- **ReentrancyGuard**: Protection with minimal overhead

## 🔒 Security Features

- **OpenZeppelin**: Battle-tested contract libraries
- **Reentrancy Protection**: All state-changing functions protected
- **Access Control**: Partnership-based permissions
- **Signature Verification**: Cross-chain message validation
- **Pausable**: Emergency stop functionality
- **Nonce Protection**: Replay attack prevention

## 🚀 Cross-Chain Architecture

The system uses Avail Nexus for cross-chain USDC deposits:

1. **Source Chain**: User initiates deposit via bridge
2. **Avail DA**: Message stored on Avail Data Availability
3. **Destination Chain**: Validator completes deposit with proof
4. **AA Sharing**: Funds added to partnership balance

## 📈 Usage Examples

### Create Partnership

```solidity
// Alice creates partnership with Bob
aaSharing.createPartnership(
    bobAddress,
    "Alice",
    "Bob"
);
```

### Add Gratitude with USDC

```solidity
// Approve USDC first
usdc.approve(aaSharing, 100e6);

// Add gratitude with $100 USDC
aaSharing.addGratitude(
    partnershipId,
    "Thank you for cooking dinner!",
    100e6
);
```

### Cross-Chain Deposit

```solidity
// From Arbitrum to Flow
bridge.initiateCrossChainDeposit(
    partnershipId,
    1000e6, // $1000 USDC
    747     // Flow chain ID
);
```

### Withdraw Funds

```solidity
// Both partners get 50% each
aaSharing.withdraw(partnershipId);
```

## 🛣 Roadmap

- [ ] **Phase 1**: Core contract deployment on Flow
- [ ] **Phase 2**: Cross-chain bridge integration
- [ ] **Phase 3**: Advanced features (goals, rewards)
- [ ] **Phase 4**: Mobile app integration
- [ ] **Phase 5**: DeFi yield strategies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: See inline code comments
- **Issues**: Create GitHub issue
- **Discord**: Join our community
- **Email**: support@aasharing.com

## 🎯 Contract Addresses

### Flow Mainnet
- AASharing: `TBD`
- CrossChainBridge: `TBD`

### Flow Testnet  
- AASharing: `TBD`
- CrossChainBridge: `TBD`

---

*Built with ❤️ for couples and friends who want to share love on-chain*