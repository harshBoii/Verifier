import { Redis } from '@upstash/redis';

// Initialize Redis client once and reuse.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Stores a verification session with a 5-minute expiry.
 * @param {string} clientId - The unique ID for the verification attempt.
 * @param {object} data - The session data to store.
 */
export async function setVerificationSession(clientId, data) {
  // Use a prefix to avoid key collisions in Redis.
  await redis.set(`verification:${clientId}`, JSON.stringify(data), { ex: 300 }); // 300s = 5 mins
}

/**
 * Retrieves and deletes a session to ensure single-use.
 * @param {string} clientId - The unique ID for the verification attempt.
 * @returns {Promise<object|null>} The session data or null if not found.
 */
export async function getVerificationSession(clientId) {
  const key = `verification:${clientId}`;
  const data = await redis.get(key);
  
  if (data) {
    // Delete the key after retrieving it to ensure OTPs are single-use.
    await redis.del(key);
    return JSON.parse(data);
  }
  
  return null;
}
