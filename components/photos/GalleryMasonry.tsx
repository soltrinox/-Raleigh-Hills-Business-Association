'use client';

import * as React from 'react';
import Image from 'next/image';
import type { PhotoEntry } from '@/lib/types';

export function GalleryMasonry({ photos }: { photos: PhotoEntry[] }) {
  const [open, setOpen] = React.useState<PhotoEntry | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((p) => (
          <button
            key={p.src}
            type="button"
            className="group mb-4 w-full break-inside-avoid overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            onClick={() => setOpen(p)}
          >
            <div className="relative w-full" style={{ aspectRatio: `${p.width} / ${p.height}` }}>
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          </button>
        ))}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo"
          onClick={() => setOpen(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Image
              src={open.src}
              alt={open.alt}
              width={open.width}
              height={open.height}
              className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
            />
            <p className="mt-2 text-center text-sm text-white/90">{open.alt}</p>
            <p className="mt-4 text-center text-xs text-white/70">Click outside to close</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
