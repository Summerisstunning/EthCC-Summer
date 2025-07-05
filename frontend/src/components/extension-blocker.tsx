'use client';

import { useEffect } from 'react';

export default function ExtensionBlocker() {
  useEffect(() => {
    // 在React水合之前清理扩展污染
    const cleanupExtensionArtifacts = () => {
      if (typeof window === 'undefined') return;

      console.log('🧹 Cleaning up extension artifacts...');

      // 1. 清理body上的扩展属性
      const body = document.body;
      if (body) {
        // 移除已知的扩展属性
        const extensionAttributes = [
          'data-channel-name',
          'data-extension-id', 
          'data-grammarly-shadow-root',
          'data-new-gr-c-s-check-loaded',
          'data-gr-ext-installed'
        ];

        extensionAttributes.forEach(attr => {
          if (body.hasAttribute(attr)) {
            console.log(`Removing extension attribute: ${attr}`);
            body.removeAttribute(attr);
          }
        });
      }

      // 2. 阻止扩展修改ethereum对象
      const win = window as any;
      if (win.ethereum) {
        const originalEthereum = win.ethereum;
        
        // 创建一个不可变的ethereum对象包装
        Object.defineProperty(win, 'ethereum', {
          get() {
            return originalEthereum;
          },
          set() {
            // 阻止扩展重新定义ethereum
            console.warn('Blocked extension attempt to redefine ethereum object');
          },
          configurable: false,
          enumerable: true
        });
      }

      // 3. 禁用已知有问题的扩展功能
      const problemExtensions = ['evmAsk', 'okxwallet', 'coin98', 'trustwallet'];
      problemExtensions.forEach(ext => {
        if (win[ext]) {
          try {
            win[ext] = undefined;
            console.log(`Disabled problematic extension: ${ext}`);
          } catch (e) {
            console.warn(`Could not disable extension: ${ext}`, e);
          }
        }
      });

      // 4. 清理扩展注入的样式
      const extensionStyles = document.querySelectorAll('style[data-extension]');
      extensionStyles.forEach(style => style.remove());

      // 5. 重置console如果被扩展修改
      if (win.console && win.console._isExtensionModified) {
        console.log('Resetting console that was modified by extension');
      }
    };

    // 立即清理
    cleanupExtensionArtifacts();

    // 监听DOM变化，防止扩展再次污染
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target === document.body) {
          const attributeName = mutation.attributeName;
          if (attributeName && (
            attributeName.startsWith('data-channel-') ||
            attributeName.startsWith('data-extension-') ||
            attributeName.includes('grammarly') ||
            attributeName.includes('gr-ext')
          )) {
            console.log(`Blocked extension from adding attribute: ${attributeName}`);
            (mutation.target as Element).removeAttribute(attributeName);
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-channel-name', 'data-extension-id', 'data-grammarly-shadow-root']
    });

    // 清理函数
    return () => {
      observer.disconnect();
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
}

// 导出一个用于手动清理的函数
export const forceCleanExtensions = () => {
  if (typeof window !== 'undefined') {
    // 强制刷新页面以清理所有扩展污染
    window.location.reload();
  }
};