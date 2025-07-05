'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useContracts } from '@/hooks/useContracts';
import { CONTRACT_ADDRESSES, SIMPLE_STORAGE_ABI } from '@/config/contracts';
import BackgroundImage from '@/components/background-image';

export default function StoragePage() {
  const { authenticated, ready, login } = usePrivy();
  const { signer, ready: contractsReady, balances, error } = useContracts();
  
  const [storageContract, setStorageContract] = useState<ethers.Contract | null>(null);
  const [messages, setMessages] = useState<string[]>(['']);
  const [tokenAmount, setTokenAmount] = useState('');
  const [singleMessage, setSingleMessage] = useState('');
  const [isStoring, setIsStoring] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [userData, setUserData] = useState<{
    messages: string[];
    tokenAmount: string;
    timestamp: string;
  } | null>(null);

  // Initialize storage contract
  useEffect(() => {
    if (contractsReady && signer) {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.SIMPLE_STORAGE,
        SIMPLE_STORAGE_ABI,
        signer
      );
      setStorageContract(contract);
      loadUserData(contract);
    }
  }, [contractsReady, signer]);

  const loadUserData = async (contract: ethers.Contract) => {
    try {
      const data = await contract.getMyData();
      setUserData({
        messages: data[0],
        tokenAmount: ethers.formatEther(data[1]),
        timestamp: new Date(Number(data[2]) * 1000).toISOString()
      });
    } catch (err) {
      console.log('No existing data found or error loading:', err);
    }
  };

  const addMessageField = () => {
    if (messages.length < 5) {
      setMessages([...messages, '']);
    }
  };

  const removeMessageField = (index: number) => {
    if (messages.length > 1) {
      setMessages(messages.filter((_, i) => i !== index));
    }
  };

  const updateMessage = (index: number, value: string) => {
    const updated = [...messages];
    updated[index] = value;
    setMessages(updated);
  };

  const handleStoreData = async () => {
    if (!storageContract) {
      alert('Contract not ready');
      return;
    }

    const validMessages = messages.filter(msg => msg.trim() !== '');
    if (validMessages.length === 0) {
      alert('Please enter at least one message');
      return;
    }

    setIsStoring(true);
    try {
      const tokenAmountWei = tokenAmount ? ethers.parseEther(tokenAmount) : 0;
      
      console.log('Storing data:', { messages: validMessages, tokenAmount: tokenAmountWei.toString() });
      
      const tx = await storageContract.storeData(validMessages, tokenAmountWei);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Data stored in block:', receipt.blockNumber);
      
      alert('✅ Data stored successfully on blockchain!');
      await loadUserData(storageContract);
      
      // Reset form
      setMessages(['']);
      setTokenAmount('');
      
    } catch (error: any) {
      console.error('Failed to store data:', error);
      alert(`Failed to store data: ${error.message || 'Please try again'}`);
    } finally {
      setIsStoring(false);
    }
  };

  const handleAddMessage = async () => {
    if (!storageContract || !singleMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsAdding(true);
    try {
      console.log('Adding message:', singleMessage);
      
      const tx = await storageContract.addMessage(singleMessage);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Message added in block:', receipt.blockNumber);
      
      alert('✅ Message added successfully!');
      await loadUserData(storageContract);
      setSingleMessage('');
      
    } catch (error: any) {
      console.error('Failed to add message:', error);
      alert(`Failed to add message: ${error.message || 'Please try again'}`);
    } finally {
      setIsAdding(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <BackgroundImage 
        src="/images/storage-bg.png" 
        alt="Simple storage interface"
        overlayIntensity="medium"
      >
        <div className="min-h-screen flex items-center justify-center p-4 pt-20">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Connect Wallet to Continue</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to use the storage system.</p>
            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              🔗 Connect Wallet
            </button>
          </div>
        </div>
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage 
      src="/images/storage-bg.png" 
      alt="Simple storage interface"
      overlayIntensity="light"
    >
      <div className="p-4 pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto py-8">
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Simple Blockchain Storage</h1>
            
            {/* Wallet Status */}
            {contractsReady && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Wallet Status</h3>
                <div className="text-sm text-blue-700">
                  FLOW: {parseFloat(balances.flow).toFixed(4)} | USDC: {parseFloat(balances.usdc).toFixed(2)}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Contract: {CONTRACT_ADDRESSES.SIMPLE_STORAGE}
                </div>
                {error && (
                  <p className="text-red-600 text-xs mt-2">⚠️ {error}</p>
                )}
              </div>
            )}

            {/* Existing Data Display */}
            {userData && (
              <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Your Stored Data</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Messages ({userData.messages.length}):</span>
                    <ul className="ml-4 mt-1">
                      {userData.messages.map((msg, index) => (
                        <li key={index} className="text-sm text-gray-700">• {msg}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">Token Amount:</span> {userData.tokenAmount} tokens
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(userData.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Store Multiple Messages */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Store Multiple Messages</h2>
                
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => updateMessage(index, e.target.value)}
                        placeholder={`Message ${index + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      {messages.length > 1 && (
                        <button
                          onClick={() => removeMessageField(index)}
                          className="px-3 py-3 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {messages.length < 5 && (
                    <button
                      onClick={addMessageField}
                      className="w-full border-2 border-dashed border-purple-300 text-purple-600 py-3 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                    >
                      + Add Message
                    </button>
                  )}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleStoreData}
                  disabled={!contractsReady || isStoring}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStoring ? 'Storing on Blockchain...' : 'Store Data'}
                </button>
              </div>

              {/* Add Single Message */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Add Single Message</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={singleMessage}
                    onChange={(e) => setSingleMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleAddMessage}
                  disabled={!contractsReady || isAdding || !singleMessage.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? 'Adding to Blockchain...' : 'Add Message'}
                </button>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Store multiple messages with optional token amount</li>
                    <li>• Add individual messages to your existing data</li>
                    <li>• All data is stored permanently on Flow blockchain</li>
                    <li>• Your wallet address is automatically linked to the data</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}