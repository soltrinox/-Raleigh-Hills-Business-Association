import Link from "next/link"
import { ArrowRight, Target, Eye, Heart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { getSiteMetadata } from "@/lib/data"

export default function AboutPage() {
  const site = getSiteMetadata()

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
                About RHBA
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed">
                The Raleigh Hills Business Association is a registered 501(c)(6) non-profit organization 
                dedicated to supporting local businesses and strengthening our community.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 sm:py-24" id="mission">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-serif text-2xl">Our Mission</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    To support the community and neighborhoods surrounding Raleigh Hills by promoting a vibrant 
                    business community, maintaining a safe and healthy environment, creating community awareness, 
                    and maximizing livability.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                      <Eye className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <CardTitle className="font-serif text-2xl">Our Vision</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    To be the leading voice for business in Raleigh Hills, fostering a thriving commercial 
                    district that serves our community with excellence, integrity, and a spirit of collaboration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What We're Not */}
        <section className="bg-muted py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl mb-4">
              Community First, Always
            </h2>
            <p className="text-lg text-muted-foreground">
              RHBA is <strong>not</strong> a leads group. We do not share your information with other 
              businesses or organizations. We are all about community building!
            </p>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-12">
              What We Do
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Networking Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Regular meetups including monthly coffee sessions, member spotlight Zoom meetings, 
                    no-host lunches, and special networking events throughout the year.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Community Outreach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Annual programs like the School Supply Drive, Shop With A Cop, and our 
                    signature Recycle/Shred Event that give back to our community.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Business Advocacy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Representing local business interests, promoting member businesses, 
                    and creating opportunities for visibility and growth.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Member Directory</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Free listing in our online business directory, helping customers find 
                    and connect with local businesses in our community.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Member Spotlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monthly Zoom presentations showcasing member businesses, sharing expertise, 
                    and building deeper connections within our network.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Community Building</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Creating connections between businesses, residents, and community organizations 
                    to strengthen the fabric of Raleigh Hills.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Membership Info */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div>
                    <h2 className="font-serif text-3xl font-bold mb-4">
                      Join Our Association
                    </h2>
                    <p className="text-primary-foreground/80 max-w-2xl">
                      RHBA Membership is open to all business entities and individuals who own business property 
                      or operate a business within the Raleigh Hills area, as well as those with a substantial 
                      interest in the Raleigh Hills business community.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="block text-primary-foreground/70">New Membership</span>
                        <span className="text-2xl font-bold">${site.membershipFee.new}</span>
                        <span className="text-primary-foreground/70"> first year</span>
                      </div>
                      <div>
                        <span className="block text-primary-foreground/70">Annual Renewal</span>
                        <span className="text-2xl font-bold">${site.membershipFee.renewal}</span>
                        <span className="text-primary-foreground/70"> (due June 1st)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Button size="lg" variant="secondary" asChild>
                      <Link href="/join">
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                      <Link href="/member-benefits">
                        View Benefits
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-muted py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl mb-4">
              Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              We&apos;d love to hear from you. Reach out to learn more about RHBA.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
