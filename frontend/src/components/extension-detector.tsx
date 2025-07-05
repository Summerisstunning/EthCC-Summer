'use client';

import { useState, useEffect } from 'react';

export default function ExtensionDetector() {
  const [extensionIssues, setExtensionIssues] = useState<string[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // 防止扩展冲突的修复脚本
    const fixExtensionConflicts = () => {
      const issues: string[] = [];

      try {
        // 检测并修复 ethereum 对象冲突
        if (typeof window !== 'undefined') {
          const win = window as any;
          
          // 保存原始的 ethereum 对象
          if (win.ethereum && !win._originalEthereum) {
            win._originalEthereum = win.ethereum;
          }
          
          // 检测常见的扩展冲突
          const conflictingExtensions = [
            { name: 'EvmAsk', prop: 'evmAsk' },
            { name: 'WalletConnect', prop: '__WC_REGISTRY__' },
            { name: 'MetaMask', prop: '_metamask' }
          ];
          
          conflictingExtensions.forEach(ext => {
            if (win[ext.prop]) {
              issues.push(ext.name);
            }
          });

          // 尝试清理冲突的全局变量
          if (issues.length > 0) {
            console.log('Detected extension conflicts:', issues);
            
            // 创建一个干净的环境
            Object.defineProperty(win, 'ethereum', {
              get() {
                return win._originalEthereum;
              },
              set(value) {
                win._originalEthereum = value;
              },
              configurable: true
            });
          }
        }
      } catch (error) {
        console.warn('Failed to fix extension conflicts:', error);
        issues.push('Unknown Extension Conflict');
      }

      if (issues.length > 0) {
        setExtensionIssues(issues);
        setShowWarning(true);
      }
    };

    // 延迟执行以避免水合问题
    const timer = setTimeout(fixExtensionConflicts, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!showWarning || extensionIssues.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-amber-400 text-xl">🔧</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Extension Conflicts Fixed
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Detected: {extensionIssues.join(', ')}. 
              Conflicts have been automatically resolved.
            </p>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700"
              >
                Refresh Page
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="text-sm text-amber-600 hover:text-amber-500 underline"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}