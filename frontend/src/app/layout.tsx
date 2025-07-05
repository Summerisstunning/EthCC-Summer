import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import Navigation from "@/components/navigation";
import ImageShowcase from "@/components/image-showcase";
import ErrorBoundary from "@/components/error-boundary";
import ExtensionDetector from "@/components/extension-detector";

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
        <ErrorBoundary>
          <Providers>
            <Navigation />
            <ImageShowcase />
            <ExtensionDetector />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
