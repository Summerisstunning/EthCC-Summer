// Smart Contract Configuration for AA Sharing
export const CONTRACT_ADDRESSES = {
  // Flow Mainnet addresses
  MOCK_USDC: "0x49f6B4bE035f86C4C8F6785c39Ca6b26ed60A07E",
  AA_SHARING: "0xC5EbC476BA2C9fb014b74C017211AbACFa80210c",
  BRIDGE: "0xF49b526BB6687a962a86D9737a773b158a0C2C05",
  SIMPLE_STORAGE: "0xA3E78204CFF5caA3d7621C0457Dea733AF377835"
} as const;

export const NETWORK_CONFIG = {
  chainId: 747,
  name: "Flow Mainnet",
  rpcUrl: "https://mainnet.evm.nodes.onflow.org",
  blockExplorer: "https://flowscan.org",
  nativeCurrency: {
    name: "Flow",
    symbol: "FLOW",
    decimals: 18
  }
} as const;

// Contract ABIs
export const MOCK_USDC_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount) external",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
] as const;

export const AA_SHARING_ABI = [
  // View functions
  "function owner() view returns (address)",
  "function usdc() view returns (address)",
  "function totalPartnerships() view returns (uint256)",
  "function bridgeContract() view returns (address)",
  "function partnerships(uint256) view returns (address partner1, address partner2, uint256 balance, uint256 goalCount, bool active)",
  "function goals(uint256) view returns (uint256 partnershipId, string name, string description, uint256 targetAmount, uint256 currentAmount, bool achieved)",
  "function getPartnershipGoals(uint256 partnershipId) view returns (uint256[])",
  "function getPartnershipGratitudes(uint256 partnershipId) view returns (uint256[])",
  
  // Write functions
  "function createPartnership(address partner2, string calldata nickname1, string calldata nickname2) external returns (uint256)",
  "function addGratitude(uint256 partnershipId, string calldata gratitudeText, uint256 usdcAmount) external",
  "function depositFunds(uint256 partnershipId, uint256 amount) external",
  "function createGoal(uint256 partnershipId, string calldata goalName, string calldata description, uint256 targetAmount) external returns (uint256)",
  "function contributeToGoal(uint256 goalId, uint256 amount) external",
  "function withdraw(uint256 partnershipId) external",
  
  // Events
  "event PartnershipCreated(uint256 indexed partnershipId, address indexed partner1, address indexed partner2, string nickname1, string nickname2)",
  "event GratitudeAdded(uint256 indexed partnershipId, address indexed contributor, string gratitudeText, uint256 usdcAmount, uint256 timestamp)",
  "event FundsDeposited(uint256 indexed partnershipId, address indexed depositor, uint256 amount, string source)",
  "event FundsWithdrawn(uint256 indexed partnershipId, address indexed partner1, address indexed partner2, uint256 amountEach)",
  "event GoalCreated(uint256 indexed partnershipId, uint256 indexed goalId, string name, uint256 targetAmount)",
  "event GoalContribution(uint256 indexed goalId, address indexed contributor, uint256 amount)",
  "event GoalAchieved(uint256 indexed goalId, uint256 totalAmount)"
] as const;

export const BRIDGE_ABI = [
  // View functions
  "function validator() view returns (address)",
  "function aaContract() view returns (address)", 
  "function bridgeFeePercent() view returns (uint256)",
  "function supportedChains(uint256) view returns (bool)",
  "function getSupportedChains() view returns (uint256[])",
  
  // Write functions
  "function bridgeToChain(uint256 targetChainId, address targetAddress, uint256 amount) external payable",
  
  // Events
  "event BridgeTransfer(uint256 indexed sourceChain, uint256 indexed targetChain, address indexed user, uint256 amount, bytes32 txHash)"
] as const;

export const SIMPLE_STORAGE_ABI = [
  // Write functions
  "function storeData(string[] memory _messages, uint256 _tokenAmount) external",
  "function addMessage(string memory _message) external", 
  "function updateTokenAmount(uint256 _newAmount) external",
  
  // View functions
  "function getUserData(address _user) view returns (string[] memory messages, uint256 tokenAmount, address userAddress, uint256 timestamp)",
  "function getMyData() view returns (string[] memory messages, uint256 tokenAmount, uint256 timestamp)",
  "function getMessageCount(address _user) view returns (uint256)",
  "function getMessage(address _user, uint256 _index) view returns (string memory)",
  "function getAllUsers() view returns (address[] memory)",
  "function getUserCount() view returns (uint256)",
  "function userExists(address _user) view returns (bool)",
  
  // Events
  "event DataStored(address indexed user, string[] messages, uint256 tokenAmount, uint256 timestamp)",
  "event MessageAdded(address indexed user, string message, uint256 timestamp)",
  "event TokenAmountUpdated(address indexed user, uint256 oldAmount, uint256 newAmount, uint256 timestamp)"
] as const;

// Helper function to get contract config by name
export function getContractConfig(contractName: keyof typeof CONTRACT_ADDRESSES) {
  const address = CONTRACT_ADDRESSES[contractName];
  
  switch (contractName) {
    case 'MOCK_USDC':
      return { address, abi: MOCK_USDC_ABI };
    case 'AA_SHARING':
      return { address, abi: AA_SHARING_ABI };
    case 'BRIDGE':
      return { address, abi: BRIDGE_ABI };
    case 'SIMPLE_STORAGE':
      return { address, abi: SIMPLE_STORAGE_ABI };
    default:
      throw new Error(`Unknown contract: ${contractName}`);
  }
}

// USDC Token Configuration
export const USDC_CONFIG = {
  address: CONTRACT_ADDRESSES.MOCK_USDC,
  decimals: 6,
  symbol: "USDC",
  name: "USD Coin on Flow"
} as const;