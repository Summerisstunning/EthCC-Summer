'use client';

// 移除未使用的导入
import { usePrivy } from '@privy-io/react-auth';
import { useContracts } from '@/hooks/useContracts';
import BackgroundImage from '@/components/background-image';

export default function Home() {
  // 移除未使用的router变量
  const { login, authenticated, ready } = usePrivy();
  const { ready: contractsReady, balances, error } = useContracts();

  const handleStartRecording = () => {
    console.log('🎯 Start Recording clicked, authenticated:', authenticated);
    
    if (authenticated) {
      console.log('✅ User authenticated, navigating to /gratitude');
      // Use window.location for reliable navigation
      window.location.href = '/gratitude';
    } else {
      console.log('🔐 User not authenticated, showing login');
      login();
    }
  };

  const handleJoinWaitlist = () => {
    // 可以集成邮件列表或其他功能
    alert('感谢您的兴趣！我们会尽快联系您。');
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <BackgroundImage 
      src="/images/hero-bg.png" 
      alt="Bali - Dream destination background"
      overlayIntensity="light"
    >
      <div className="flex items-center justify-center p-4 pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Record Your Love.
            <br />
            Share Gratitude.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Onchain.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A shared emotional ledger and wallet — to record love, grow gratitude, and fulfill dreams, onchain.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStartRecording}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
          >
            Start Recording Gratitude
          </button>
          <button 
            onClick={() => window.location.href = '/quick-partnership'}
            className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-600 hover:text-white transition-all duration-300"
          >
            Create Partnership
          </button>
        </div>
        
        {/* Additional Options */}
        <div className="mt-6 flex justify-center gap-4">
          <button 
            onClick={() => window.location.href = '/test-storage'}
            className="text-purple-600 hover:text-purple-800 underline text-sm"
          >
            Test Storage
          </button>
          <button 
            onClick={handleJoinWaitlist}
            className="text-purple-600 hover:text-purple-800 underline text-sm"
          >
            Join Waitlist
          </button>
        </div>
        
        {authenticated && contractsReady && (
          <div className="mt-8 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Wallet Status</h3>
            <div className="flex justify-center gap-6 text-sm">
              <div>
                <span className="text-gray-600">FLOW:</span>{' '}
                <span className="font-semibold text-purple-700">{parseFloat(balances.flow).toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-600">USDC:</span>{' '}
                <span className="font-semibold text-green-700">{parseFloat(balances.usdc).toFixed(2)}</span>
              </div>
            </div>
            {error && (
              <p className="text-red-600 text-xs mt-2">⚠️ {error}</p>
            )}
          </div>
        )}
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Built with Flow, Privy, and Avail Nexus</p>
        </div>
        </div>
      </div>
    </BackgroundImage>
  );
}
