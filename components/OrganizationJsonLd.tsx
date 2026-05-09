import { ORG_SOCIAL, getSiteMetadata } from '@/lib/data';
import { getSiteUrl } from '@/lib/site-url';

export function OrganizationJsonLd() {
  const site = getSiteMetadata();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: getSiteUrl(),
    email: site.email,
    telephone: site.phone,
    sameAs: [ORG_SOCIAL.instagram, ORG_SOCIAL.facebook],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
