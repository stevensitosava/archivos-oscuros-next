import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Current Clerk user id, or null (also null in demo mode). */
export async function getUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

/**
 * True when the signed-in user is an admin — either `publicMetadata.role === "admin"`
 * (set in the Clerk dashboard) or their user id is in ADMIN_USER_IDS.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;
    // 1) Env allowlist — cheap, no API call.
    if (ADMIN_IDS.includes(userId)) return true;
    // 2) Role claim, IF a custom Clerk JWT template exposes publicMetadata.
    const claims = sessionClaims as Record<string, unknown> | null | undefined;
    const meta = (claims?.metadata ?? claims?.publicMetadata) as { role?: string } | undefined;
    if (meta?.role === "admin") return true;
    // 3) Fallback: the DEFAULT Clerk session token omits publicMetadata, so the
    // role claim is usually absent. Check the backend user record so that simply
    // setting publicMetadata.role="admin" in the Clerk dashboard works without
    // any extra JWT-template configuration.
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      return (user.publicMetadata as { role?: string } | null | undefined)?.role === "admin";
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/** Throws (caller should redirect/404) unless the user is an admin. */
export async function assertAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId || !(await isAdmin())) throw new Error("forbidden");
  return userId;
}
