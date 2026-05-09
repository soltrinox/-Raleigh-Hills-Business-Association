'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ContactSchema, type ContactInput } from '@/lib/schemas/contact'

const defaultValues: ContactInput = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  website: '',
}

export function ContactForm() {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  const form = useForm({
    resolver: zodResolver(ContactSchema),
    defaultValues,
  })

  async function onSubmit(values: ContactInput) {
    startTransition(async () => {
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })

        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          error?: unknown
        }

        if (res.ok && data.ok) {
          toast.success('Message sent. We\'ll get back to you soon.')
          form.reset(defaultValues)
          router.push('/contact?sent=1')
          router.refresh()
          return
        }

        if (res.status === 422 && data.error) {
          toast.error('Please fix the highlighted fields.')
          return
        }

        toast.error(
          typeof data.error === 'string'
            ? data.error
            : 'Could not send your message. Please try again or email us directly.',
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
        className="relative flex flex-col gap-6 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <fieldset disabled={pending} className="contents">
          {/* Honeypot */}
          <div
            className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
            aria-hidden
          >
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem className="m-0 p-0">
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
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

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your name</FormLabel>
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
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea rows={8} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={pending} size="lg" className="w-full sm:w-auto">
            {pending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              'Send message'
            )}
          </Button>
        </fieldset>
      </form>
    </Form>
  )
}
