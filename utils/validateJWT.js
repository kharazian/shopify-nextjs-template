import crypto from 'crypto';

/**
 * Validates a Shopify JWT (JSON Web Token) and returns its payload if valid.
 * @param {string} token The JWT string to validate.
 * @returns {object} The decoded and validated Shopify JWT payload.
 * @throws {Error} If the JWT is malformed, has an invalid signature, or is expired/not yet valid.
 */
export default function validateJWT(token) {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error('Malformed JWT');
  }

  // The process.env.SHOPIFY_API_SECRET! in TS asserts that the variable is non-null.
  // In JS, we must handle the possibility that it might be undefined.
  const secret = process.env.SHOPIFY_API_SECRET;

  if (!secret) {
      throw new Error('SHOPIFY_API_SECRET is not set in environment variables');
  }

  const data = `${headerB64}.${payloadB64}`;

  // Calculate the expected signature
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    // Base64URL encoding replaces standard Base64 characters
    // and removes padding, which is necessary for JWT comparison.
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  // 1. Signature Verification
  if (expectedSig !== signatureB64) {
    throw new Error('Invalid JWT signature');
  }

  // 2. Decode Payload
  const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf8');
  const payload = JSON.parse(payloadJson);

  // 3. Time Validation (exp and nbf claims)
  const now = Math.floor(Date.now() / 1000); // Current time in seconds

  if (payload.exp < now || payload.nbf > now) {
    throw new Error('JWT expired or not yet valid');
  }

  return payload;
}