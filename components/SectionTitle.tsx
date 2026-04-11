type Props = { children: React.ReactNode; as?: "h2" | "h3"; className?: string };

/** In-page section headings (cards, lists) — matches scale below page h1. */
export function SectionTitle({ children, as: Tag = "h2", className = "" }: Props) {
  return (
    <Tag className={`text-lg font-semibold tracking-tight text-base-content sm:text-xl ${className}`.trim()}>
      {children}
    </Tag>
  );
}
