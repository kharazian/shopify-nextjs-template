import crypto from 'crypto';

type ShopifyJWT = {
  iss: string;
  dest: string;
  aud: string;
  sub: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
};

export default function validateJWT(token: string): ShopifyJWT {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error('Malformed JWT');
  }
  const secret = process.env.SHOPIFY_API_SECRET!;
  const data = `${headerB64}.${payloadB64}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (expectedSig !== signatureB64) {
    throw new Error('Invalid JWT signature');
  }

  const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf8');
  const payload = JSON.parse(payloadJson) as ShopifyJWT;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now || payload.nbf > now) {
    throw new Error('JWT expired or not yet valid');
  }

  return payload;
}
