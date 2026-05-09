import { cn } from "@/lib/utils"

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 5.838A6.162 6.162 0 1 1 12 18.162a6.162 6.162 0 0 1 0-12.324zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
      />
    </svg>
  )
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  )
}

export type SocialFollowButtonsProps = {
  instagramUrl: string
  facebookUrl: string
  size?: "lg" | "md"
  /** Use `onDark` when badges sit on a dark footer so borders/shadows read clearly. */
  surface?: "default" | "onDark"
  className?: string
}

export function SocialFollowButtons({
  instagramUrl,
  facebookUrl,
  size = "lg",
  surface = "default",
  className,
}: SocialFollowButtonsProps) {
  const tall = size === "lg" ? "min-h-16 sm:min-h-[4.25rem]" : "min-h-14"
  const icon = size === "lg" ? "h-10 w-10 shrink-0" : "h-9 w-9 shrink-0"
  const titleSm = size === "lg" ? "text-xs" : "text-[11px]"
  const titleLg = size === "lg" ? "text-lg sm:text-xl font-semibold" : "text-base font-semibold"
  const pad = size === "lg" ? "px-4 py-2.5 sm:px-5 sm:py-3" : "px-3.5 py-2 sm:px-4 sm:py-2.5"

  const badgeSurface =
    surface === "onDark"
      ? "border border-white/25 bg-black shadow-lg shadow-black/50 ring-1 ring-white/10 text-white hover:border-white/40"
      : "border border-zinc-700/30 bg-black text-white shadow-md hover:border-zinc-600/60"

  const focusRing =
    surface === "onDark"
      ? "focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
      : "focus-visible:ring-offset-2 focus-visible:ring-offset-background"

  return (
    <div
      className={cn(
        "flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center",
        className,
      )}
    >
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow RHBA on Instagram"
        className={cn(
          "flex w-full max-w-[280px] items-center gap-3 rounded-xl transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[220px] sm:max-w-none",
          focusRing,
          tall,
          pad,
          badgeSurface,
          "hover:-translate-y-0.5 active:translate-y-0",
        )}
      >
        <InstagramGlyph className={icon} />
        <span className="min-w-0 flex-1 text-left leading-tight">
          <span className={cn("block font-sans text-white/80", titleSm)}>Follow us on</span>
          <span className={cn("block font-sans tracking-tight text-white", titleLg)}>
            Instagram
          </span>
        </span>
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow RHBA on Facebook"
        className={cn(
          "flex w-full max-w-[280px] items-center gap-3 rounded-xl transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[220px] sm:max-w-none",
          focusRing,
          tall,
          pad,
          badgeSurface,
          "hover:-translate-y-0.5 active:translate-y-0",
        )}
      >
        <FacebookGlyph className={icon} />
        <span className="min-w-0 flex-1 text-left leading-tight">
          <span className={cn("block font-sans text-white/80", titleSm)}>Follow us on</span>
          <span className={cn("block font-sans tracking-tight text-white", titleLg)}>
            Facebook
          </span>
        </span>
      </a>
    </div>
  )
}
