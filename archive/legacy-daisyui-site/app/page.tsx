import Link from "next/link";
import { getHomePage } from "@/lib/content";
import { ProseMain } from "@/components/ProseMain";
import { ContentZone } from "@/components/ContentZone";
import { ContentStack } from "@/components/ContentStack";
import { PageHeader } from "@/components/PageHeader";
import { SectionTitle } from "@/components/SectionTitle";
import { loadRawEvents, expandRecurringEvents } from "@/lib/events";
import { format } from "date-fns";

export default function HomePage() {
  const page = getHomePage();
  const raw = loadRawEvents();
  const expanded = expandRecurringEvents(raw, new Date(), 4);
  const upcoming = expanded
    .filter((e) => e.start >= new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 4);

  const title = page?.title?.split("|")[0]?.trim() ?? "Raleigh Hills Business Association";
  const description =
    page?.description ??
    "Connecting businesses, hosting community events, and supporting the Raleigh Hills corridor.";

  return (
    <ContentZone>
      <ContentStack>
        <section className="rounded-box bg-gradient-to-br from-primary/15 via-base-200 to-base-100 px-4 py-8 shadow-inner sm:px-6 sm:py-10">
          <PageHeader title={title} description={description} variant="hero" />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            <Link href="/calendar" className="btn btn-primary w-full sm:w-auto">
              Calendar
            </Link>
            <Link
              href="https://raleighhillsbusinessassn.org/"
              className="btn btn-outline btn-secondary w-full sm:w-auto"
            >
              Original site
            </Link>
          </div>
        </section>

        {page?.htmlMain ? (
          <section className="card border border-base-300 bg-base-200 shadow-md">
            <div className="card-body gap-4 sm:p-8">
              <SectionTitle>Welcome</SectionTitle>
              <div className="min-w-0 overflow-x-auto">
                <ProseMain html={page.htmlMain} />
              </div>
            </div>
          </section>
        ) : null}

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <SectionTitle>Upcoming</SectionTitle>
            <Link href="/calendar" className="link link-primary shrink-0 text-sm sm:text-base">
              Full calendar
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-base leading-relaxed text-base-content/75">
              No upcoming events in data yet. Run <code className="rounded bg-base-200 px-1.5 py-0.5 text-sm">npm run content:update</code>{" "}
              after mirroring the site, or edit <code className="rounded bg-base-200 px-1.5 py-0.5 text-sm">content/events.json</code>.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.map((e) => (
                <li key={e.id} className="card border border-base-300 bg-base-100 shadow-sm">
                  <div className="card-body gap-1 py-4 sm:px-6">
                    <h3 className="text-base font-semibold leading-snug text-base-content">{e.title}</h3>
                    <p className="text-sm leading-relaxed text-base-content/75">{format(e.start, "PPP p")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </ContentStack>
    </ContentZone>
  );
}
