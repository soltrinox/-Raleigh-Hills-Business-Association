import Image from 'next/image';
import { getThemedPhoto } from '@/lib/photos';
import { cn } from '@/lib/utils';

export function ThemedBanner({
  themedKey,
  className,
}: {
  themedKey: string;
  className?: string;
}) {
  const p = getThemedPhoto(themedKey);
  if (!p) return null;

  return (
    <div
      className={cn(
        'relative h-48 w-full overflow-hidden rounded-t-xl sm:h-52',
        className,
      )}
    >
      <Image
        src={p.src}
        alt={p.alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" aria-hidden />
    </div>
  );
}
