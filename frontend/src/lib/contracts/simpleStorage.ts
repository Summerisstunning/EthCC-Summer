import { ethers } from 'ethers';

// SimpleStorage合约ABI
const simpleStorageABI = [
  // 存储数据函数
  "function storeData(string[] memory _messages, uint256 _tokenAmount) external",
  
  // 添加消息函数
  "function addMessage(string memory _message) external",
  
  // 更新代币数量函数
  "function updateTokenAmount(uint256 _newAmount) external",
  
  // 查询用户数据函数
  "function getUserData(address _user) external view returns (string[] memory messages, uint256 tokenAmount, address userAddress, uint256 timestamp)",
  
  // 获取当前用户数据函数
  "function getMyData() external view returns (string[] memory messages, uint256 tokenAmount, uint256 timestamp)",
  
  // 获取消息数量
  "function getMessageCount(address _user) external view returns (uint256)",
  
  // 获取特定消息
  "function getMessage(address _user, uint256 _index) external view returns (string memory)",
  
  // 事件
  "event DataStored(address indexed user, string[] messages, uint256 tokenAmount, uint256 timestamp)",
  "event MessageAdded(address indexed user, string message, uint256 timestamp)",
  "event TokenAmountUpdated(address indexed user, uint256 oldAmount, uint256 newAmount, uint256 timestamp)"
];

// 获取合约地址
const getSimpleStorageAddress = (): string => {
  // 这里需要替换为您部署的SimpleStorage合约地址
  // 在生产环境中，应该从环境变量或配置文件中获取
  return process.env.NEXT_PUBLIC_SIMPLE_STORAGE_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // 默认本地Hardhat地址
};

// 创建合约实例
export const getSimpleStorageContract = (providerOrSigner: ethers.Provider | ethers.Signer) => {
  const contractAddress = getSimpleStorageAddress();
  return new ethers.Contract(contractAddress, simpleStorageABI, providerOrSigner);
};

// 存储数据
export const storeData = async (
  signer: ethers.Signer,
  messages: string[],
  tokenAmount: bigint
): Promise<ethers.TransactionResponse> => {
  const contract = getSimpleStorageContract(signer);
  return await contract.storeData(messages, tokenAmount);
};

// 添加单条消息
export const addMessage = async (
  signer: ethers.Signer,
  message: string
): Promise<ethers.TransactionResponse> => {
  const contract = getSimpleStorageContract(signer);
  return await contract.addMessage(message);
};

// 更新代币数量
export const updateTokenAmount = async (
  signer: ethers.Signer,
  amount: bigint
): Promise<ethers.TransactionResponse> => {
  const contract = getSimpleStorageContract(signer);
  return await contract.updateTokenAmount(amount);
};

// 查询用户数据
export const getUserData = async (
  provider: ethers.Provider,
  userAddress: string
): Promise<{
  messages: string[];
  tokenAmount: bigint;
  userAddress: string;
  timestamp: bigint;
}> => {
  const contract = getSimpleStorageContract(provider);
  return await contract.getUserData(userAddress);
};

// 获取当前用户数据
export const getMyData = async (
  signer: ethers.Signer
): Promise<{
  messages: string[];
  tokenAmount: bigint;
  timestamp: bigint;
}> => {
  const contract = getSimpleStorageContract(signer);
  return await contract.getMyData();
};

// 获取消息数量
export const getMessageCount = async (
  provider: ethers.Provider,
  userAddress: string
): Promise<bigint> => {
  const contract = getSimpleStorageContract(provider);
  return await contract.getMessageCount(userAddress);
};

// 获取特定消息
export const getMessage = async (
  provider: ethers.Provider,
  userAddress: string,
  index: number
): Promise<string> => {
  const contract = getSimpleStorageContract(provider);
  return await contract.getMessage(userAddress, index);
};
