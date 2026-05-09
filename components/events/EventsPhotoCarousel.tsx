'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import type { PhotoEntry } from '@/lib/types';

const AUTO_ADVANCE_MS = 8000;

export function EventsPhotoCarousel({ photos }: { photos: PhotoEntry[] }) {
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
    if (!api || paused || photos.length <= 1) return;
    const id = window.setInterval(() => {
      api.scrollNext();
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [api, paused, photos.length]);

  if (photos.length === 0) return null;

  return (
    <section
      className="border-t border-border bg-muted/40 py-12 md:py-16"
      aria-labelledby="events-photos-heading"
    >
      <div className="container mx-auto px-4">
        <h2
          id="events-photos-heading"
          className="font-serif text-2xl font-bold text-foreground md:text-3xl"
        >
          Photos from our events
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Snapshots from RHBA gatherings and community programs. Hover to pause the slideshow.
        </p>

        <div
          className="relative mt-8 px-2 sm:px-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Carousel
            setApi={setApi}
            opts={{ loop: true, align: 'start', duration: 24 }}
            className="w-full"
            aria-label="Event photo carousel"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {photos.map((p) => (
                <CarouselItem
                  key={p.src}
                  className="basis-full pl-2 sm:basis-1/2 lg:basis-1/3 md:pl-4"
                >
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={p.src}
                        alt={p.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              type="button"
              className="left-0 border-border bg-background/95 shadow-sm sm:-left-2"
            />
            <CarouselNext
              type="button"
              className="right-0 border-border bg-background/95 shadow-sm sm:-right-2"
            />
          </Carousel>

          {snapCount > 0 ? (
            <p className="mt-4 text-center text-xs text-muted-foreground" aria-live="polite">
              Slide {current + 1} of {snapCount}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
