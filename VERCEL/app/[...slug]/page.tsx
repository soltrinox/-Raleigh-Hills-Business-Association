import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTemplate } from "@/components/page-template";
import {
  getPageForSlug,
  formatPageTitle,
  getAllStaticSlugParams,
} from "@/lib/data";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getAllStaticSlugParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageForSlug(slug);
  if (!page) return { title: "Not found" };
  return {
    title: formatPageTitle(page.title),
    description: page.description?.trim() || undefined,
    alternates: page.sourceUrl ? { canonical: page.sourceUrl } : undefined,
  };
}

export default async function BundlePage({ params }: Props) {
  const { slug } = await params;
  const page = getPageForSlug(slug);
  if (!page) notFound();

  const title = formatPageTitle(page.title);
  const subtitle = page.description?.trim() || undefined;

  return (
    <PageTemplate
      title={title}
      subtitle={subtitle}
      blocks={page.blocks}
      showContentBlocks
    />
  );
}
