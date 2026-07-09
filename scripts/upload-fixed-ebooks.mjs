// One-shot maintenance script: replace the ebooks in Supabase storage with the
// font-repaired versions (see repair notes in the 2026-07-09 session log).
// Backups of the previous files: _ebook-files/_backup-corrupted-20260709/.
// Reads credentials from .env.local exactly like the server runtime does.
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const env = readFileSync(".env.local", "utf8");
const get = (k) => env.match(new RegExp(`^${k}\\s*=\\s*(.+)$`, "m"))?.[1].trim().replace(/^["']|["']$/g, "");
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const key = get("SUPABASE_SERVICE_ROLE_KEY") ?? get("SUPABASE_SERVICE_ROLE") ?? get("SUPABASE_SERVICE_KEY");
if (!url || !key) { console.error("missing Supabase env"); process.exit(1); }

const sb = createClient(url, key);
const FIXED = join(process.env.TEMP, "claude", "storage-fixed");
const sha = (b) => createHash("sha256").update(b).digest("hex");

let ok = true;
for (const name of readdirSync(FIXED).filter((f) => f.endsWith(".pdf")).sort()) {
  const data = readFileSync(join(FIXED, name));
  const { error } = await sb.storage.from("ebooks").upload(name, data, {
    contentType: "application/pdf",
    upsert: true,
  });
  if (error) { console.log(`${name}: UPLOAD FAILED — ${error.message}`); ok = false; continue; }
  const { data: back, error: dlErr } = await sb.storage.from("ebooks").download(name);
  const match = !dlErr && sha(Buffer.from(await back.arrayBuffer())) === sha(data);
  ok = ok && match;
  console.log(`${name}: uploaded · ${match ? "verify HASH MATCH" : "VERIFY MISMATCH!"} · ${(data.length / 1024) | 0} KB`);
}
console.log(ok ? "ALL UPLOADS VERIFIED" : "FAILURES ABOVE");
process.exit(ok ? 0 : 1);
