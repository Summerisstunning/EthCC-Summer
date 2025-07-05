'use client';

import { useState, useEffect } from 'react';

export default function ExtensionDetector() {
  const [hasConflictingExtensions, setHasConflictingExtensions] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check for common problematic extensions
    const checkExtensions = () => {
      const suspiciousGlobals = [
        'ethereum',
        '__REACT_DEVTOOLS_GLOBAL_HOOK__',
        'chrome.runtime',
      ];

      let conflictCount = 0;
      suspiciousGlobals.forEach(global => {
        if (typeof window !== 'undefined' && (window as any)[global]) {
          conflictCount++;
        }
      });

      // Show warning if multiple extensions detected
      if (conflictCount > 2) {
        setHasConflictingExtensions(true);
        setShowWarning(true);
      }
    };

    // Delay check to avoid hydration issues
    const timer = setTimeout(checkExtensions, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!showWarning || !hasConflictingExtensions) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-amber-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Browser Extension Detected
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Some browser extensions may interfere with wallet connections. 
              If you experience issues, try disabling extensions temporarily.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="mt-2 text-sm text-amber-600 hover:text-amber-500 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}