import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrivyProvider } from '@privy-io/react-auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "AA Sharing - Record Your Love. Share Gratitude. Onchain.",
  description: "A shared emotional ledger and wallet — to record love, grow gratitude, and fulfill dreams, onchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
          config={{
            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
