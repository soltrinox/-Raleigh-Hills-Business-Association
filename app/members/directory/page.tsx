import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { MemberCard } from '@/components/members/MemberCard';
import { AlphaJumpBar } from '@/components/members/AlphaJumpBar';
import { loadMembers } from '@/lib/members';

export const metadata: Metadata = {
  title: 'RHBA Members A–Z',
  description:
    'Browse all Raleigh Hills Business Association members alphabetically.',
};

function groupByLetter(members: { name: string }[]) {
  const groups: Record<string, typeof members> = {};
  for (const m of members) {
    const first = m.name.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : '#';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(m);
  }
  return groups;
}

export default function MembersDirectoryPage() {
  const members = loadMembers().sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  );

  const groups = groupByLetter(members);
  const letters = Object.keys(groups).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });
  const activeLetters = new Set(letters);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <section className="bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
              Members A–Z
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/85">
              Browse all {members.length} RHBA members alphabetically.
            </p>
          </div>
        </section>

        <AlphaJumpBar activeLetters={activeLetters} />

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 space-y-12">
            {letters.map((letter) => (
              <div key={letter} id={`letter-${letter}`} className="scroll-mt-28">
                <h2 className="mb-4 border-b border-border pb-2 font-serif text-2xl font-bold text-foreground">
                  {letter}
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {(groups[letter] as ReturnType<typeof loadMembers>).map((m) => (
                    <li key={m.id} className="min-w-0">
                      <MemberCard member={m} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
