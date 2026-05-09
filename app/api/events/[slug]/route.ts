import { NextResponse } from "next/server";
import { getEnrichedEvent, getEventBySlug } from "@/lib/events";
import { buildIcs } from "@/lib/ics";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const decoded = decodeURIComponent(slug);
  const url = new URL(request.url);
  const accept = request.headers.get("accept") ?? "";
  const wantsIcs =
    url.searchParams.get("format") === "ics" ||
    (accept.includes("text/calendar") && url.searchParams.get("format") !== "json");

  const resolved = getEventBySlug(decoded);
  if (!resolved) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (wantsIcs) {
    const ics = buildIcs(resolved);
    const safeName = decoded.replace(/[^\w.-]+/g, "_");
    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}.ics"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const json = getEnrichedEvent(decoded);
  if (!json) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(json, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
