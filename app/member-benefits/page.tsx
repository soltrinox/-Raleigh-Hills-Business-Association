import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageTemplate } from '@/components/page-template';
import { DecorPhoto } from '@/components/photos/DecorPhoto';
import { formatPageTitle, getPageForSlug } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const page = getPageForSlug(['member-benefits']);
  if (!page) return { title: 'Not found' };
  return {
    title: formatPageTitle(page.title),
    description: page.description?.trim() || undefined,
    alternates: page.sourceUrl ? { canonical: page.sourceUrl } : undefined,
  };
}

export default function MemberBenefitsPage() {
  const page = getPageForSlug(['member-benefits']);
  if (!page) notFound();

  const title = formatPageTitle(page.title);
  const subtitle = page.description?.trim() || undefined;

  return (
    <PageTemplate title={title} subtitle={subtitle} blocks={page.blocks} showContentBlocks>
      <DecorPhoto
        seed="member-benefits-aside"
        aspect="3/2"
        className="mb-10"
        caption="RHBA networking and community events"
      />
    </PageTemplate>
  );
}
