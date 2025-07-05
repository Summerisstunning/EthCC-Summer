'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { PrivyErrorHandler } from './privy-error-handler';

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
        },
        loginMethods: ['email', 'wallet'],
        supportedChains: [
          {
            id: 747,
            name: 'Flow Mainnet',
            nativeCurrency: {
              name: 'Flow',
              symbol: 'FLOW',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: ['https://mainnet.evm.nodes.onflow.org'],
              },
            },
            blockExplorers: {
              default: {
                name: 'FlowScan',
                url: 'https://flowscan.org',
              },
            },
          },
        ]
      }}
    >
      <PrivyErrorHandler />
      {children}
    </PrivyProvider>
  );
}