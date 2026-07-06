import { NextRequest, NextResponse } from "next/server";
import { currencyForCountry, getFxRates } from "@/lib/geo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/geo → { country, currency, rate } for the requester, using Vercel's
 *  edge geolocation. `rate` is EUR→currency (1 for EUR). The client localizes
 *  prices from this. Never publicly cached — the answer varies per visitor. */
export async function GET(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country");
  const currency = currencyForCountry(country);
  const headers = { "Cache-Control": "private, no-store" };

  if (currency === "EUR") {
    return NextResponse.json({ country: country ?? null, currency: "EUR", rate: 1 }, { headers });
  }
  const rates = await getFxRates();
  const rate = rates[currency];
  const ok = typeof rate === "number" && rate > 0;
  return NextResponse.json(
    ok ? { country, currency, rate } : { country, currency: "EUR", rate: 1 },
    { headers },
  );
}
