'use client';

import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function Home() {
  const router = useRouter();
  const { login, authenticated } = usePrivy();

  const handleStartRecording = () => {
    if (authenticated) {
      router.push('/gratitude');
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
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
          <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-600 hover:text-white transition-all duration-300">
            Join the Waitlist
          </button>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Built with Flow, Privy, and Avail Nexus</p>
        </div>
      </div>
    </div>
  );
}
