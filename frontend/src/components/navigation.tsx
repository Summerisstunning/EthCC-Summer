'use client';

import { useRouter, usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, logout, login } = usePrivy();

  const navigationItems = [
    { 
      path: '/', 
      label: 'Home',
      icon: '🏡',
      description: 'Bali Dreams'
    },
    { 
      path: '/gratitude', 
      label: 'Gratitude',
      icon: '💝',
      description: 'Express Love'
    },
    { 
      path: '/wallet', 
      label: 'Wallet',
      icon: '💰',
      description: 'Shared Journey'
    },
    { 
      path: '/dashboard', 
      label: 'Dashboard',
      icon: '📊',
      description: 'Celebrate Together'
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 px-6 py-3">
        <div className="flex items-center space-x-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  group relative px-4 py-2 rounded-full transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                  }
                `}
                title={item.description}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {item.description}
                </div>
              </button>
            );
          })}
          
          {/* 分隔线和用户操作 */}
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {!authenticated ? (
            <button
              onClick={login}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              title="Connect Wallet"
            >
              🔗 Connect
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-gray-600 hover:text-red-600 transition-colors duration-200 text-sm"
              title="Logout"
            >
              🚪 Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}