import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-server";
import { getAllSubscribers } from "@/lib/admin-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /admin/boletin/export → newsletter subscribers as CSV (admin only). */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  const subs = await getAllSubscribers();
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [
    ["email", "status", "source", "created_at"],
    ...subs.map((s) => [s.email, s.status, s.source ?? "", s.createdAt]),
  ];
  const csv = rows.map((r) => r.map((c) => esc(c)).join(",")).join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="suscriptores-archivos-oscuros.csv"',
      "Cache-Control": "no-store",
    },
  });
}
