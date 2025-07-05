'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function UserInfo() {
  const { user, authenticated } = usePrivy();

  if (!authenticated || !user) return null;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
          {user.email?.address ? user.email.address[0].toUpperCase() : 'U'}
        </div>
        <div>
          <p className="text-gray-800 font-medium">
            {user.email?.address || 'Anonymous User'}
          </p>
          <p className="text-gray-600 text-sm">
            Wallet: {user.wallet?.address?.slice(0, 6)}...{user.wallet?.address?.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
}