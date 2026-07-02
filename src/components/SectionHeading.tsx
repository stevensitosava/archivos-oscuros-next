import Link from "next/link";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  /** Optional right-aligned link. */
  to?: string;
  linkLabel?: string;
  className?: string;
}

export default function SectionHeading({ eyebrow, title, to, linkLabel, className = "" }: SectionHeadingProps) {
  return (
    <div className={`mb-8 flex items-end justify-between gap-6 ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-[clamp(1.8rem,3vw,2.8rem)]">{title}</h2>
      </div>
      {to && linkLabel && (
        <Link
          href={to}
          className="shrink-0 whitespace-nowrap text-[0.78rem] uppercase tracking-[0.18em] text-gold-400 transition-colors hover:text-gold-300"
          style={{ fontFamily: "var(--font-ritual)" }}
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
