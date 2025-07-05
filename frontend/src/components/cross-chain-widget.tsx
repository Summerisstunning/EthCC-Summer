'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { nexus, SUPPORTED_CHAINS, SUPPORTED_TOKENS, type CrossChainTransaction, type UnifiedBalance, type TransactionStatus } from '@/lib/avail-nexus';

interface CrossChainWidgetProps {
  className?: string;
  onSuccess?: (txStatus: TransactionStatus) => void;
}

export default function CrossChainWidget({ className = '', onSuccess }: CrossChainWidgetProps) {
  const { user, authenticated } = usePrivy();
  const [isConnected, setIsConnected] = useState(false);
  const [unifiedBalances, setUnifiedBalances] = useState<UnifiedBalance[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [sourceChain, setSourceChain] = useState<string>('ethereum');
  const [destinationChain, setDestinationChain] = useState<string>('arbitrum');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [showBalances, setShowBalances] = useState(false);

  // 加载统一余额
  const loadUnifiedBalances = useCallback(async () => {
    try {
      const balances = await nexus.getAllUnifiedBalances();
      setUnifiedBalances(balances);
    } catch (err) {
      console.error('Failed to load balances:', err);
    }
  }, []);

  // 定义连接到 Avail Nexus 的函数
  const connectToNexus = useCallback(async () => {
    if (!user?.wallet?.address) return;
    
    try {
      await nexus.connect(user.wallet.address);
      setIsConnected(true);
      loadUnifiedBalances();
    } catch (err) {
      console.error('Failed to connect to Nexus:', err);
      setError('Failed to connect to cross-chain service');
    }
  }, [user, loadUnifiedBalances]);
  
  // 连接到 Avail Nexus
  useEffect(() => {
    if (authenticated && user?.wallet?.address && !isConnected) {
      connectToNexus();
    }
  }, [authenticated, user, isConnected, connectToNexus]);

  const handleCrossChainTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (sourceChain === destinationChain) {
      setError('Source and destination chains must be different');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transaction: CrossChainTransaction = {
        sourceChain: sourceChain as keyof typeof SUPPORTED_CHAINS,
        destinationChain: destinationChain as keyof typeof SUPPORTED_CHAINS,
        token: selectedToken as keyof typeof SUPPORTED_TOKENS,
        amount: parseFloat(amount),
        callData: {
          to: '0x742d35Cc6371C0532e3a36bA2ba08e99A6FFEBAf', // AA Sharing contract
          data: '0x' // Encode gratitude data here
        }
      };

      const status = await nexus.bridgeAndExecute(transaction);
      setTxStatus(status);
      setAmount('');
      
      // 刷新余额
      setTimeout(() => {
        loadUnifiedBalances();
      }, 1000);

      onSuccess?.(status);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Cross-chain transfer failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenBalance = (token: string, chain: string): number => {
    const balance = unifiedBalances.find(b => b.token === token);
    return balance?.balancesByChain[chain] || 0;
  };

  const getTotalBalance = (token: string): number => {
    const balance = unifiedBalances.find(b => b.token === token);
    return balance?.totalBalance || 0;
  };

  if (!authenticated) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="text-center text-gray-600">
          <p className="mb-2">🌐 Cross-Chain Features</p>
          <p className="text-sm">Please log in to access cross-chain functionality</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🌐 Cross-Chain Transfer
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* 统一余额展示 */}
      <div className="mb-6">
        <button
          onClick={() => setShowBalances(!showBalances)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium text-gray-700">Unified Balances</span>
          <span className="text-gray-400">{showBalances ? '▼' : '▶'}</span>
        </button>
        
        {showBalances && (
          <div className="mt-3 space-y-2">
            {unifiedBalances.map((balance) => (
              <div key={balance.token} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{balance.token}</span>
                  <span className="text-lg font-bold">
                    {balance.totalBalance.toFixed(4)}
                    {balance.usdValue && (
                      <span className="text-sm text-gray-500 ml-2">
                        ≈ ${balance.usdValue.toFixed(2)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  {Object.entries(balance.balancesByChain).map(([chain, amount]) => (
                    <div key={chain} className="flex justify-between">
                      <span className="capitalize">{chain}:</span>
                      <span>{amount.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 跨链转账表单 */}
      <div className="space-y-4">
        {/* 代币选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {Object.keys(SUPPORTED_TOKENS).map(token => (
              <option key={token} value={token}>
                {token} (Total: {getTotalBalance(token).toFixed(4)})
              </option>
            ))}
          </select>
        </div>

        {/* 源链选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Chain</label>
          <select
            value={sourceChain}
            onChange={(e) => setSourceChain(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => (
              <option key={key} value={key}>
                {chain.name} (Balance: {getTokenBalance(selectedToken, key).toFixed(4)})
              </option>
            ))}
          </select>
        </div>

        {/* 目标链选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Chain</label>
          <select
            value={destinationChain}
            onChange={(e) => setDestinationChain(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {Object.entries(SUPPORTED_CHAINS)
              .filter(([key]) => key !== sourceChain)
              .map(([key, chain]) => (
                <option key={key} value={key}>
                  {chain.name}
                </option>
              ))}
          </select>
        </div>

        {/* 数量输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full p-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-3 text-gray-500 text-sm">
              {selectedToken}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Available: {getTokenBalance(selectedToken, sourceChain).toFixed(4)} {selectedToken}
          </p>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 交易状态 */}
        {txStatus && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-blue-800">Transaction Status</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                txStatus.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                txStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {txStatus.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-blue-700">
              {txStatus.amount} {txStatus.token} from {txStatus.sourceChain} to {txStatus.destinationChain}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              TX: {txStatus.txHash.slice(0, 10)}...{txStatus.txHash.slice(-8)}
            </p>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          onClick={handleCrossChainTransfer}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing Cross-Chain Transfer...' : 'Transfer Across Chains'}
        </button>
      </div>

      {/* Powered by Avail Nexus */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Powered by <span className="font-medium text-purple-600">Avail Nexus</span> - 
          Seamless cross-chain liquidity
        </p>
      </div>
    </div>
  );
}