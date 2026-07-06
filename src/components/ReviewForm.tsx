"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEntitlements } from "@/components/EntitlementsProvider";
import { submitReview } from "@/app/libro/[slug]/review-actions";
import StarIcon from "@/components/StarIcon";

/* Verified-buyer rating widget. Only renders for a user who OWNS the book
   (client gate via entitlements; the server action re-checks ownership before
   writing). Prefills the user's existing rating; clicking a star saves it. */
export default function ReviewForm({ bookId, hasReviews = false }: { bookId: string; hasReviews?: boolean }) {
  const { owns } = useEntitlements();
  const canReview = owns(bookId);
  const router = useRouter();
  const [mine, setMine] = useState<number | null>(null);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!canReview) return;
    let live = true;
    fetch(`/api/reviews/mine?bookId=${encodeURIComponent(bookId)}`)
      .then((r) => r.json())
      .then((d) => { if (live) setMine(typeof d.rating === "number" ? d.rating : null); })
      .catch(() => {});
    return () => { live = false; };
  }, [canReview, bookId]);

  if (!canReview) return null;

  const choose = async (rating: number) => {
    setBusy(true);
    setMsg(null);
    const res = await submitReview({ bookId, rating });
    setBusy(false);
    if (res.ok) {
      setMine(rating);
      setMsg("¡Gracias por tu valoración!");
      router.refresh();
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg(res.error);
    }
  };

  const shown = hover || mine || 0;

  return (
    <div className="mt-8 rounded-xl border border-bone-100/12 bg-ink-800/60 p-5">
      <p
        className={`text-[0.72rem] uppercase tracking-[0.16em] ${!mine && !hasReviews ? "text-ember-300" : "text-ash-400"}`}
        style={{ fontFamily: "var(--font-ritual)" }}
      >
        {mine ? "Tu valoración" : hasReviews ? "Valora este libro" : "✦ Sé el primero en valorar este libro"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              disabled={busy}
              onMouseEnter={() => setHover(i)}
              onClick={() => choose(i)}
              aria-label={`${i} ${i === 1 ? "estrella" : "estrellas"}`}
              className="rounded p-0.5 transition-transform hover:scale-110 disabled:opacity-60"
            >
              <StarIcon className={`w-7 transition-colors ${shown >= i ? "text-gold-400" : "text-ash-600"}`} />
            </button>
          ))}
        </div>
        {msg && <span className="text-[0.85rem] text-gold-300">{msg}</span>}
      </div>
      <p className="mt-2.5 text-[0.78rem] text-ash-500">
        Solo los lectores que han adquirido este libro pueden valorarlo.
      </p>
    </div>
  );
}
