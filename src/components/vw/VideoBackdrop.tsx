import { cn } from "@/lib/utils";
import video from "@/assets/bg-video.mp4.asset.json";
import poster from "@/assets/bg-poster.jpg.asset.json";

/**
 * Full-screen looping background video. Autoplays muted, no controls,
 * scales to cover any viewport, and is dimmed to 60% brightness.
 * A light scrim keeps clinical data fully legible in both themes.
 */
export function VideoBackdrop({
  variant = "ambient",
  className,
}: {
  variant?: "ambient" | "hero" | "cinematic";
  className?: string;
}) {
  const scrim =
    variant === "cinematic" ? "opacity-25" : variant === "hero" ? "opacity-40" : "opacity-60";
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none",
        className,
      )}
    >
      <video
        src={video.url}
        poster={poster.url}
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        disablePictureInPicture
        preload="auto"
        className="absolute inset-0 size-full object-cover brightness-[0.6]"
      />
      {/* readability scrim — keeps text/data contrast intact in both themes */}
      <div className={cn("absolute inset-0 bg-background", scrim)} />
      <div
        className={cn(
          "absolute inset-0",
          variant === "cinematic"
            ? "bg-gradient-to-br from-background/60 via-background/10 to-background/70"
            : "bg-gradient-to-b from-background/70 via-background/30 to-background/80",
        )}
      />
    </div>
  );
}
