import { cn } from "@/lib/utils";

/**
 * Full-screen ambient backdrop with no external media dependency.
 * Uses CSS gradients so the demo remains self-contained on any host.
 */
export function VideoBackdrop({
  variant = "ambient",
  className,
}: {
  variant?: "ambient" | "hero" | "cinematic";
  className?: string;
}) {
  const glow =
    variant === "cinematic"
      ? "opacity-80"
      : variant === "hero"
        ? "opacity-65"
        : "opacity-55";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none",
        className,
      )}
    >
      <div
        className={cn(
          "absolute -inset-[20%] bg-[radial-gradient(circle_at_18%_18%,color-mix(in_oklab,var(--color-primary)_34%,transparent),transparent_34%),radial-gradient(circle_at_82%_28%,color-mix(in_oklab,var(--color-info)_22%,transparent),transparent_32%),radial-gradient(circle_at_55%_82%,color-mix(in_oklab,var(--color-success)_18%,transparent),transparent_36%)] blur-3xl",
          glow,
        )}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-background)_72%,transparent),transparent_48%,color-mix(in_oklab,var(--color-background)_88%,transparent))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_28%,color-mix(in_oklab,var(--color-background)_78%,transparent)_100%)]" />
    </div>
  );
}
