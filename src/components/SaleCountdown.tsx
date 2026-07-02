"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Live HH:MM:SS countdown to a flash sale's end. Renders nothing on the server
 *  (avoids a hydration mismatch — the value is time-dependent) and nothing once
 *  expired; on reaching zero it refreshes so the reverted price loads. */
export default function SaleCountdown({ endsAt, className = "" }: { endsAt: string; className?: string }) {
  const router = useRouter();
  const target = Date.parse(endsAt);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const r = Math.max(0, target - Date.now());
      setRemaining(r);
      return r;
    };
    if (tick() === 0) {
      router.refresh();
      return;
    }
    const id = setInterval(() => {
      if (tick() === 0) {
        clearInterval(id);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target, router]);

  if (remaining === null || remaining <= 0) return null;

  const s = Math.floor(remaining / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");

  return (
    <span className={className} suppressHydrationWarning>
      Termina en {hh}:{mm}:{ss}
    </span>
  );
}
