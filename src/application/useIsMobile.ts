import { useEffect, useState } from 'react';

export const MOBILE_BREAKPOINT_PX = 768;

function getQuery(): MediaQueryList {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
}

/**
 * Reports whether the viewport currently matches the mobile breakpoint.
 * Updates live as the viewport is resized (e.g. on device rotation).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => getQuery().matches);

  useEffect(() => {
    const query = getQuery();
    const onChange = () => setIsMobile(query.matches);

    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
