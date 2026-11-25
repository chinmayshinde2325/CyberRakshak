import crypto from 'node:crypto';
import { normalizeIndianPhone } from './scamEngine.ts';

interface OtpRecord {
  salt: string;
  hashHex: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  windowStart: number;
  windowCount: number;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 4;
const MAX_VERIFY_ATTEMPTS = 5;

export class OtpStore {
  private records = new Map<string, OtpRecord>();
  private readonly sessionSecret: Buffer;

  constructor(secretOverride?: string) {
    const envSecret = (secretOverride ?? process.env.SESSION_SECRET ?? '').trim();
    this.sessionSecret =
      envSecret.length >= 16
        ? Buffer.from(envSecret, 'utf8')
        : crypto.randomBytes(32);
  }

  issueOtp(
    rawPhone: string,
    now = Date.now(),
  ):
    | { ok: true; e164: string; local10: string; code: string; expiresInSeconds: number }
    | { ok: false; code: 'invalid_phone' | 'cooldown' | 'rate_limited'; retryAfterSeconds?: number } {
    const parsed = normalizeIndianPhone(rawPhone);
    if (!parsed.valid) {
      return { ok: false, code: 'invalid_phone' };
    }

    const existing = this.records.get(parsed.e164);
    if (existing) {
      const sinceLast = now - existing.lastSentAt;
      if (sinceLast < RESEND_COOLDOWN_MS) {
        return {
          ok: false,
          code: 'cooldown',
          retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - sinceLast) / 1000),
        };
      }
      if (now - existing.windowStart < RATE_WINDOW_MS && existing.windowCount >= MAX_REQUESTS_PER_WINDOW) {
        return {
          ok: false,
          code: 'rate_limited',
          retryAfterSeconds: Math.ceil((RATE_WINDOW_MS - (now - existing.windowStart)) / 1000),
        };
      }
    }

    const otpCode = String(crypto.randomInt(100000, 1000000));
    const salt = crypto.randomBytes(16).toString('hex');
    const hashHex = crypto.scryptSync(otpCode, salt, 32).toString('hex');

    const withinWindow = existing && now - existing.windowStart < RATE_WINDOW_MS;
    this.records.set(parsed.e164, {
      salt,
      hashHex,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      lastSentAt: now,
      windowStart: withinWindow ? existing.windowStart : now,
      windowCount: withinWindow ? existing.windowCount + 1 : 1,
    });

    return {
      ok: true,
      e164: parsed.e164,
      local10: parsed.local10,
      code: otpCode,
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    };
  }

  verifyOtp(
    rawPhone: string,
    candidateCode: string,
    now = Date.now(),
  ):
    | { ok: true; e164: string; local10: string; token: string }
    | { ok: false; code: 'invalid_phone' | 'not_found' | 'expired' | 'too_many_attempts' | 'mismatch'; remainingAttempts?: number } {
    const parsed = normalizeIndianPhone(rawPhone);
    if (!parsed.valid) {
      return { ok: false, code: 'invalid_phone' };
    }

    const record = this.records.get(parsed.e164);
    if (!record) {
      return { ok: false, code: 'not_found' };
    }

    if (now > record.expiresAt) {
      this.records.delete(parsed.e164);
      return { ok: false, code: 'expired' };
    }

    if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
      this.records.delete(parsed.e164);
      return { ok: false, code: 'too_many_attempts' };
    }

    const cleanedCandidate = String(candidateCode || '').replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanedCandidate)) {
      record.attempts += 1;
      return {
        ok: false,
        code: 'mismatch',
        remainingAttempts: Math.max(0, MAX_VERIFY_ATTEMPTS - record.attempts),
      };
    }

    const expectedBuf = Buffer.from(record.hashHex, 'hex');
    const actualBuf = crypto.scryptSync(cleanedCandidate, record.salt, 32);
    const matches =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!matches) {
      record.attempts += 1;
      if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
        this.records.delete(parsed.e164);
        return { ok: false, code: 'too_many_attempts' };
      }
      return {
        ok: false,
        code: 'mismatch',
        remainingAttempts: MAX_VERIFY_ATTEMPTS - record.attempts,
      };
    }

    // Consume OTP immediately so it cannot be replayed
    this.records.delete(parsed.e164);
    const token = this.signToken(parsed.e164, now);
    return {
      ok: true,
      e164: parsed.e164,
      local10: parsed.local10,
      token,
    };
  }

  clearPhone(rawPhone: string) {
    const parsed = normalizeIndianPhone(rawPhone);
    if (parsed.valid) {
      this.records.delete(parsed.e164);
    }
  }

  signToken(e164: string, issuedAt = Date.now()): string {
    const payload = Buffer.from(
      JSON.stringify({ phone: e164, iat: issuedAt, exp: issuedAt + 7 * 24 * 60 * 60 * 1000 }),
      'utf8',
    ).toString('base64url');
    const sig = crypto.createHmac('sha256', this.sessionSecret).update(payload).digest('base64url');
    return `${payload}.${sig}`;
  }

  verifyToken(token: string, now = Date.now()): { valid: boolean; phone?: string } {
    if (typeof token !== 'string' || !token.includes('.')) {
      return { valid: false };
    }
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return { valid: false };

    const expectedSig = crypto
      .createHmac('sha256', this.sessionSecret)
      .update(payloadB64)
      .digest('base64url');

    const a = Buffer.from(sigB64, 'utf8');
    const b = Buffer.from(expectedSig, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { valid: false };
    }

    try {
      const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
        phone?: string;
        exp?: number;
      };
      if (!parsed.phone || typeof parsed.exp !== 'number' || now > parsed.exp) {
        return { valid: false };
      }
      return { valid: true, phone: parsed.phone };
    } catch {
      return { valid: false };
    }
  }
}

export async function dispatchSmsOtp(
  e164: string,
  local10: string,
  otpCode: string,
): Promise<{ sent: boolean; provider?: 'twilio' | 'fast2sms'; smsNotConfigured?: boolean; error?: string }> {
  const twSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twFrom = process.env.TWILIO_PHONE_NUMBER?.trim();
  const fast2smsKey = process.env.FAST2SMS_API_KEY?.trim();

  const messageText = `CyberRakshak verification code: ${otpCode}. Valid for 5 minutes. Never share this OTP with callers.`;

  if (twSid && twToken && twFrom) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(twSid)}/Messages.json`;
      const body = new URLSearchParams({
        To: `+${e164}`,
        From: twFrom,
        Body: messageText,
      });
      const auth = Buffer.from(`${twSid}:${twToken}`).toString('base64');
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      if (!resp.ok) {
        const errBody = await resp.text();
        return { sent: false, provider: 'twilio', error: `Twilio SMS failed (${resp.status}): ${errBody.slice(0, 140)}` };
      }
      return { sent: true, provider: 'twilio' };
    } catch (err) {
      return {
        sent: false,
        provider: 'twilio',
        error: err instanceof Error ? err.message : 'Twilio request failed.',
      };
    }
  }

  if (fast2smsKey) {
    try {
      const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: messageText,
          language: 'english',
          flash: 0,
          numbers: local10,
        }),
      });
      const data = (await resp.json().catch(() => ({}))) as { return?: boolean; message?: string | string[] };
      if (!resp.ok || data.return === false) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        return {
          sent: false,
          provider: 'fast2sms',
          error: msg || `Fast2SMS dispatch failed (${resp.status}).`,
        };
      }
      return { sent: true, provider: 'fast2sms' };
    } catch (err) {
      return {
        sent: false,
        provider: 'fast2sms',
        error: err instanceof Error ? err.message : 'Fast2SMS request failed.',
      };
    }
  }

  return {
    sent: false,
    smsNotConfigured: true,
    error:
      'Live SMS provider is not configured on the server. Add FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER in Settings -> Secrets.',
  };
}
