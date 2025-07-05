'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, SIMPLE_STORAGE_ABI, NETWORK_CONFIG } from '@/config/contracts';

// 为window.ethereum添加类型定义
interface EthereumProvider {
  request: (args: {method: string; params?: unknown[]}) => Promise<unknown>;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

type UserData = {
  messages: string[];
  tokenAmount: string;
  timestamp: string;
};

export default function TestStoragePage() {
  const { authenticated, ready, login } = usePrivy();
  const [message, setMessage] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [status, setStatus] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  // 加载用户数据
  const loadUserData = useCallback(async (storageContract: ethers.Contract) => {
    try {
      const data = await storageContract.getMyData();
      setUserData({
        messages: data[0],
        tokenAmount: ethers.formatEther(data[1]),
        timestamp: new Date(Number(data[2]) * 1000).toISOString()
      });
    } catch (error) {
      console.log('No existing data found');
    }
  }, []);

  // 初始化合约
  const initializeContract = useCallback(async () => {
    try {
      setStatus('Connecting to wallet...');
      
      // 获取window.ethereum
      if (!window.ethereum) {
        throw new Error('No ethereum provider found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // 切换到Flow网络
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
        });
      } catch (switchError: unknown) {
        const isErrorWithCode = (err: unknown): err is {code: number} => 
          typeof err === 'object' && err !== null && 'code' in err;
          
        // 如果网络不存在，添加网络
        if (isErrorWithCode(switchError) && switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
              chainName: NETWORK_CONFIG.name,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            }],
          });
        }
      }

      const ethersSigner = await provider.getSigner();
      setSigner(ethersSigner);

      const simpleStorageContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SIMPLE_STORAGE,
        SIMPLE_STORAGE_ABI,
        ethersSigner
      );

      setContract(simpleStorageContract);
      setStatus('✅ Connected to SimpleStorage contract');
      
      // 加载用户数据
      await loadUserData(simpleStorageContract);
      
    } catch (error: unknown) {
      console.error('Failed to initialize:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMessage}`);
    }
  }, [loadUserData]);

  // 初始化连接
  useEffect(() => {
    if (authenticated && ready) {
      initializeContract();
    }
  }, [authenticated, ready, initializeContract]);

  const handleStoreMessage = async () => {
    if (!contract || !message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setStatus('Storing message on blockchain...');
      
      const tx = await contract.addMessage(message);
      setStatus(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      setStatus(`✅ Message stored in block ${receipt.blockNumber}`);
      
      setMessage('');
      await loadUserData(contract);
      
    } catch (error: unknown) {
      console.error('Failed to store message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMessage}`);
    }
  };

  const handleStoreData = async () => {
    if (!contract || !message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setStatus('Storing data on blockchain...');
      
      const messages = [message];
      const tokenAmountWei = tokenAmount ? ethers.parseEther(tokenAmount) : 0;
      
      const tx = await contract.storeData(messages, tokenAmountWei);
      setStatus(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      setStatus(`✅ Data stored in block ${receipt.blockNumber}`);
      
      setMessage('');
      setTokenAmount('');
      await loadUserData(contract);
      
    } catch (error: unknown) {
      console.error('Failed to store data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMessage}`);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-purple-600">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Connect Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to test storage.</p>
          <button
            onClick={login}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            🔗 Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">SimpleStorage Test</h1>
          
          {/* Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Status</h3>
            <p className="text-sm text-blue-700">{status}</p>
            <p className="text-xs text-blue-600 mt-1">
              Contract: {CONTRACT_ADDRESSES.SIMPLE_STORAGE}
            </p>
          </div>

          {/* Existing Data */}
          {userData && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Your Stored Data</h3>
              <div className="text-sm">
                <p><strong>Messages:</strong></p>
                <ul className="ml-4 mb-2">
                  {userData.messages.map((msg, i) => (
                    <li key={i}>• {msg}</li>
                  ))}
                </ul>
                <p><strong>Token Amount:</strong> {userData.tokenAmount} tokens</p>
                <p><strong>Last Updated:</strong> {new Date(userData.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Amount (optional)
              </label>
              <input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStoreMessage}
              disabled={!contract || !message.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
            >
              Add Message Only
            </button>
            
            <button
              onClick={handleStoreData}
              disabled={!contract || !message.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
            >
              Store Data (Replace All)
            </button>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.location.href = '/storage'}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Full Storage
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
    try {
      setStatus('Connecting to wallet...');
      
      // 获取window.ethereum
      if (!window.ethereum) {
        throw new Error('No ethereum provider found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // 切换到Flow网络
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
        });
      } catch (switchError: unknown) {
        const isErrorWithCode = (err: unknown): err is {code: number} => 
          typeof err === 'object' && err !== null && 'code' in err;
          
        // 如果网络不存在，添加网络
        if (isErrorWithCode(switchError) && switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
              chainName: NETWORK_CONFIG.name,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            }],
          });
        }
      }

      const ethersSigner = await provider.getSigner();
      setSigner(ethersSigner);

      const simpleStorageContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SIMPLE_STORAGE,
        SIMPLE_STORAGE_ABI,
        ethersSigner
      );

      setContract(simpleStorageContract);
      setStatus('✅ Connected to SimpleStorage contract');
      
      // 加载用户数据
      loadUserData(simpleStorageContract);
      
    } catch (error: unknown) {
      console.error('Failed to initialize:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMessage}`);
    }
  };

        }
      }

      const ethersSigner = await provider.getSigner();
      setSigner(ethersSigner);

      const simpleStorageContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SIMPLE_STORAGE,
        SIMPLE_STORAGE_ABI,
        ethersSigner
      );

      setContract(simpleStorageContract);
      setStatus('✅ Connected to SimpleStorage contract');
      
      // 加载用户数据
      await loadUserData(simpleStorageContract);
      
    } catch (error: unknown) {
      console.error('Failed to initialize:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMessage}`);
    }
  }, [loadUserData]);

  const handleStoreMessage = async () => {
    if (!contract || !message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setStatus('Storing message on blockchain...');
      
      const tx = await contract.addMessage(message);
      setStatus(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      setStatus(`✅ Message stored in block ${receipt.blockNumber}`);
      
      setMessage('');
      await loadUserData(contract);
      
    } catch (error: unknown) {
      console.error('Failed to store message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMessage}`);
    }
  };

  const handleStoreData = async () => {
    if (!contract || !message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setStatus('Storing data on blockchain...');
      
      const messages = [message];
      const tokenAmountWei = tokenAmount ? ethers.parseEther(tokenAmount) : 0;
      
      const tx = await contract.storeData(messages, tokenAmountWei);
      setStatus(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      setStatus(`✅ Data stored in block ${receipt.blockNumber}`);
      
      setMessage('');
      setTokenAmount('');
      await loadUserData(contract);
      
    } catch (error: unknown) {
      console.error('Failed to store data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMessage}`);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-purple-600">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Connect Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to test storage.</p>
          <button
            onClick={login}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            🔗 Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">SimpleStorage Test</h1>
          
          {/* Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Status</h3>
            <p className="text-sm text-blue-700">{status}</p>
            <p className="text-xs text-blue-600 mt-1">
              Contract: {CONTRACT_ADDRESSES.SIMPLE_STORAGE}
            </p>
          </div>

          {/* Existing Data */}
          {userData && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Your Stored Data</h3>
              <div className="text-sm">
                <p><strong>Messages:</strong></p>
                <ul className="ml-4 mb-2">
                  {userData.messages.map((msg: string, i: number) => (
                    <li key={i}>• {msg}</li>
                  ))}
                </ul>
                <p><strong>Token Amount:</strong> {userData.tokenAmount} tokens</p>
                <p><strong>Last Updated:</strong> {new Date(userData.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Amount (optional)
              </label>
              <input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStoreMessage}
              disabled={!contract || !message.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
            >
              Add Message Only
            </button>
            
            <button
              onClick={handleStoreData}
              disabled={!contract || !message.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50"
            >
              Store Data (Replace All)
            </button>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => window.location.href = '/storage'}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Full Storage
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}