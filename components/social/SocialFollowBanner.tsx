import { getSiteMetadata } from "@/lib/data"
import { SocialFollowButtons } from "./SocialFollowButtons"

export function SocialFollowBanner() {
  const { social } = getSiteMetadata()

  return (
    <section
      aria-labelledby="social-follow-heading"
      className="border-b border-border bg-muted/40 py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="social-follow-heading"
            className="font-serif text-3xl font-bold text-foreground sm:text-4xl"
          >
            Follow us on social media
          </h2>
          <p className="mt-3 text-muted-foreground">
            Stay connected with Raleigh Hills Business Association — updates, events, and community news.
          </p>
        </div>
        <div className="mt-10 flex justify-center">
          <SocialFollowButtons
            instagramUrl={social.instagram}
            facebookUrl={social.facebook}
            size="lg"
          />
        </div>
      </div>
    </section>
  )
}
