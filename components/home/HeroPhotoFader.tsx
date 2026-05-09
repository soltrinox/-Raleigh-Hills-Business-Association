'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { HeroFaderSlide } from '@/lib/hero-slides';

const ROTATE_MS = 6000;

export function HeroPhotoFader({ slides }: { slides: HeroFaderSlide[] }) {
  const [active, setActive] = React.useState(0);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  React.useEffect(() => {
    if (slides.length <= 1 || reduceMotion) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length, reduceMotion]);

  if (slides.length === 0) return null;

  const showIdx = reduceMotion ? 0 : active;

  return (
    <div
      className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
      aria-label="Photos of RHBA members and events"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 shadow-lg ring-1 ring-black/5">
        {slides.map((slide, i) => {
          const src = slide.kind === 'org' ? slide.photo.src : slide.src;
          const alt = slide.kind === 'org' ? slide.photo.alt : slide.alt;

          const visible = i === showIdx;
          const inner = (
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority={i === 0}
              className="object-cover"
            />
          );

          return (
            <div
              key={`${slide.kind}-${src}-${i}`}
              className={cn(
                'absolute inset-0 transition-opacity duration-[1.5s] ease-in-out',
                visible ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none',
              )}
              aria-hidden={!visible}
            >
              {slide.kind === 'member' ? (
                <Link href="/members" className="relative block h-full w-full">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </div>
          );
        })}
      </div>
      {slides.length > 1 && !reduceMotion ? (
        <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Photo rotation">
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === showIdx}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                i === showIdx ? 'bg-primary-foreground' : 'bg-primary-foreground/35 hover:bg-primary-foreground/55',
              )}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${slides.length}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
