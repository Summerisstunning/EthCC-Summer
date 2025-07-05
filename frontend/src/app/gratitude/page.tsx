'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import UserInfo from '@/components/user-info';

interface GratitudeItem {
  content: string;
  amount: number;
}

export default function GratitudePage() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const [gratitudeItems, setGratitudeItems] = useState<GratitudeItem[]>([
    { content: '', amount: 0 }
  ]);

  const addGratitudeItem = () => {
    if (gratitudeItems.length < 3) {
      setGratitudeItems([...gratitudeItems, { content: '', amount: 0 }]);
    }
  };

  const removeGratitudeItem = (index: number) => {
    if (gratitudeItems.length > 1) {
      setGratitudeItems(gratitudeItems.filter((_, i) => i !== index));
    }
  };

  const updateGratitudeItem = (index: number, field: 'content' | 'amount', value: string | number) => {
    const updated = [...gratitudeItems];
    updated[index][field] = value as never;
    setGratitudeItems(updated);
  };

  const handleNext = () => {
    const validItems = gratitudeItems.filter(item => item.content.trim() !== '');
    if (validItems.length > 0) {
      router.push('/wallet');
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <UserInfo />
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Log your gratitude for today</h1>
          <p className="text-gray-600 mb-8">Record up to 3 things you're grateful for today.</p>
          
          <div className="space-y-6">
            {gratitudeItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Gratitude {index + 1}
                  </h3>
                  {gratitudeItems.length > 1 && (
                    <button
                      onClick={() => removeGratitudeItem(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What are you grateful for?
                    </label>
                    <textarea
                      value={item.content}
                      onChange={(e) => updateGratitudeItem(index, 'content', e.target.value)}
                      placeholder="I'm grateful for..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Optional donation amount (USD)
                    </label>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateGratitudeItem(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {gratitudeItems.length < 3 && (
              <button
                onClick={addGratitudeItem}
                className="w-full border-2 border-dashed border-purple-300 text-purple-600 py-4 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                + Add another gratitude item
              </button>
            )}
          </div>
          
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={gratitudeItems.filter(item => item.content.trim() !== '').length === 0}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}