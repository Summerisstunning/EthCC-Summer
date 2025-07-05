// Frontend Integration Helper for AASharing Contract
const AASharing_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "requester", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "EmergencyWithdraw",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "partnerA", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "partnerB", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amountEach", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "FundsSplit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "goalId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "GoalCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "goalId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "contributor", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "GoalContribution",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "goalId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "targetAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "GoalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "gratitudeId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "author", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "content", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "GratitudeDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"indexed": false, "internalType": "address", "name": "partnerA", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "partnerB", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "PartnershipCreated",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "partnershipId", "type": "uint256"}
    ],
    "name": "contributeToPartnership",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"internalType": "uint256", "name": "goalIndex", "type": "uint256"}
    ],
    "name": "contributeToGoal",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "partnerB", "type": "address"}
    ],
    "name": "createPartnership",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "targetAmount", "type": "uint256"}
    ],
    "name": "createGoal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "partnershipId", "type": "uint256"},
      {"internalType": "string", "name": "content", "type": "string"}
    ],
    "name": "depositGratitude",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Flow Mainnet Configuration
const FLOW_MAINNET_CONFIG = {
  chainId: 747,
  name: 'Flow Mainnet EVM',
  rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
  explorer: 'https://evm.flowscan.org',
  nativeCurrency: {
    name: 'FLOW',
    symbol: 'FLOW',
    decimals: 18
  }
};

// Example usage in frontend:
/*
import { ethers } from 'ethers';

// Connect to Flow Mainnet EVM
const provider = new ethers.JsonRpcProvider('https://mainnet.evm.nodes.onflow.org');

// Contract instance (replace CONTRACT_ADDRESS with actual deployed address)
const contract = new ethers.Contract(CONTRACT_ADDRESS, AASharing_ABI, provider);

// With signer for transactions
const contractWithSigner = contract.connect(signer);

// Create partnership
await contractWithSigner.createPartnership(partnerAddress);

// Deposit gratitude with FLOW contribution
await contractWithSigner.depositGratitude(partnershipId, "Thank you!", { 
  value: ethers.parseEther("1.0") 
});
*/

module.exports = {
  AASharing_ABI,
  FLOW_MAINNET_CONFIG
};