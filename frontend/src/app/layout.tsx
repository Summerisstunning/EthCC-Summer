import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/error-boundary";
import ClientWrapper from "@/components/client-wrapper";
import Script from "next/script";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="extension-cleanup"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              console.log('🧹 Extension blocking script starting...');
              
              // 1. 阻止扩展通信 - 修复 "Could not establish connection" 错误
              const blockExtensionCommunication = () => {
                // 阻止chrome.runtime API调用
                if (window.chrome && window.chrome.runtime) {
                  const originalConnect = window.chrome.runtime.connect;
                  const originalSendMessage = window.chrome.runtime.sendMessage;
                  
                  window.chrome.runtime.connect = function() {
                    console.log('🚫 Blocked chrome.runtime.connect');
                    throw new Error('Extension communication blocked');
                  };
                  
                  window.chrome.runtime.sendMessage = function() {
                    console.log('🚫 Blocked chrome.runtime.sendMessage');
                    return Promise.reject(new Error('Extension communication blocked'));
                  };
                }
                
                // 阻止扩展注入的全局变量
                const problematicExtensions = [
                  'evmAsk', 'okxwallet', 'coin98', 'trustwallet',
                  'rabby', 'coinbaseWalletExtension', 'metaMask'
                ];
                
                problematicExtensions.forEach(ext => {
                  if (window[ext]) {
                    try {
                      delete window[ext];
                      console.log('🗑️ Removed ' + ext);
                    } catch (e) {
                      window[ext] = undefined;
                    }
                  }
                });
              };
              
              // 2. 清理body属性
              const cleanBodyAttributes = () => {
                const body = document.body;
                if (body) {
                  const extensionAttrs = [
                    'data-channel-name',
                    'data-extension-id', 
                    'data-grammarly-shadow-root',
                    'data-new-gr-c-s-check-loaded',
                    'data-gr-ext-installed'
                  ];
                  
                  extensionAttrs.forEach(attr => {
                    if (body.hasAttribute(attr)) {
                      console.log('🧹 Removed ' + attr);
                      body.removeAttribute(attr);
                    }
                  });
                }
              };
              
              // 3. 保护ethereum对象
              if (window.ethereum) {
                window._originalEthereum = window.ethereum;
                console.log('💰 Saved original ethereum object');
              }
              
              // 4. 执行清理
              blockExtensionCommunication();
              cleanBodyAttributes();
              
              // 5. DOM变化监听
              const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                  if (mutation.type === 'attributes' && mutation.target === document.body) {
                    const attr = mutation.attributeName;
                    if (attr && (attr.includes('data-channel') || attr.includes('data-extension'))) {
                      mutation.target.removeAttribute(attr);
                    }
                  }
                });
              });
              
              observer.observe(document.body, { attributes: true });
            `
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
