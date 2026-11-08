import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { SessionUser } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "campus-reunion-poll-super-secret-key-at-least-32-chars-long!"
);

/**
 * Create a signed JWT token for the user session
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    full_name: user.full_name,
    mobile_number: user.mobile_number,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d") // 30-day session
    .sign(JWT_SECRET);
}

/**
 * Verify and decode session token
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      full_name: payload.full_name as string,
      mobile_number: payload.mobile_number as string,
      role: (payload.role as "member" | "admin") || "member",
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get current session user on the server (from cookies)
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

