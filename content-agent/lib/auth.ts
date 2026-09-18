const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export const SESSION_COOKIE = "content_os_session";

export async function createSessionToken() {
  const secret = process.env.CONTENT_OS_SESSION_SECRET;
  if (!secret) throw new Error("CONTENT_OS_SESSION_SECRET não configurado.");
  return hmac(secret, "renan-content-os:v1");
}

export async function isValidSession(token?: string) {
  if (!token) return false;
  try {
    const expected = await createSessionToken();
    return safeEqual(token, expected);
  } catch {
    return false;
  }
}

export async function signSlide(params: { index: string; title: string; body: string; exp: string }) {
  const secret = process.env.CONTENT_OS_SESSION_SECRET;
  if (!secret) throw new Error("CONTENT_OS_SESSION_SECRET não configurado.");
  const payload = [params.index, params.title, params.body, params.exp].join("\n");
  return hmac(secret, payload);
}

export async function verifySlide(params: { index: string; title: string; body: string; exp: string; sig: string }) {
  const exp = Number(params.exp);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await signSlide(params);
  return safeEqual(params.sig, expected);
}
