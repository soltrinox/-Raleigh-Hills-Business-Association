'use client';

import * as React from 'react';
import Link from 'next/link';
import { Building2, Globe, MapPin, Phone, Users } from 'lucide-react';
import type { Member } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AUTO_ADVANCE_MS = 10_000;

export function FeaturedMembersCarousel({ members }: { members: Member[] }) {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [paused, setPaused] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [snapCount, setSnapCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setSnapCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api || paused || members.length <= 1) return;
    const id = window.setInterval(() => {
      api.scrollNext();
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [api, paused, members.length]);

  if (members.length === 0) return null;

  return (
    <section
      className="border-t border-border bg-muted/50 py-16 lg:py-20"
      aria-labelledby="featured-members-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <h2
            id="featured-members-heading"
            className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Featured members
          </h2>
          <p className="mt-3 text-muted-foreground">
            Spotlighting businesses from our directory. Rotates every 10 seconds — hover to pause.
          </p>
          <Button variant="link" asChild className="mt-1 h-auto p-0 text-primary">
            <Link href="/members">Browse full member directory</Link>
          </Button>
        </div>

        <div
          className="relative mx-auto mt-10 max-w-3xl px-10 sm:px-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Carousel
            setApi={setApi}
            opts={{ loop: true, align: 'center', duration: 24 }}
            className="w-full"
            aria-label="Featured member businesses"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {members.map((m) => (
                <CarouselItem key={m.id} className="basis-full pl-2 md:pl-4">
                  <Card
                    className={cn(
                      'overflow-hidden border-border shadow-md transition-shadow',
                      'hover:shadow-lg',
                    )}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="flex shrink-0 items-center justify-center border-b border-border bg-muted/40 p-6 sm:w-44 sm:border-b-0 sm:border-r md:w-52">
                        {m.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- external member logos; same pattern as directory
                          <img
                            src={m.logoUrl}
                            alt=""
                            className="max-h-28 w-full max-w-[140px] object-contain"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-28 w-full max-w-[140px] items-center justify-center rounded-lg border border-dashed border-border bg-background">
                            <Building2 className="h-14 w-14 text-muted-foreground/50" aria-hidden />
                          </div>
                        )}
                      </div>
                      <CardContent className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                        <div>
                          <h3 className="font-serif text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                            {m.name}
                          </h3>
                          <Badge variant="secondary" className="mt-2 font-normal">
                            {m.category}
                          </Badge>
                        </div>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-primary/80" aria-hidden />
                          <span className="leading-snug">{m.address}</span>
                        </div>
                        {m.description ? (
                          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {m.description}
                          </p>
                        ) : null}
                        <div className="mt-auto flex flex-wrap gap-3 border-t border-border pt-4">
                          {m.phone ? (
                            <a
                              href={`tel:${m.phone.replace(/\s/g, '')}`}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                            >
                              <Phone className="size-4 shrink-0" aria-hidden />
                              {m.phone}
                            </a>
                          ) : null}
                          {m.website ? (
                            <a
                              href={m.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                            >
                              <Globe className="size-4 shrink-0" aria-hidden />
                              Website
                            </a>
                          ) : null}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              type="button"
              className="left-0 border-border bg-background/95 shadow-sm sm:-left-1"
            />
            <CarouselNext
              type="button"
              className="right-0 border-border bg-background/95 shadow-sm sm:-right-1"
            />
          </Carousel>

          {snapCount > 0 ? (
            <p className="mt-4 text-center text-xs text-muted-foreground" aria-live="polite">
              Member {current + 1} of {snapCount}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
