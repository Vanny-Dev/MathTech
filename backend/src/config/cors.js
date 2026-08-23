/**
 * Which browser origins may talk to this API.
 *
 * Shared by the Express middleware and the Socket.IO server so the two can
 * never drift — a socket rejected by a stricter rule than the REST API is a
 * confusing failure, because the page loads and only the live updates die.
 *
 * CLIENT_URL may hold a comma-separated list so a staging site can be added
 * without a code change.
 */
export const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))   // tolerate a trailing slash
  .filter(Boolean);

export const isAllowedOrigin = (origin) => {
  // No origin = same-origin, curl, or a health check
  if (!origin) return true;

  const clean = origin.replace(/\/$/, '');
  if (allowedOrigins.includes(clean)) return true;

  // Vercel preview deployments for this project, e.g.
  // https://mathtech-git-somebranch-user.vercel.app
  if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' &&
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(clean)) {
    return true;
  }

  return false;
};

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};
