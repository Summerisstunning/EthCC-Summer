'use client';

import { useEffect } from 'react';

// 定义窗口接口扩展，包含ethereum对象
interface WindowWithEthereum extends Window {
  _originalEthereum?: typeof window.ethereum;
  ethereum?: typeof window.ethereum;
}

export function PrivyErrorHandler() {
  // 不再需要usePrivy，因为我们使用全局错误事件监听
  
  // 监听全局错误，恢复ethereum对象
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && typeof event.error.message === 'string' && 
          event.error.message.includes('ethereum')) {
        console.error('Ethereum error detected:', event.error);
        
        // 恢复ethereum对象
        const win = window as WindowWithEthereum;
        if (win._originalEthereum) {
          win.ethereum = win._originalEthereum;
          console.log('✅ Recovered ethereum object from error');
        }
      }
    };
    
    // 添加全局错误监听
    window.addEventListener('error', handleError);
    
    // 清理函数
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // 这是一个无UI组件，只处理错误
  return null;
}
