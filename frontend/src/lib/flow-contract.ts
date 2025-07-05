import { ethers } from 'ethers';

// Flow EVM Configuration
export const FLOW_MAINNET_CONFIG = {
  chainId: 747,
  name: 'Flow Mainnet EVM',
  rpcUrl: 'https://mainnet.evm.nodes.onflow.org',
  explorer: 'https://evm.flowscan.org',
  contractAddress: process.env.NEXT_PUBLIC_AASHARING_CONTRACT_ADDRESS,
  nativeCurrency: {
    name: 'FLOW',
    symbol: 'FLOW',
    decimals: 18
  }
};

// AASharing Contract ABI
export const AASHARING_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
      {"indexed": true, "internalType": "uint256", "name": "goalId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "targetAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
    ],
    "name": "GoalCreated",
    "type": "event"
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
      {"internalType": "string", "name": "content", "type": "string"}
    ],
    "name": "depositGratitude",
    "outputs": [],
    "stateMutability": "payable",
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
      {"internalType": "uint256", "name": "partnershipId", "type": "uint256"}
    ],
    "name": "contributeToPartnership",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// Flow Contract Service
export class FlowContractService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(FLOW_MAINNET_CONFIG.rpcUrl);
    this.contract = new ethers.Contract(
      FLOW_MAINNET_CONFIG.contractAddress!,
      AASHARING_ABI,
      this.provider
    );
  }

  // Connect with user wallet
  async connectWallet(signer: ethers.Signer) {
    return this.contract.connect(signer);
  }

  // Create a new partnership
  async createPartnership(signer: ethers.Signer, partnerAddress: string) {
    const contractWithSigner = this.contract.connect(signer);
    const tx = await contractWithSigner.createPartnership(partnerAddress);
    return await tx.wait();
  }

  // Deposit gratitude with optional FLOW contribution
  async depositGratitude(
    signer: ethers.Signer,
    partnershipId: number,
    content: string,
    flowAmount: string = '0'
  ) {
    const contractWithSigner = this.contract.connect(signer);
    const tx = await contractWithSigner.depositGratitude(
      partnershipId,
      content,
      { value: ethers.parseEther(flowAmount) }
    );
    return await tx.wait();
  }

  // Create a shared goal
  async createGoal(
    signer: ethers.Signer,
    partnershipId: number,
    name: string,
    description: string,
    targetAmount: string
  ) {
    const contractWithSigner = this.contract.connect(signer);
    const tx = await contractWithSigner.createGoal(
      partnershipId,
      name,
      description,
      ethers.parseEther(targetAmount)
    );
    return await tx.wait();
  }

  // Contribute to partnership
  async contributeToPartnership(
    signer: ethers.Signer,
    partnershipId: number,
    flowAmount: string
  ) {
    const contractWithSigner = this.contract.connect(signer);
    const tx = await contractWithSigner.contributeToPartnership(
      partnershipId,
      { value: ethers.parseEther(flowAmount) }
    );
    return await tx.wait();
  }

  // Get contract events
  async getPartnershipEvents(partnershipId?: number) {
    const filter = partnershipId
      ? this.contract.filters.PartnershipCreated(partnershipId)
      : this.contract.filters.PartnershipCreated();
    
    return await this.contract.queryFilter(filter);
  }

  async getGratitudeEvents(partnershipId?: number) {
    const filter = partnershipId
      ? this.contract.filters.GratitudeDeposited(partnershipId)
      : this.contract.filters.GratitudeDeposited();
    
    return await this.contract.queryFilter(filter);
  }

  async getGoalEvents(partnershipId?: number) {
    const filter = partnershipId
      ? this.contract.filters.GoalCreated(partnershipId)
      : this.contract.filters.GoalCreated();
    
    return await this.contract.queryFilter(filter);
  }
}

// Singleton instance
export const flowContractService = new FlowContractService();