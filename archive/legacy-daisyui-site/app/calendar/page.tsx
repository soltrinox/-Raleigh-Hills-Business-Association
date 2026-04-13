import type { Metadata } from "next";
import { loadRawEvents, expandRecurringEvents } from "@/lib/events";
import { CalendarClient } from "./CalendarClient";
import { ContentZone } from "@/components/ContentZone";
import { ContentStack } from "@/components/ContentStack";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Calendar",
  description: "RHBA meetings and events (from mirrored content + manual entries).",
};

export default function CalendarPage() {
  const raw = loadRawEvents();
  const expanded = expandRecurringEvents(raw, new Date(), 8);
  const serializable = expanded.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    end: e.end?.toISOString(),
    resource: e.resource,
  }));

  const calDescription = (
    <>
      Events come from automated extraction of cached pages and from the{" "}
      <code className="rounded bg-base-200 px-1.5 py-0.5 text-sm">manual</code> array in{" "}
      <code className="rounded bg-base-200 px-1.5 py-0.5 text-sm">content/events.json</code>. Edit that file to add or
      fix dates.
    </>
  );

  return (
    <ContentZone variant="wide">
      <ContentStack>
        <PageHeader title="Calendar" description={calDescription} />
        <div className="min-w-0 overflow-x-auto">
          <div className="card border border-base-300 bg-base-100 shadow-md">
            <div className="card-body p-3 sm:p-6">
              <CalendarClient events={serializable} />
            </div>
          </div>
        </div>
      </ContentStack>
    </ContentZone>
  );
}
