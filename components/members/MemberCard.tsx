'use client';

import Link from 'next/link';
import { forwardRef } from 'react';
import { Building2, Globe, MapPin, Phone } from 'lucide-react';
import type { Member } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MemberCardProps {
  member: Member;
  selected?: boolean;
  onActivate?: (id: string) => void;
}

export const MemberCard = forwardRef<HTMLElement, MemberCardProps>(
  function MemberCard({ member: m, selected, onActivate }, ref) {
    const interactive = !!onActivate;

    const inner = (
      <>
        <div className="flex min-h-[120px] shrink-0 items-center justify-center border-b border-border bg-muted/40 px-4 py-5">
          {m.logoUrl ? (
            <img
              src={m.logoUrl}
              alt={`${m.name} logo`}
              className="max-h-24 w-full max-w-[160px] object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-24 w-full max-w-[160px] items-center justify-center rounded-lg border border-dashed border-border bg-background">
              <Building2 className="size-12 text-muted-foreground/60" aria-hidden />
            </div>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 font-serif text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
              {m.name}
            </h3>
            {selected ? (
              <Badge variant="destructive" className="shrink-0 text-[10px] uppercase">
                Selected
              </Badge>
            ) : null}
          </div>
          <Badge
            variant="secondary"
            className="w-fit max-w-full whitespace-normal text-left text-xs font-normal"
          >
            {m.category}
          </Badge>
          <div className="flex gap-2 text-xs text-muted-foreground sm:text-sm">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary/80 sm:size-4" aria-hidden />
            <span className="leading-snug">{m.address}</span>
          </div>
          {m.description ? (
            <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {m.description}
            </p>
          ) : (
            <div className="flex-1" aria-hidden />
          )}
          <div className="mt-auto flex flex-wrap gap-x-3 gap-y-2 border-t border-border pt-3">
            {m.phone ? (
              <a
                href={`tel:${m.phone.replace(/\s/g, '')}`}
                className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-primary hover:underline sm:text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                <span className="truncate">{m.phone}</span>
              </a>
            ) : null}
            {m.website ? (
              <Link
                href={m.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline sm:text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="size-3.5 shrink-0 sm:size-4" aria-hidden />
                Website
              </Link>
            ) : null}
          </div>
        </CardContent>
      </>
    );

    return (
      <article ref={ref} className="h-full">
        <Card
          className={cn(
            'flex h-full flex-col overflow-hidden border-border shadow-sm transition-all duration-200 hover:shadow-md',
            selected && 'ring-2 ring-red-600/90 ring-offset-2 ring-offset-background',
          )}
        >
          {interactive ? (
            <button
              type="button"
              className="flex flex-1 flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => onActivate(m.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onActivate(m.id);
                }
              }}
            >
              {inner}
            </button>
          ) : (
            <div className="flex flex-1 flex-col">{inner}</div>
          )}
        </Card>
      </article>
    );
  },
);
