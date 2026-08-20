import crypto from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'above_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters.');
  return secret;
}

function sign(value: string) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSession(value?: string) {
  if (!value) return false;
  const [role, expires, signature] = value.split('.');
  if (role !== 'admin' || !expires || !signature || Number(expires) < Math.floor(Date.now() / 1000)) return false;
  const payload = `${role}.${expires}`;
  const expected = sign(payload);
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function isValidAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  // Validate that a password is configured, then compare it exactly. The
  // previous minimum-length check rejected existing local passwords before
  // they could ever be compared and surfaced as a misleading login failure.
  if (!expected) throw new Error('ADMIN_PASSWORD must be configured.');
  const provided = Buffer.from(password);
  const configured = Buffer.from(expected);
  return provided.length === configured.length && crypto.timingSafeEqual(provided, configured);
}
