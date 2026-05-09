import type { Metadata } from 'next'
import Link from 'next/link'

import { PageTemplate } from '@/components/page-template'
import { JoinForm } from '@/components/join/JoinForm'
import { getSiteMetadata } from '@/lib/data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Become a member',
  description:
    'Apply for membership in the Raleigh Hills Business Association — networking, directory listing, and community programs.',
}

type Props = {
  searchParams: Promise<{ sent?: string }>
}

export default async function JoinPage({ searchParams }: Props) {
  const { sent } = await searchParams
  const showThanks = sent === '1'
  const site = getSiteMetadata()
  const { new: newFee, renewal } = site.membershipFee

  return (
    <PageTemplate
      title="Become a member"
      subtitle={`Annual dues: $${newFee} for new members (first year), $${renewal} for renewals (due June 1st). Submit this form and we will follow up with payment options.`}
      showContentBlocks={false}
    >
      {showThanks ? (
        <Alert className="mb-8">
          <AlertTitle>Application received</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Thanks for applying. Watch your inbox for next steps, or email{' '}
              <Link className="underline font-medium" href={`mailto:${site.email}`}>
                {site.email}
              </Link>{' '}
              if you need anything right away.
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/member-benefits">View member benefits</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="relative mx-auto max-w-3xl">
        <JoinForm />
      </div>
    </PageTemplate>
  )
}
