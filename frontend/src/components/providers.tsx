'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

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
        defaultChain: {
          id: 1,
          name: 'Ethereum',
          network: 'mainnet',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: { default: { http: ['https://eth-mainnet.g.alchemy.com/v2/demo'] } },
        },
        supportedChains: [
          {
            id: 1,
            name: 'Ethereum',
            network: 'mainnet',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://eth-mainnet.g.alchemy.com/v2/demo'] } },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}