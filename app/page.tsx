import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  Building2, 
  Heart, 
  Backpack,
  Coffee,
  Video,
  MapPin
} from "lucide-react"
import { format, parseISO, isValid } from "date-fns"
import { getSiteMetadata, getHomeFeed } from "@/lib/data"
import { loadMembers } from "@/lib/members"
import { FeaturedMembersCarousel } from "@/components/home/FeaturedMembersCarousel"
import { HeroPhotoFader } from "@/components/home/HeroPhotoFader"
import { SocialFollowBanner } from "@/components/social/SocialFollowBanner"
import { ThemedBanner } from "@/components/photos/ThemedBanner"
import { CalendarMini } from "@/components/calendar/CalendarMini"
import { EventCard } from "@/components/events/EventCard"
import {
  adjacentYm,
  buildCalendarGrid,
  ymFromSearchParam,
} from "@/lib/calendar-grid"
import {
  eventHref,
  getEventsForMonth,
  getNextUpcomingBannerEvent,
  getRecentUpcoming,
} from "@/lib/events"
import { getHeroPhotos } from "@/lib/photos"
import { buildHeroSlides } from "@/lib/hero-slides"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ calYm?: string }>
}) {
  const site = getSiteMetadata()
  const bannerEvent = getNextUpcomingBannerEvent()
  const homeFeed = getHomeFeed()
  const members = loadMembers()
  const heroSlides = buildHeroSlides(getHeroPhotos(), members)

  const sp = await searchParams
  const today = new Date()
  const { year, monthIndex, ymParam } = ymFromSearchParam(sp.calYm, today)
  const instances = getEventsForMonth(year, monthIndex)
  const cells = buildCalendarGrid(year, monthIndex, instances)
  const monthLabel = format(new Date(year, monthIndex, 1), "MMMM yyyy")
  const prevYm = adjacentYm(year, monthIndex, -1)
  const nextYm = adjacentYm(year, monthIndex, 1)
  const todayYm = format(today, "yyyy-MM")
  const recentEvents = getRecentUpcoming(8).slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-24 lg:py-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
                <h1 className="text-balance font-serif text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                  {site.name}
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-primary-foreground/80 sm:text-xl">
                  {site.description}
                </p>
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/join">
                      Join Our Association
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <Link href="/members">
                      Member Directory
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                    <Link href="/calendar">
                      <Calendar className="mr-2 h-4 w-4" />
                      View calendar
                    </Link>
                  </Button>
                </div>
              </div>
              {heroSlides.length > 0 ? (
                <div className="flex justify-center lg:justify-end">
                  <HeroPhotoFader slides={heroSlides} />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Featured Event Banner */}
        {bannerEvent && (
          <section className="bg-accent py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-accent-foreground/70">Upcoming Event</p>
                    <p className="font-semibold text-accent-foreground">
                      {bannerEvent.title} - {format(parseISO(bannerEvent.start), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {bannerEvent.slug ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={eventHref(bannerEvent.slug)}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </section>
        )}

        <section className="border-b border-border bg-background py-14 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Recent &amp; upcoming events
              </h2>
              <p className="mt-3 text-muted-foreground">
                From{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">data/events.json</code>{" "}
                — tap a highlighted day to jump to an event card.
              </p>
            </div>
            <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-6">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {recentEvents.map((e) => (
                    <EventCard
                      key={e.id}
                      event={e}
                      id={e.slug ? `evt-${e.slug}` : undefined}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Button asChild>
                    <Link href="/calendar">
                      <Calendar className="mr-2 h-4 w-4" />
                      View full calendar
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/events">All events</Link>
                  </Button>
                </div>
              </div>
              <div className="flex shrink-0 justify-center lg:justify-end lg:pt-2">
                <CalendarMini
                  key={ymParam}
                  monthLabel={monthLabel}
                  prevHref={`/?calYm=${prevYm}`}
                  nextHref={`/?calYm=${nextYm}`}
                  todayHref={`/?calYm=${todayYm}`}
                  cells={cells}
                />
              </div>
            </div>
          </div>
        </section>

        {homeFeed.length > 0 && (
          <section className="border-b border-border bg-muted/40 py-14 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                  News &amp; announcements
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Editable via <code className="rounded bg-muted px-1.5 py-0.5 text-sm">data/home-feed.json</code>
                </p>
              </div>
              <ul className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
                {homeFeed.map((item, i) => {
                  let dateLabel: string | null = null
                  if (item.date) {
                    const d = parseISO(item.date)
                    dateLabel = isValid(d) ? format(d, "MMMM d, yyyy") : null
                  }
                  const inner = (
                    <>
                      {dateLabel && (
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{dateLabel}</p>
                      )}
                      <p className="mt-1 font-serif text-lg font-semibold text-foreground">{item.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                    </>
                  )
                  return (
                    <li key={`${item.title}-${i}`}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="block rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">{inner}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Member Benefits */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Why Join RHBA?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Connect with local businesses, support your community, and grow together.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Networking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monthly meetups, coffee sessions, and no-host lunches to connect with fellow business owners.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Directory Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Free listing on the RHBA Website Directory to increase your business visibility.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Events Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Priority invitations to RHBA events, meetings, and community initiatives.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Community Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Participate in community programs like School Supply Drive and Shop With A Cop.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Community Programs */}
        <section className="bg-muted py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Community Outreach Programs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                RHBA is active in our community through impactful programs where you can make a difference.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <Card className="overflow-hidden">
                <ThemedBanner themedKey="shred-event" className="rounded-none sm:h-52" />
                <CardHeader>
                  <CardTitle>Recycle/Shred Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our 14th Annual event on April 18, 2026. Secure shredding, e-waste recycling, and community collection.
                  </p>
                  <Button variant="link" className="mt-4 px-0" asChild>
                    <Link href="/events/shred-event">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="flex h-48 items-center justify-center bg-primary/10">
                  <Backpack className="h-16 w-16 text-primary" />
                </div>
                <CardHeader>
                  <CardTitle>School Supply Drive</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Annual campaign supporting Raleigh Park Elementary School students with essential supplies.
                  </p>
                  <Button variant="link" className="mt-4 px-0" asChild>
                    <Link href="/events/school-supplies">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <ThemedBanner themedKey="shop-with-a-cop" className="rounded-none sm:h-52" />
                <CardHeader>
                  <CardTitle>Shop With A Cop</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Partnership with Washington County Sheriff&apos;s Office and Beaverton School District for holiday giving.
                  </p>
                  <Button variant="link" className="mt-4 px-0" asChild>
                    <Link href="/events/shop-with-a-cop">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Regular Meetings */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Regular Meetings
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join us for networking opportunities throughout the month. All meetings are open to the public!
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="overflow-hidden border-l-4 border-l-primary">
                <ThemedBanner themedKey="coffee-meetup" className="rounded-none sm:h-44" />
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Coffee className="h-4 w-4" />
                    1st Wednesday
                  </div>
                  <CardTitle className="text-lg">Coffee Meetup</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">10:00 - 11:00 AM</p>
                  <p className="mt-2 text-sm">Coffee Cart at Westside Wines</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-l-4 border-l-primary">
                <ThemedBanner themedKey="zoom-calls" className="rounded-none sm:h-44" />
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="h-4 w-4" />
                    2nd Wednesday
                  </div>
                  <CardTitle className="text-lg">Member Spotlight</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">8:00 - 9:00 AM via Zoom</p>
                  <p className="mt-2 text-sm">Monthly speaker presentation</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-l-4 border-l-primary">
                <ThemedBanner themedKey="business-lunch" className="rounded-none sm:h-44" />
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    3rd Wednesday
                  </div>
                  <CardTitle className="text-lg">No-Host Lunch</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">12:00 - 1:00 PM</p>
                  <p className="mt-2 text-sm">Eastern Pearl Restaurant</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="h-4 w-4" />
                    4th Wednesday
                  </div>
                  <CardTitle className="text-lg">Board Meeting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">8:00 - 9:00 AM via Zoom</p>
                  <p className="mt-2 text-sm">Open to members</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10 text-center">
              <Button variant="outline" asChild>
                <Link href={site.zoomLink} target="_blank" rel="noopener noreferrer">
                  <Video className="mr-2 h-4 w-4" />
                  Join on Zoom
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Membership CTA */}
        <section className="bg-primary py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-balance font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Join?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                New membership is ${site.membershipFee.new} (first year). Renewals are ${site.membershipFee.renewal} annually, due June 1st.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/join">
                    Apply for Membership
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                  <Link href="/member-benefits">
                    View All Benefits
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">Our Mission</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              To support the community and neighborhoods surrounding Raleigh Hills by promoting a vibrant business community, 
              maintaining a safe and healthy environment, creating community awareness, and maximizing livability.
            </p>
            <p className="mt-4 text-muted-foreground">
              RHBA is not a leads group. We do not share your information with other businesses/organizations. 
              We are all about community building!
            </p>
          </div>
        </section>

        <SocialFollowBanner />

        <FeaturedMembersCarousel members={members} />
      </main>

      <Footer />
    </div>
  )
}
