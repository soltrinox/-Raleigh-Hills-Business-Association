import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { MembersDirectoryClient } from '@/components/members/MembersDirectoryClient';
import { loadMembers } from '@/lib/members';

export const metadata: Metadata = {
  title: 'Member Directory',
  description:
    'Search RHBA members on the map and in the directory. Data is loaded from data/members.json.',
};

export default function MembersPage() {
  const members = loadMembers();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <section className="bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
              Member directory
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
              Explore members on the map, search and sort the list, and use your location to find
              nearby businesses. Update listings by editing{' '}
              <code className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-sm">
                data/members.json
              </code>{' '}
              in the repository.
            </p>
          </div>
        </section>
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <MembersDirectoryClient members={members} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
