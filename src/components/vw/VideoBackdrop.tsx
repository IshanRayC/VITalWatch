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
      <div
        className={cn(
          "absolute inset-0 bg-background",
          hero ? "opacity-40" : "opacity-60",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/30 to-background/80" />
    </div>
  );
}
