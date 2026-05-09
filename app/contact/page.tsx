import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MapPin, Phone, Video } from 'lucide-react'

import { PageTemplate } from '@/components/page-template'
import { ContactForm } from '@/components/contact/ContactForm'
import { getSiteMetadata } from '@/lib/data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact the Raleigh Hills Business Association — questions about membership, events, or the community.',
}

type Props = {
  searchParams: Promise<{ sent?: string }>
}

export default async function ContactPage({ searchParams }: Props) {
  const { sent } = await searchParams
  const showThanks = sent === '1'
  const site = getSiteMetadata()

  return (
    <PageTemplate
      title="Contact us"
      subtitle="Send a message to the RHBA board. We typically respond within a few business days."
      showContentBlocks={false}
    >
      {showThanks ? (
        <Alert className="mb-8">
          <AlertTitle>Thank you</AlertTitle>
          <AlertDescription>
            Your message has been sent. Prefer email? You can also reach us at{' '}
            <Link className="underline font-medium" href={`mailto:${site.email}`}>
              {site.email}
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">RHBA office</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <span>{site.address}</span>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <a href={`mailto:${site.email}`} className="text-foreground underline-offset-4 hover:underline">
                {site.email}
              </a>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <a href={`tel:${site.phone.replace(/\D/g, '')}`} className="text-foreground underline-offset-4 hover:underline">
                {site.phone}
              </a>
            </div>
            <div className="flex gap-3">
              <Video className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <a
                href={site.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Join a meeting on Zoom
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <ContactForm />
        </div>
      </div>
    </PageTemplate>
  )
}
