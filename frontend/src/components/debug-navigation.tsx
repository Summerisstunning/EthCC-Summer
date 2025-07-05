'use client';

import { useRouter, usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function DebugNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, login, logout, ready } = usePrivy();

  const handleNavClick = (path: string) => {
    console.log('Navigation clicked:', path);
    try {
      router.push(path);
      console.log('Router.push executed for:', path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleLogin = () => {
    console.log('Login clicked');
    try {
      login();
      console.log('Login function executed');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  console.log('Navigation component state:', {
    pathname,
    authenticated,
    ready
  });

  return (
    <div className="fixed top-16 right-4 bg-white p-4 rounded-lg shadow-lg z-50 text-sm">
      <h3 className="font-bold mb-2">Debug Navigation</h3>
      <p>Current: {pathname}</p>
      <p>Auth: {authenticated ? 'Yes' : 'No'}</p>
      <p>Ready: {ready ? 'Yes' : 'No'}</p>
      
      <div className="mt-2 space-y-1">
        <button
          onClick={() => handleNavClick('/')}
          className="block w-full text-left p-1 hover:bg-gray-100"
        >
          → Home
        </button>
        <button
          onClick={() => handleNavClick('/gratitude')}
          className="block w-full text-left p-1 hover:bg-gray-100"
        >
          → Gratitude
        </button>
        <button
          onClick={() => handleNavClick('/wallet')}
          className="block w-full text-left p-1 hover:bg-gray-100"
        >
          → Wallet
        </button>
        <button
          onClick={() => handleNavClick('/dashboard')}
          className="block w-full text-left p-1 hover:bg-gray-100"
        >
          → Dashboard
        </button>
        
        {!authenticated && (
          <button
            onClick={handleLogin}
            className="block w-full text-left p-1 bg-purple-100 hover:bg-purple-200"
          >
            🔗 Login
          </button>
        )}
      </div>
    </div>
  );
}