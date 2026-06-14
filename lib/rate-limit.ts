/**
 * Simple in-memory IP-based rate limiter for MVP.
 * Resets on server restart/redeploy — acceptable for MVP deterrent.
 */

const requestLog = new Map<string, number[]>();

/**
 * Check if a request from the given IP is within the rate limit.
 * @param ip - The client IP address
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean }
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean } {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Get existing timestamps for this IP, filter to current window
  const timestamps = (requestLog.get(ip) || []).filter((t) => t > cutoff);

  if (timestamps.length >= maxRequests) {
    requestLog.set(ip, timestamps);
    return { allowed: false };
  }

  timestamps.push(now);
  requestLog.set(ip, timestamps);

  // Periodic cleanup: remove IPs with no recent requests
  if (requestLog.size > 1000) {
    for (const [key, vals] of requestLog) {
      const fresh = vals.filter((t) => t > cutoff);
      if (fresh.length === 0) {
        requestLog.delete(key);
      }
    }
  }

  return { allowed: true };
}
