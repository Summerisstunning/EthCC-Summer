'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function WalletPage() {
  const router = useRouter();
  const { authenticated } = usePrivy();
  const [contributionAmount, setContributionAmount] = useState(0);
  const [walletBalance] = useState(150.75); // Mock balance
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmContribution = async () => {
    if (contributionAmount <= 0) return;
    
    setIsLoading(true);
    
    // Mock transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    router.push('/dashboard');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to continue</h2>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Shared Wallet Contribution</h1>
          <p className="text-gray-600 mb-8">Add an amount to the shared wallet.</p>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-8">
            <div className="text-center">
              <p className="text-gray-700 mb-2">Current Wallet Balance</p>
              <p className="text-4xl font-bold text-gray-800">${walletBalance.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contribution Amount (USD)
              </label>
              <input
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount..."
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Balance After Contribution:</span>
                <span className="text-xl font-bold text-gray-800">
                  ${(walletBalance + contributionAmount).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 25, 50].map(amount => (
                <button
                  key={amount}
                  onClick={() => setContributionAmount(amount)}
                  className="py-2 px-4 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => router.push('/gratitude')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirmContribution}
              disabled={contributionAmount <= 0 || isLoading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Confirm Contribution'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}