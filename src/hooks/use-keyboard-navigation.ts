import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to trap focus within a container (useful for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap activates
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to handle keyboard navigation in lists
 */
export function useKeyboardNavigation<T extends HTMLElement>(
  itemCount: number,
  options: {
    orientation?: 'vertical' | 'horizontal' | 'both';
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const containerRef = useRef<T>(null);
  const currentIndex = useRef(0);

  const focusItem = useCallback((index: number) => {
    if (!containerRef.current) return;
    
    const items = containerRef.current.querySelectorAll<HTMLElement>(
      '[role="option"], [role="menuitem"], [data-keyboard-item]'
    );
    
    if (items[index]) {
      items[index].focus();
      currentIndex.current = index;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { key } = e;
    let newIndex = currentIndex.current;
    let handled = false;

    const shouldHandle = (keys: string[]) => keys.includes(key);

    // Vertical navigation
    if (orientation !== 'horizontal' && shouldHandle(['ArrowUp', 'ArrowDown'])) {
      handled = true;
      if (key === 'ArrowUp') {
        newIndex = loop 
          ? (currentIndex.current - 1 + itemCount) % itemCount
          : Math.max(0, currentIndex.current - 1);
      } else {
        newIndex = loop 
          ? (currentIndex.current + 1) % itemCount
          : Math.min(itemCount - 1, currentIndex.current + 1);
      }
    }

    // Horizontal navigation
    if (orientation !== 'vertical' && shouldHandle(['ArrowLeft', 'ArrowRight'])) {
      handled = true;
      if (key === 'ArrowLeft') {
        newIndex = loop 
          ? (currentIndex.current - 1 + itemCount) % itemCount
          : Math.max(0, currentIndex.current - 1);
      } else {
        newIndex = loop 
          ? (currentIndex.current + 1) % itemCount
          : Math.min(itemCount - 1, currentIndex.current + 1);
      }
    }

    // Home/End navigation
    if (key === 'Home') {
      handled = true;
      newIndex = 0;
    } else if (key === 'End') {
      handled = true;
      newIndex = itemCount - 1;
    }

    // Enter/Space selection
    if (shouldHandle(['Enter', ' '])) {
      e.preventDefault();
      onSelect?.(currentIndex.current);
      return;
    }

    if (handled) {
      e.preventDefault();
      focusItem(newIndex);
    }
  }, [itemCount, orientation, loop, onSelect, focusItem]);

  return { containerRef, handleKeyDown, focusItem };
}

/**
 * Hook for skip links (accessibility navigation)
 */
export function useSkipLink(targetId: string) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [targetId]);

  return handleClick;
}

/**
 * Announce message to screen readers
 */
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return announce;
}
