import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Organizers sign in with one shared password (ADMIN_PASSWORD).
// Everyone else can view tournaments without signing in.

const COOKIE = "bfo_session";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set.");
  return s;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  // Hash both so they're the same length, then compare in constant time.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function passwordIsCorrect(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(password, expected);
}

export async function isOrganizer() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value || !process.env.AUTH_SECRET) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature) return false;
  if (!safeEqual(signature, sign(expires))) return false;
  return Number(expires) > Date.now();
}

export async function startSession() {
  const expires = String(Date.now() + WEEK_MS);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: WEEK_MS / 1000,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function requireOrganizer() {
  if (!(await isOrganizer())) redirect("/login");
}
