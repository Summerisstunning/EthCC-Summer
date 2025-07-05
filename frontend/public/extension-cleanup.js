// 这个脚本在React加载之前运行，清理扩展污染
(function() {
  'use strict';
  
  console.log('🚫 Pre-React extension cleanup running...');
  
  // 1. 立即清理body属性
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
          console.log(`🧹 Removing ${attr} from body`);
          body.removeAttribute(attr);
        }
      });
    }
  };
  
  // 2. 保护window对象
  const protectWindowObject = () => {
    if (window.ethereum && !window._ethereumProtected) {
      const originalEthereum = window.ethereum;
      window._ethereumProtected = true;
      
      Object.defineProperty(window, 'ethereum', {
        get: () => originalEthereum,
        set: () => {
          console.warn('🚫 Blocked extension ethereum redefinition');
        },
        configurable: false
      });
    }
  };
  
  // 3. 立即执行清理
  cleanBodyAttributes();
  protectWindowObject();
  
  // 4. 在DOM ready后再次清理
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        cleanBodyAttributes();
        protectWindowObject();
      }, 0);
    });
  } else {
    setTimeout(() => {
      cleanBodyAttributes();
      protectWindowObject();
    }, 0);
  }
  
  // 5. 在页面加载完成后最终清理
  window.addEventListener('load', () => {
    setTimeout(() => {
      cleanBodyAttributes();
      console.log('✅ Extension cleanup completed');
    }, 100);
  });
  
})();