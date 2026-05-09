#!/usr/bin/env node
/**
 * Validates data/events.json shape (additive schema — scraped rows stay permissive).
 * Usage: pnpm events:validate
 */
const fs = require("fs");
const path = require("path");
const { z } = require("zod");

const eventSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    start: z.string(),
    end: z.string().optional(),
    description: z.string().optional(),
    sourcePageUrl: z.string().optional(),
    confidence: z.enum(["high", "medium", "low"]).optional(),
    recurringRule: z.string().optional(),
    slug: z.string().optional(),
    summary: z.string().optional(),
    timezone: z.string().optional(),
    allDay: z.boolean().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    location: z
      .object({
        name: z.string().optional(),
        address: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        mapUrl: z.string().optional(),
        online: z.boolean().optional(),
        joinUrl: z.string().optional(),
      })
      .optional(),
    host: z
      .object({
        name: z.string(),
        role: z.string().optional(),
        organization: z.string().optional(),
        memberId: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        avatarUrl: z.string().optional(),
      })
      .optional(),
    links: z
      .object({
        primaryCta: z
          .object({ label: z.string(), href: z.string() })
          .optional(),
        website: z.string().optional(),
        register: z.string().optional(),
        tickets: z.string().optional(),
        ics: z.string().optional(),
        social: z.record(z.union([z.string(), z.null()])).optional(),
        attachments: z
          .array(z.object({ label: z.string(), href: z.string() }))
          .optional(),
      })
      .optional(),
    contacts: z
      .array(
        z.object({
          name: z.string(),
          role: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
        })
      )
      .optional(),
    status: z
      .enum(["scheduled", "cancelled", "rescheduled", "sold_out"])
      .optional(),
    visibility: z.enum(["public", "members"]).optional(),
  })
  .passthrough();

const fileSchema = z.object({
  manual: z.array(eventSchema).optional(),
  events: z.array(eventSchema).optional(),
  generatedAt: z.string().optional(),
});

const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "data", "events.json");

function main() {
  const raw = fs.readFileSync(jsonPath, "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("[FAIL] Invalid JSON:", e.message);
    process.exit(1);
  }
  const parsed = fileSchema.safeParse(data);
  if (!parsed.success) {
    console.error("[FAIL] Schema:", parsed.error.flatten());
    process.exit(1);
  }
  const manual = parsed.data.manual ?? [];
  const dupSlug = new Map();
  for (const ev of manual) {
    if (!ev.slug) continue;
    dupSlug.set(ev.slug, (dupSlug.get(ev.slug) ?? 0) + 1);
  }
  for (const [slug, count] of dupSlug) {
    if (count > 1) {
      console.error("[FAIL] Duplicate manual slug:", slug);
      process.exit(1);
    }
  }
  console.log(
    "[PASS] events.json validates (%s manual, %s events)",
    manual.length,
    (parsed.data.events ?? []).length
  );
}

main();
