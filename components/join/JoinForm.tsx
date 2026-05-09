'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { JoinSchema, type JoinInput } from '@/lib/schemas/join'

function defaultJoinValues(): JoinInput {
  return {
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    zip: '',
    category: '',
    description: '',
    instagram: '',
    facebook: '',
    membershipTier: 'new',
    paymentIntent: 'check',
    optInNewsletter: false,
    notes: '',
    hp_company: '',
  }
}

export function JoinForm() {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  const form = useForm({
    resolver: zodResolver(JoinSchema),
    defaultValues: defaultJoinValues(),
  })

  async function onSubmit(values: JoinInput) {
    startTransition(async () => {
      try {
        const res = await fetch('/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })

        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          error?: unknown
        }

        if (res.ok && data.ok) {
          toast.success('Application submitted. We\'ll be in touch soon.')
          form.reset(defaultJoinValues())
          router.push('/join?sent=1')
          router.refresh()
          return
        }

        if (res.status === 422) {
          toast.error('Please fix the highlighted fields.')
          return
        }

        toast.error(
          typeof data.error === 'string'
            ? data.error
            : 'Could not submit. Please try again or email us directly.',
        )
      } catch {
        toast.error('Network error. Please try again.')
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative flex flex-col gap-10 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <fieldset disabled={pending} className="contents">
          <div
            className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
            aria-hidden
          >
            <FormField
              control={form.control}
              name="hp_company"
              render={({ field }) => (
                <FormItem className="m-0 p-0">
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input
                      tabIndex={-1}
                      autoComplete="off"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Business</h2>
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category / industry (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Restaurant, retail, professional services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Contact</h2>
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address (optional)</FormLabel>
                  <FormControl>
                    <Input autoComplete="street-address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City (optional)</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP (optional)</FormLabel>
                    <FormControl>
                      <Input autoComplete="postal-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Web &amp; social (optional)</h2>
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <Input placeholder="URL or @handle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <Input placeholder="URL or page name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold">Membership</h2>
            <FormField
              control={form.control}
              name="membershipTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership tier</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col gap-3 pt-2"
                    >
                      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3">
                        <RadioGroupItem value="new" id="tier-new" className="mt-0.5" />
                        <span className="text-sm leading-relaxed">
                          <span className="font-medium block">New member</span>
                          $100 — first year
                        </span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3">
                        <RadioGroupItem value="renewal" id="tier-renewal" className="mt-0.5" />
                        <span className="text-sm leading-relaxed">
                          <span className="font-medium block">Renewal</span>
                          $75 — annual (due June 1st)
                        </span>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentIntent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col gap-3 pt-2"
                    >
                      <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2">
                        <RadioGroupItem value="check" id="pay-check" />
                        <span className="text-sm">I&apos;ll pay by check</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2">
                        <RadioGroupItem value="invoice" id="pay-inv" />
                        <span className="text-sm">Send me an invoice</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2">
                        <RadioGroupItem value="contact-me" id="pay-contact" />
                        <span className="text-sm">Contact me about payment</span>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="optInNewsletter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal cursor-pointer">
                      Email me RHBA announcements (optional)
                    </FormLabel>
                    <FormDescription>
                      Uncheck anytime; RHBA doesn&apos;t share your info with advertisers.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anything else we should know? (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
            {pending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit application'
            )}
          </Button>
        </fieldset>
      </form>
    </Form>
  )
}
