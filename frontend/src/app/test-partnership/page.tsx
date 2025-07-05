'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useContracts } from '@/hooks/useContracts';
import BackgroundImage from '@/components/background-image';

export default function TestPartnershipPage() {
  const { authenticated, ready, login } = usePrivy();
  const { createPartnership, ready: contractsReady, balances, loading, error } = useContracts();
  
  const [partnerAddress, setPartnerAddress] = useState('0x0000000000000000000000000000000000000001');
  const [nickname1, setNickname1] = useState('Test User 1');
  const [nickname2, setNickname2] = useState('Test User 2');
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCreatePartnership = async () => {
    if (!partnerAddress.trim()) {
      setResult('❌ Please enter a partner address');
      return;
    }

    setIsCreating(true);
    setResult(null);
    
    try {
      console.log('🚀 Creating partnership with:', { partnerAddress, nickname1, nickname2 });
      
      const receipt = await createPartnership(partnerAddress, nickname1, nickname2);
      console.log('✅ Partnership created successfully:', receipt);
      
      setResult(`✅ Partnership created successfully! Transaction: ${receipt.hash}`);
      
    } catch (error: unknown) {
      console.error('❌ Failed to create partnership:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResult(`❌ Failed: ${errorMessage}`);
    } finally {
      setIsCreating(false);
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
        src="/images/partnership-bg.png" 
        alt="Test partnership background"
        overlayIntensity="medium"
      >
        <div className="min-h-screen flex items-center justify-center p-4 pt-20">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Connect Wallet</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to test partnership creation.</p>
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
      alt="Test partnership background"
      overlayIntensity="light"
    >
      <div className="p-4 pt-20 min-h-screen">
        <div className="max-w-2xl mx-auto py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Test Partnership Creation</h1>
            <p className="text-gray-600 mb-8">Test the createPartnership function with debug information.</p>
            
            {/* Debug Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Debug Info</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div>Ready: {ready ? '✅' : '❌'}</div>
                <div>Authenticated: {authenticated ? '✅' : '❌'}</div>
                <div>Contracts Ready: {contractsReady ? '✅' : '❌'}</div>
                <div>Loading: {loading ? '✅' : '❌'}</div>
                <div>Error: {error || 'None'}</div>
                <div>FLOW Balance: {balances.flow}</div>
                <div>USDC Balance: {balances.usdc}</div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner Address
                </label>
                <input
                  type="text"
                  value={partnerAddress}
                  onChange={(e) => setPartnerAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nickname 1 (You)
                </label>
                <input
                  type="text"
                  value={nickname1}
                  onChange={(e) => setNickname1(e.target.value)}
                  placeholder="Your nickname"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nickname 2 (Partner)
                </label>
                <input
                  type="text"
                  value={nickname2}
                  onChange={(e) => setNickname2(e.target.value)}
                  placeholder="Partner's nickname"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Test Button */}
            <button
              onClick={handleCreatePartnership}
              disabled={!contractsReady || isCreating || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isCreating ? '🔄 Creating Partnership...' : '🚀 Test Create Partnership'}
            </button>

            {/* Result */}
            {result && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-2">Result:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result}</pre>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => window.location.href = '/quick-partnership'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Quick Partnership
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundImage>
  );
}