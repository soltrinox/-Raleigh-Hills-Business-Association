import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentManifest, getPageBySlug } from "@/lib/content";
import { ProseMain } from "@/components/ProseMain";
import { ContentZone } from "@/components/ContentZone";
import { ContentStack } from "@/components/ContentStack";
import { PageHeader } from "@/components/PageHeader";

type Props = { params: Promise<{ slug?: string[] }> };

export async function generateStaticParams() {
  const m = getContentManifest();
  return m.pages
    .filter((p) => p.path.length > 0)
    .map((p) => ({ slug: p.path }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(slug ?? []);
  if (!page) return { title: "Not found" };
  return {
    title: page.title.split("|")[0]?.trim() ?? page.title,
    description: page.description || undefined,
    alternates: page.sourceUrl ? { canonical: page.sourceUrl } : undefined,
  };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = getPageBySlug(slug ?? []);
  if (!page) notFound();

  const title = page.title.split("|")[0]?.trim() ?? page.title;

  return (
    <ContentZone>
      <article className="min-w-0">
        <ContentStack>
          <PageHeader title={title} description={page.description || undefined} />
          <div className="min-w-0 overflow-x-auto">
            <ProseMain html={page.htmlMain} />
          </div>
        </ContentStack>
      </article>
    </ContentZone>
  );
}
