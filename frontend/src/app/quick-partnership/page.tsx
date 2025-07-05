'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useContracts } from '@/hooks/useContracts';
import BackgroundImage from '@/components/background-image';

export default function QuickPartnershipPage() {
  const { authenticated, ready, login } = usePrivy();
  const { createPartnership, ready: contractsReady, balances, loading, error } = useContracts();
  
  const [partnerAddress, setPartnerAddress] = useState('');
  const [nickname1, setNickname1] = useState('Me');
  const [nickname2, setNickname2] = useState('My Partner');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePartnership = async () => {
    if (!partnerAddress.trim()) {
      alert('Please enter a partner address');
      return;
    }

    // 简单验证地址格式
    if (!partnerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Please enter a valid Ethereum address (0x...)');
      return;
    }

    setIsCreating(true);
    try {
      await createPartnership(partnerAddress, nickname1, nickname2);
      alert('✅ Partnership created successfully! You can now record gratitude.');
      window.location.href = '/gratitude';
    } catch (error: any) {
      console.error('Failed to create partnership:', error);
      alert(`Failed to create partnership: ${error.message || 'Please try again'}`);
    } finally {
      setIsCreating(false);
    }
  };

  // 一些常用的测试地址供快速选择
  const testAddresses = [
    {
      name: 'Test Partner 1',
      address: '0x0000000000000000000000000000000000000001'
    },
    {
      name: 'Test Partner 2', 
      address: '0x0000000000000000000000000000000000000002'
    },
    {
      name: 'Vitalik (for demo)',
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    }
  ];

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
        src="/images/partnership-bg.png" 
        alt="Create partnership background"
        overlayIntensity="medium"
      >
        <div className="min-h-screen flex items-center justify-center p-4 pt-20">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Connect Wallet</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to create a partnership.</p>
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
      src="/images/partnership-bg.png" 
      alt="Create partnership background"
      overlayIntensity="light"
    >
      <div className="p-4 pt-20 min-h-screen">
        <div className="max-w-2xl mx-auto py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Partnership</h1>
            <p className="text-gray-600 mb-8">Create a partnership to start recording gratitude together on the blockchain.</p>
            
            {/* Wallet Status */}
            {contractsReady && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">Wallet Status</h3>
                <div className="text-sm text-purple-700">
                  FLOW: {parseFloat(balances.flow).toFixed(4)} | USDC: {parseFloat(balances.usdc).toFixed(2)}
                </div>
                {error && (
                  <p className="text-red-600 text-xs mt-2">⚠️ {error}</p>
                )}
              </div>
            )}

            {/* Quick Select Addresses */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Select (for testing)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {testAddresses.map((addr) => (
                  <button
                    key={addr.address}
                    onClick={() => setPartnerAddress(addr.address)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="font-medium text-sm">{addr.name}</div>
                    <div className="text-xs text-gray-500">{addr.address.slice(0, 10)}...</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Input */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner's Wallet Address
                </label>
                <input
                  type="text"
                  value={partnerAddress}
                  onChange={(e) => setPartnerAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your partner's Ethereum wallet address. This creates a shared partnership for recording gratitude together.
                </p>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreatePartnership}
              disabled={!contractsReady || isCreating || loading || !partnerAddress.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isCreating ? 'Creating Partnership...' : 'Create Partnership'}
            </button>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your partnership will be recorded on Flow blockchain</li>
                <li>• Both you and your partner can record gratitude</li>
                <li>• Gratitude entries are stored permanently on-chain</li>
                <li>• You can optionally include FLOW tokens with each entry</li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dashboard
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