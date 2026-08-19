import { useEffect, useState } from 'react';

/**
 * Reports whether a CSS media query currently matches, and re-renders when it
 * changes. Used where the difference is structural rather than cosmetic — for
 * example swapping a data table for a card list on a phone, which CSS alone
 * cannot do without shipping both and hiding one.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);

    setMatches(mql.matches);          // in case it changed before this ran
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
