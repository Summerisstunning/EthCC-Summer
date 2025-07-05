'use client';

import { useState, useEffect } from 'react';
import { nexus, type TransactionStatus } from '@/lib/avail-nexus';

export default function CrossChainHistory() {
  const [transactions, setTransactions] = useState<TransactionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactionHistory();
  }, []);

  const loadTransactionHistory = async () => {
    try {
      const history = await nexus.getTransactionHistory();
      setTransactions(history);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔄 Cross-Chain History</h3>
        <div className="text-center text-gray-500 py-8">
          Loading transaction history...
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔄 Cross-Chain History</h3>
        <div className="text-center text-gray-500 py-8">
          <p className="mb-2">No cross-chain transactions yet</p>
          <p className="text-sm">Your cross-chain transfers will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔄 Cross-Chain History</h3>
        <button
          onClick={loadTransactionHistory}
          className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.txHash}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getStatusIcon(tx.status)}</span>
                <span className="font-medium text-gray-800">
                  {tx.amount} {tx.token}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatTime(tx.timestamp)}
              </span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {tx.sourceChain}
                </span>
                <span>→</span>
                <span className="capitalize bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  {tx.destinationChain}
                </span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {tx.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>TX: {formatTxHash(tx.txHash)}</span>
              {tx.confirmations && (
                <span>{tx.confirmations} confirmations</span>
              )}
            </div>

            {tx.status === 'pending' && tx.estimatedCompletionTime && (
              <div className="mt-2 text-xs text-blue-600">
                <span>Estimated completion: {formatTime(tx.estimatedCompletionTime)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Cross-chain transactions powered by{' '}
          <span className="font-medium text-purple-600">Avail Nexus</span>
        </p>
      </div>
    </div>
  );
}