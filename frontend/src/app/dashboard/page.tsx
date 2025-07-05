'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useContracts } from '@/hooks/useContracts';
import BackgroundImage from '@/components/background-image';
import CrossChainHistory from '@/components/cross-chain-history';
// 移除未使用的导入

export default function DashboardPage() {
  // 使用useRouter hook
  const { authenticated, ready, logout, login } = usePrivy();
  const { 
    ready: contractsReady, 
    createPartnership, 
    getPartnerships, 
    balances, 
    loading, 
    error 
  } = useContracts();
  
  const [partnerships, setPartnerships] = useState<Array<{id: string; partner1: string; partner2: string; balance: string; goalCount: number; active: boolean}>>([]);
  const [newPartnerAddress, setNewPartnerAddress] = useState('');
  const [isCreatingPartnership, setIsCreatingPartnership] = useState(false);
  const [walletBalance] = useState(215.75); // Mock balance after contribution
  const [currentGoal] = useState({
    name: 'Trip to Bali',
    targetAmount: 2000,
    currentAmount: 215.75
  });

  const progressPercentage = (currentGoal.currentAmount / currentGoal.targetAmount) * 100;

  useEffect(() => {
    if (contractsReady) {
      loadPartnerships();
    }
  }, [contractsReady, loadPartnerships]);

  const loadPartnerships = useCallback(async () => {
    try {
      const userPartnerships = await getPartnerships();
      setPartnerships(userPartnerships);
    } catch (err) {
      console.error('Failed to load partnerships:', err);
    }
  }, [getPartnerships]);

  const handleCreatePartnership = async () => {
    if (!newPartnerAddress.trim()) {
      alert('Please enter a valid partner address');
      return;
    }

    if (!newPartnerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Please enter a valid Ethereum address (0x...)');
      return;
    }

    setIsCreatingPartnership(true);
    try {
      await createPartnership(newPartnerAddress);
      alert('✅ Partnership created successfully!');
      setNewPartnerAddress('');
      await loadPartnerships();
    } catch (error: unknown) {
      console.error('Failed to create partnership:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again';
      alert(`Failed to create partnership: ${errorMessage}`);
    } finally {
      setIsCreatingPartnership(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
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
        src="/images/dashboard-bg.png" 
        alt="Cannes elegance - Celebrating achievements"
        overlayIntensity="medium"
      >
        <div className="min-h-screen flex items-center justify-center p-4 pt-20">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Connect Wallet to Continue</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to access your dashboard and track progress.</p>
            <div className="space-y-3">
              <button
                onClick={login}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                🔗 Connect Wallet
              </button>
              <button
                onClick={() => () => window.location.href =('/')}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </BackgroundImage>
    );
  }

  return (
    <BackgroundImage 
      src="/images/dashboard-bg.png" 
      alt="Cannes elegance - Celebrating achievements"
      overlayIntensity="medium"
    >
      <div className="p-4 pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Partnership Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Wallet Status */}
          {contractsReady && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-purple-800">Blockchain Wallet</h3>
                  <div className="text-sm text-purple-700">
                    FLOW: {parseFloat(balances.flow).toFixed(4)} | USDC: {parseFloat(balances.usdc).toFixed(2)}
                  </div>
                </div>
                <div className="text-xs text-purple-600">
                  {partnerships.length} Partnership{partnerships.length !== 1 ? 's' : ''}
                </div>
              </div>
              {error && (
                <p className="text-red-600 text-xs mt-2">⚠️ {error}</p>
              )}
            </div>
          )}

          {/* Create Partnership Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Partnership</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Partner&apos;s Wallet Address
                </label>
                <input
                  type="text"
                  value={newPartnerAddress}
                  onChange={(e) => setNewPartnerAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your partner&apos;s Ethereum wallet address to create a shared partnership for recording gratitude and achieving goals together.
                </p>
              </div>
              <button
                onClick={handleCreatePartnership}
                disabled={!contractsReady || isCreatingPartnership || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingPartnership ? 'Creating Partnership...' : 'Create Partnership'}
              </button>
            </div>
          </div>

          {/* Existing Partnerships */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Partnerships</h3>
            {partnerships.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">No partnerships yet.</p>
                <p className="text-sm text-gray-400">Create your first partnership above to start recording gratitude together!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {partnerships.map((partnership) => (
                  <div 
                    key={partnership.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">Partnership #{partnership.id}</h4>
                        <p className="text-sm text-gray-600">
                          {partnership.partner1.slice(0, 6)}...{partnership.partner1.slice(-4)} & {partnership.partner2.slice(0, 6)}...{partnership.partner2.slice(-4)}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          {partnership.goalCount.toString()} goals • Active: {partnership.active ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">
                          Balance: {(Number(partnership.balance) / 1e18).toFixed(4)} FLOW
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Current Balance</h2>
              <p className="text-4xl font-bold text-gray-800">${walletBalance.toFixed(2)}</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Goal Progress</h2>
              <p className="text-2xl font-bold text-gray-800">
                {progressPercentage.toFixed(1)}% Complete
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{currentGoal.name}</h2>
              <span className="text-lg text-gray-600">
                ${currentGoal.currentAmount.toFixed(2)} / ${currentGoal.targetAmount.toFixed(2)}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              ${(currentGoal.targetAmount - currentGoal.currentAmount).toFixed(2)} remaining to reach your goal
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => window.location.href = '/gratitude'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              disabled={partnerships.length === 0}
            >
              Record Gratitude
            </button>
            
            <button
              onClick={() => window.location.href = '/wallet'}
              className="w-full border-2 border-purple-600 text-purple-600 py-4 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300"
            >
              Manage Wallet
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full border-2 border-gray-300 text-gray-600 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
          
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 本地活动 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Activity</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Gratitude contribution</span>
                  <span>+$15.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Wallet contribution</span>
                  <span>+$50.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous balance</span>
                  <span>$150.75</span>
                </div>
              </div>
            </div>

            {/* 跨链历史 */}
            <div className="lg:col-span-1">
              <CrossChainHistory />
            </div>
          </div>
        </div>
        </div>
      </div>
    </BackgroundImage>
  );
}