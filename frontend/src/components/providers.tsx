'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
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
          logo: 'https://your-logo-url.com/logo.png',
        },
        supportedChains: [
          {
            id: 1,
            name: 'Ethereum',
            network: 'mainnet',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: { default: { http: ['https://mainnet.infura.io/v3/'] } },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}