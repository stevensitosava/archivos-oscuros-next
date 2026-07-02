import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { upsertProfile } from "./db";

/* Lazily mirror the signed-in Clerk user into the `profiles` table so the admin
   CRM can show real names + emails (Clerk stays the source of truth for auth).
   Deduped per instance: the upsert is idempotent, so this just avoids a Clerk
   API call + DB write on every request. A cold start re-syncs (also picks up
   name/email changes). Best-effort — never throws to the caller. */
const synced = new Set<string>();

export async function syncProfile(userId: string): Promise<void> {
  if (!userId || synced.has(userId)) return;
  synced.add(userId);
  try {
    const user = await currentUser();
    if (!user || user.id !== userId) {
      synced.delete(userId);
      return;
    }
    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      null;
    const name =
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      null;
    await upsertProfile(userId, email, name);
  } catch (e) {
    synced.delete(userId); // let a later request retry
    console.warn("[profile-sync] failed:", e instanceof Error ? e.message : e);
  }
}
