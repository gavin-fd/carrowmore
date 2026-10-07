import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

interface ScrollPosition {
  left: number;
  top: number;
}

const TOP: ScrollPosition = { left: 0, top: 0 };

/** Keep normal page-navigation focus and scroll behaviour within the persistent shell. */
export function usePageNavigation(title: string) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousKey = useRef(location.key);
  const positions = useRef(new Map<string, ScrollPosition>());
  // Capture scrolling before React replaces a long page with a shorter one.
  const lastPosition = useRef<ScrollPosition>(TOP);

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const recordPosition = () => {
      lastPosition.current = { left: window.scrollX, top: window.scrollY };
    };
    recordPosition();
    window.addEventListener('scroll', recordPosition, { passive: true });
    return () => {
      window.removeEventListener('scroll', recordPosition);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    document.title = `${title} | Carrowmore`;
  }, [title]);

  useLayoutEffect(() => {
    // Leave the initial document's focus and scroll position to the browser.
    if (previousKey.current === location.key) return;
    positions.current.set(previousKey.current, lastPosition.current);
    previousKey.current = location.key;
    const target = navigationType === 'POP' ? positions.current.get(location.key) ?? TOP : TOP;
    const restore = () => {
      window.scrollTo({ ...target, behavior: 'instant' });
      lastPosition.current = { left: window.scrollX, top: window.scrollY };
    };
    restore();
    // Dialog/popover teardown may return focus and release the page's scroll lock.
    // Run after it, without letting focus scroll a restored page back to the top.
    const frame = window.requestAnimationFrame(() => {
      restore();
      document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.key, navigationType]);
}
