import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { GalleryMasonry } from '@/components/photos/GalleryMasonry';
import { Button } from '@/components/ui/button';
import { getGalleryPhotos } from '@/lib/photos';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photo gallery from Raleigh Hills Business Association events and programs.',
};

export default function GalleryPage() {
  const photos = getGalleryPhotos();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <section className="bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
              Gallery
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
              Moments from RHBA meetings, outreach, and community events. Open a photo to see it larger.
            </p>
            <Button variant="secondary" className="mt-6" asChild>
              <Link href="/events">Back to events</Link>
            </Button>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            {photos.length === 0 ? (
              <p className="text-muted-foreground">No photos in the gallery yet.</p>
            ) : (
              <GalleryMasonry photos={photos} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
