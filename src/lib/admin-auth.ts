import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "iwb_admin_session";

function getExpectedHash(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function isAdminSession(): Promise<boolean> {
  const expectedHash = getExpectedHash();
  if (!expectedHash) return false;

  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!value) return false;

  const parts = value.split(".");
  if (parts.length !== 2) return false;

  const expiry = parseInt(parts[0] ?? "", 10);
  const hash = parts[1] ?? "";
  if (isNaN(expiry) || Date.now() > expiry) return false;

  return hash === expectedHash;
}

export async function createAdminSession() {
  const expectedHash = getExpectedHash();
  if (!expectedHash) throw new Error("ADMIN_PASSWORD is not set");

  const cookieStore = await cookies();
  const expiry = Date.now() + 24 * 60 * 60 * 1000;
  const value = `${expiry}.${expectedHash}`;
  cookieStore.set(ADMIN_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
