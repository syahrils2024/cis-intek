import { useState, useCallback } from 'react';

import { useWidth } from './use-responsive';
import { useEventListener } from './use-event-listener';

// ----------------------------------------------------------------------

const BREAKPOINTS = ['xl', 'lg', 'md', 'sm', 'xs'];

function resolveOffset(offsets, currentWidth) {
  const startIndex = BREAKPOINTS.indexOf(currentWidth);
  const fallbackChain = BREAKPOINTS.slice(startIndex);

  const bp = fallbackChain.find((key) => offsets[key] !== undefined);

  return bp !== undefined ? offsets[bp] : 0;
}

// ----------------------------------------------------------------------

export function useComputedHeight(offsets = {}) {
  const width = useWidth();

  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  const handleResize = useCallback(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  useEventListener('resize', handleResize);

  const offset = typeof offsets === 'number' ? offsets : resolveOffset(offsets, width);

  return Math.max(0, windowHeight - offset);
}
