type Props = { html: string; className?: string };

/** One body size site-wide; mirrored HTML headings capped so pages feel consistent next to app chrome. */
const baseProse =
  "prose prose-base prose-neutral max-w-none dark:prose-invert " +
  "prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:text-base-content " +
  "prose-h1:text-2xl sm:prose-h1:text-3xl " +
  "prose-h2:text-xl sm:prose-h2:text-2xl " +
  "prose-h3:text-lg sm:prose-h3:text-xl " +
  "prose-p:leading-relaxed prose-li:leading-relaxed " +
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline " +
  "prose-img:rounded-xl prose-img:shadow-md prose-img:max-w-full " +
  "prose-table:block prose-table:w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto " +
  "prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none";

/** Renders sanitized HTML from extract-content. Wrapper is div to avoid nested articles. */
export function ProseMain({ html, className = "" }: Props) {
  return (
    <div className={`${baseProse} ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
