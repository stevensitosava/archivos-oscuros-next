import CharacterModel from "./CharacterModel";

/**
 * Auth page shell: the animated 3D character beside the Clerk widget.
 * Stacks on mobile (character on top), side-by-side on desktop.
 */
export default function AuthScene({
  children,
  animation,
}: {
  children: React.ReactNode;
  animation?: string;
}) {
  return (
    <section className="mx-auto grid min-h-[82vh] max-w-6xl items-center gap-6 px-5 py-20 lg:grid-cols-2 lg:gap-12">
      <div className="relative h-[300px] w-full sm:h-[380px] lg:h-[600px]">
        {/* soft radial glow behind the model */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(178,52,42,0.16),transparent_62%)]"
          aria-hidden="true"
        />
        <CharacterModel animation={animation} className="h-full w-full" />
      </div>
      <div className="flex justify-center lg:justify-start">{children}</div>
    </section>
  );
}
