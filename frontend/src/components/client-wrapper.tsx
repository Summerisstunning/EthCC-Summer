'use client';

import { useEffect } from 'react';
import Providers from '@/components/providers';
import Navigation from '@/components/navigation';
import ImageShowcase from '@/components/image-showcase';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // 客户端清理扩展污染
    const cleanupExtensions = () => {
      console.log('🧹 Client cleanup starting...');
      
      const body = document.body;
      if (!body) return;
      
      const extensionAttrs = [
        'data-channel-name',
        'data-extension-id',
        'data-grammarly-shadow-root',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed'
      ];
      
      extensionAttrs.forEach(attr => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
          console.log(`🧹 Removed ${attr}`);
        }
      });

      // 恢复ethereum对象
      interface WindowWithEthereum extends Window {
        _originalEthereum?: typeof window.ethereum;
        ethereum?: typeof window.ethereum;
      }
      const win = window as WindowWithEthereum;
      if (win._originalEthereum && !win.ethereum) {
        win.ethereum = win._originalEthereum;
        console.log('✅ Restored ethereum object');
      }
    };

    // 处理扩展连接错误
    const handleExtensionErrors = () => {
      // 捕获全局Promise rejection
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        if (event.reason?.message?.includes('Could not establish connection')) {
          console.log('🚫 Blocked extension connection error');
          event.preventDefault(); // 阻止错误显示
        }
        if (event.reason?.message?.includes('Receiving end does not exist')) {
          console.log('🚫 Blocked extension receiver error');
          event.preventDefault();
        }
      };

      // 捕获全局错误
      const handleError = (event: ErrorEvent) => {
        if (event.message?.includes('Could not establish connection')) {
          console.log('🚫 Blocked extension error');
          event.preventDefault();
        }
      };

      window.addEventListener('unhandledrejection', handleUnhandledRejection);
      window.addEventListener('error', handleError);
    };

    // 立即执行清理
    cleanupExtensions();
    handleExtensionErrors();
  }, []);

  return (
    <Providers>
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <ImageShowcase />
        </div>
        <div className="relative z-10">
          <Navigation />
          {children}
        </div>
      </div>
    </Providers>
  );
}