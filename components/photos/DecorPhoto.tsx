import Image from 'next/image';
import { pickDecorPhotos } from '@/lib/photos';
import { cn } from '@/lib/utils';

export function DecorPhoto({
  seed,
  aspect = '3/2',
  className,
  caption,
}: {
  seed: string;
  /** CSS aspect-ratio value, e.g. `3/2` */
  aspect?: string;
  className?: string;
  caption?: string;
}) {
  const [photo] = pickDecorPhotos(seed, 1);
  if (!photo) return null;

  return (
    <figure className={cn('overflow-hidden rounded-xl border border-border bg-card shadow-sm', className)}>
      <div className="relative w-full" style={{ aspectRatio: aspect }}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 100vw, 40rem"
          className="object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="border-t border-border px-4 py-2 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
