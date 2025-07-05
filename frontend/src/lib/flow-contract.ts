import { ethers } from 'ethers';

// ethers.js v6 中的交易类型
interface TransactionResponse {
  hash: string;
  wait: () => Promise<ethers.TransactionReceipt>;
}

// 定义合约方法类型
type ContractMethods = {
  createPartnership(partnerAddress: string): Promise<TransactionResponse>;
  depositGratitude(partnershipId: number, message: string, options?: {value: ethers.BigNumberish}): Promise<TransactionResponse>;
  getPartnership(partnershipId: number): Promise<{[key: string]: unknown}>;
  getPartnershipGoals(partnershipId: number): Promise<{[key: string]: unknown}[]>;
  createGoal(partnershipId: number, name: string, targetAmount: ethers.BigNumberish): Promise<TransactionResponse>;
  contributeToGoal(partnershipId: number, goalId: number, options?: {value: ethers.BigNumberish}): Promise<TransactionResponse>;
  contributeToPartnership(partnershipId: number, options?: {value: ethers.BigNumberish}): Promise<TransactionResponse>;
  totalPartnerships(): Promise<bigint>;
  partnerships(index: number): Promise<{[key: string]: unknown}>;
}

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
  private contract: ethers.Contract & ContractMethods;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(FLOW_MAINNET_CONFIG.rpcUrl);
    this.contract = new ethers.Contract(
      FLOW_MAINNET_CONFIG.contractAddress!,
      AASHARING_ABI,
      this.provider
    ) as ethers.Contract & ContractMethods;
  }

  // Connect with user wallet
  async connectWallet(signer: ethers.Signer): Promise<ethers.Contract & ContractMethods> {
    return this.contract.connect(signer) as ethers.Contract & ContractMethods;
  }

  // Create a new partnership
  async createPartnership(signer: ethers.Signer, partnerAddress: string) {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract & ContractMethods;
    const tx = await contractWithSigner.createPartnership(partnerAddress);
    return await tx.wait();
  }

  // Deposit gratitude with optional FLOW contribution
  async depositGratitude(
    signer: ethers.Signer,
    partnershipId: number,
    message: string,
    value: ethers.BigNumberish = 0
  ) {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract & ContractMethods;
    const options = value ? { value } : undefined;
    const tx = await contractWithSigner.depositGratitude(partnershipId, message, options);
    return await tx.wait();
  }

  // Create a new goal for a partnership
  async createGoal(
    signer: ethers.Signer,
    partnershipId: number,
    name: string,
    targetAmount: ethers.BigNumberish
  ) {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract & ContractMethods;
    const tx = await contractWithSigner.createGoal(
      partnershipId,
      name,
      targetAmount
    );
    return await tx.wait();
  }

  // Contribute to a partnership (general contribution)
  async contributeToPartnership(
    signer: ethers.Signer,
    partnershipId: number,
    value: ethers.BigNumberish
  ) {
    const contractWithSigner = this.contract.connect(signer) as ethers.Contract & ContractMethods;
    const options = { value };
    const tx = await contractWithSigner.contributeToPartnership(partnershipId, options);
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