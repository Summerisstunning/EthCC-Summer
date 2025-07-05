'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import BackgroundImage from '@/components/background-image';
import { MockAPI } from '@/lib/mock-api';

export default function DashboardPage() {
  const router = useRouter();
  const { authenticated, ready, logout } = usePrivy();
  const [walletBalance] = useState(215.75); // Mock balance after contribution
  const [currentGoal] = useState({
    name: 'Trip to Bali',
    targetAmount: 2000,
    currentAmount: 215.75
  });

  const progressPercentage = (currentGoal.currentAmount / currentGoal.targetAmount) * 100;

  const handleLogout = () => {
    logout();
    router.push('/');
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">请先登录以继续</h2>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <BackgroundImage src="/images/dashboard-bg.jpg" alt="Dashboard background">
      <div className="p-4 min-h-screen">
        <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Shared Wallet Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/gratitude')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Add More Gratitude
            </button>
            
            <button
              onClick={() => router.push('/wallet')}
              className="w-full border-2 border-purple-600 text-purple-600 py-4 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300"
            >
              Make Contribution
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
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
        </div>
        </div>
      </div>
    </BackgroundImage>
  );
}