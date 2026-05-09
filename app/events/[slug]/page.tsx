import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { EventDetail } from "@/components/events/EventDetail";
import {
  getAllDetailSlugs,
  getEnrichedEvent,
  getExpandedUpcomingEventCards,
} from "@/lib/events";
import { getSiteUrl } from "@/lib/site-url";

export function generateStaticParams(): { slug: string }[] {
  return getAllDetailSlugs(18).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const event = getEnrichedEvent(decoded);
  if (!event) {
    return { title: "Event" };
  }
  const title = event.title.replace(/\|.*$/, "").trim();
  const description = event.summary ?? event.description?.slice(0, 160) ?? "";
  const siteUrl = getSiteUrl();
  const og = event.coverImage
    ? event.coverImage.startsWith("http")
      ? event.coverImage
      : `${siteUrl}${event.coverImage}`
    : undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/events/${encodeURIComponent(decoded)}`,
      type: "website",
      ...(og ? { images: [{ url: og }] } : {}),
    },
  };
}

function relatedForSlug(
  publicSlug: string,
  tags: string[] | undefined,
  category: string | undefined
) {
  const upcoming = getExpandedUpcomingEventCards(24).filter(
    (e) => e.slug && e.slug !== publicSlug
  );
  const tagSet = new Set((tags ?? []).map((t) => t.toLowerCase()));
  const scored = upcoming.map((e) => {
    let score = 0;
    if (category && e.category && e.category === category) score += 3;
    for (const t of e.tags ?? []) {
      if (tagSet.has(t.toLowerCase())) score += 2;
    }
    return { e, score };
  });
  scored.sort((a, b) => b.score - a.score || a.e.start.localeCompare(b.e.start));
  const picked = scored.slice(0, 6).map((x) => x.e);
  return picked.slice(0, 3);
}

export default async function EventSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const enriched = getEnrichedEvent(decoded);
  if (!enriched) notFound();

  const siteUrl = getSiteUrl();
  const absoluteShareUrl = `${siteUrl}/events/${encodeURIComponent(decoded)}`;

  const related = relatedForSlug(decoded, enriched.tags, enriched.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: enriched.title.replace(/\|.*$/, "").trim(),
    description: enriched.summary ?? enriched.description,
    startDate: enriched.start,
    endDate: enriched.end,
    eventStatus:
      enriched.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : enriched.status === "rescheduled"
          ? "https://schema.org/EventRescheduled"
          : "https://schema.org/EventScheduled",
    ...(enriched.location?.address || enriched.location?.name
      ? {
          location: {
            "@type": enriched.location.online ? "VirtualLocation" : "Place",
            ...(enriched.location.online && enriched.location.joinUrl
              ? { url: enriched.location.joinUrl }
              : {}),
            ...(!enriched.location.online
              ? {
                  name: enriched.location.name,
                  address: enriched.location.address,
                }
              : {}),
          },
        }
      : {}),
    organizer: {
      "@type": "Organization",
      name: enriched.host?.organization ?? "Raleigh Hills Business Association",
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />
      <main className="flex-1">
        <EventDetail
          event={enriched}
          publicSlug={decoded}
          siteUrl={siteUrl}
          absoluteShareUrl={absoluteShareUrl}
          related={related}
        />
      </main>
      <Footer />
    </div>
  );
}
