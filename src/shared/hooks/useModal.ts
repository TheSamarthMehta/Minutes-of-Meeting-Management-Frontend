import { useState, useCallback, useRef, useEffect } from 'react';

interface ModalOptions<T = any> {
  onOpen?: (data: T | null) => void;
  onClose?: () => void;
  clearDelay?: number;
}

interface UseModalReturn<T = any> {
  isOpen: boolean;
  data: T | null;
  open: (modalData?: T | null) => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Custom hook for modal state management
 * @param options - Modal options
 * @param options.onOpen - Callback when modal opens
 * @param options.onClose - Callback when modal closes
 * @param options.clearDelay - Delay before clearing data (ms)
 * @returns Modal state and handlers
 */
export const useModal = <T = any>(options: ModalOptions<T> = {}): UseModalReturn<T> => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [data, setData] = useState<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const open = useCallback((modalData: T | null = null) => {
    setData(modalData);
    setIsOpen(true);
    if (options.onOpen) {
      options.onOpen(modalData);
    }
  }, [options]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (options.onClose) {
      options.onClose();
    }
    // Clear data after a short delay to allow animations
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setData(null);
    }, options.clearDelay || 300);
  }, [options]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
};
