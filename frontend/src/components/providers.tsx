'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // 延迟挂载以确保扩展清理完成
    const timer = setTimeout(() => {
      console.log('🔄 Mounting Privy Provider...');
      setMounted(true);
    }, 500); // 给扩展清理更多时间

    return () => clearTimeout(timer);
  }, []);

  // 如果挂载失败，提供重试机制
  const handleRetry = () => {
    console.log(`🔄 Retrying Privy mount (attempt ${retryCount + 1})`);
    setMounted(false);
    setRetryCount(prev => prev + 1);
    
    setTimeout(() => {
      setMounted(true);
    }, 1000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 text-center max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Loading AA Sharing
          </h2>
          <p className="text-gray-600 mb-4">
            Initializing secure wallet connection...
          </p>
          {retryCount > 0 && (
            <button
              onClick={handleRetry}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry ({retryCount})
            </button>
          )}
        </div>
      </div>
    );
  }

  try {
    return (
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmcpxoxlb0131l20n42brnl2b'}
        config={{
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          appearance: {
            theme: 'light',
            accentColor: '#9333ea',
          },
          // 简化配置，移除可能有问题的链配置
          loginMethods: ['email', 'wallet'],
          // 添加错误处理
          onError: (error) => {
            console.error('Privy error:', error);
            if (retryCount < 3) {
              handleRetry();
            }
          }
        }}
      >
        {children}
      </PrivyProvider>
    );
  } catch (error) {
    console.error('Failed to mount Privy Provider:', error);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-400 via-pink-500 to-purple-500">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            ⚠️ Wallet Connection Error
          </h2>
          <p className="text-gray-600 mb-4">
            Browser extension conflict detected. Please disable conflicting extensions and refresh.
          </p>
          <div className="space-y-2">
            <button
              onClick={handleRetry}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry Connection
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}