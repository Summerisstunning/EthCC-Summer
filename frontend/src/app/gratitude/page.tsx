'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import UserInfo from '@/components/user-info';
import BackgroundImage from '@/components/background-image';
import { MockAPI } from '@/lib/mock-api';

interface GratitudeItem {
  content: string;
  amount: number;
}

export default function GratitudePage() {
  const router = useRouter();
  const { authenticated, ready, user, login } = usePrivy();
  const [gratitudeItems, setGratitudeItems] = useState<GratitudeItem[]>([
    { content: '', amount: 0 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleNext = async () => {
    const validItems = gratitudeItems.filter(item => item.content.trim() !== '');
    if (validItems.length === 0) return;

    setIsSubmitting(true);
    
    try {
      // 保存每个感恩条目到模拟API
      for (const item of validItems) {
        await MockAPI.createGratitude({
          userId: user?.id || 'anonymous',
          content: item.content,
          amount: item.amount,
        });
      }
      
      router.push('/wallet');
    } catch (error) {
      console.error('Failed to save gratitude entries:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
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
        src="/images/gratitude-bg.png" 
        alt="Bali beauty - Gratitude inspiration"
        overlayIntensity="medium"
      >
        <div className="min-h-screen flex items-center justify-center p-4 pt-20">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔐 Connect Wallet to Continue</h2>
            <p className="text-gray-600 mb-6">Please connect your wallet to record your daily gratitude.</p>
            <div className="space-y-3">
              <button
                onClick={login}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                🔗 Connect Wallet
              </button>
              <button
                onClick={() => router.push('/')}
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
      src="/images/gratitude-bg.png" 
      alt="Bali beauty - Gratitude inspiration"
      overlayIntensity="medium"
    >
      <div className="p-4 pt-20 min-h-screen">
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
              disabled={gratitudeItems.filter(item => item.content.trim() !== '').length === 0 || isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </BackgroundImage>
  );
}