import { ExternalLink, Facebook, Instagram, Linkedin, Video, Youtube } from "lucide-react";
import type { EventSocialPlatform } from "@/lib/types";

export type SocialLinksProps = {
  social?: Partial<Record<EventSocialPlatform, string | null | undefined>>;
  className?: string;
};

const PLATFORMS: {
  key: EventSocialPlatform;
  label: string;
  Icon: typeof Instagram;
}[] = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "x", label: "X", Icon: ExternalLink },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "zoom", label: "Zoom", Icon: Video },
];

export function SocialLinks({ social, className }: SocialLinksProps) {
  if (!social) return null;
  const items = PLATFORMS.filter((p) => {
    const url = social[p.key];
    return typeof url === "string" && url.trim().length > 0;
  });
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-muted-foreground">Connect</p>
      <div className="flex flex-wrap gap-2">
        {items.map(({ key, label, Icon }) => {
          const href = social[key] as string;
          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={label}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
