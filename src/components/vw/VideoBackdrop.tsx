import { cn } from "@/lib/utils";
import leaves from "@/assets/leaves-bg.mp4.asset.json";
import poster from "@/assets/leaves-poster.jpg.asset.json";

/**
 * Ambient botanical motion behind the UI. Deliberately very low contrast:
 * a scrim of the background token sits on top so every figure, label and
 * table row keeps full contrast. Decorative only — hidden from a11y tree.
 */
export function VideoBackdrop({
  variant = "ambient",
  className,
}: {
  variant?: "ambient" | "hero";
  className?: string;
}) {
  const hero = variant === "hero";
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none",
        className,
      )}
    >
      <video
        src={leaves.url}
        poster={poster.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={cn(
          "size-full object-cover",
          hero
            ? "opacity-[0.5] blur-[1px] saturate-[0.9]"
            : "opacity-[0.18] blur-[2px] saturate-[0.75]",
        )}
      />
      {/* readability scrim — keeps text/data contrast intact in both themes */}
      <div
        className={cn(
          "absolute inset-0 bg-background",
          hero ? "opacity-40" : "opacity-65",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/80" />
    </div>
  );
}
