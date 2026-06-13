import { useState, useCallback } from 'react';

export function useClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState(null);

  const copyToClipboard = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported in this environment');
      setError('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      setError(null);
      
      setTimeout(() => {
        setHasCopied(false);
      }, timeout);
      
      return true;
    } catch (err) {
      console.error('Failed to copy text:', err);
      setError(err.message);
      return false;
    }
  }, [timeout]);

  return { hasCopied, error, copyToClipboard };
}