import { useAdsContext } from '../context/AdsContext.jsx';

/**
 * Public entry point for ad-aware components and pages. The actual state
 * lives in AdsContext (fetched once app-wide); this hook is what the rest of
 * the app imports so call sites read `useAds()` rather than reaching into
 * the context module directly.
 */
export const useAds = () => useAdsContext();
