type Props = { children: React.ReactNode; className?: string };

/** Single-column vertical stack: full width, no side-by-side layout at page level. */
export function ContentStack({ children, className = "" }: Props) {
  return <div className={`flex min-w-0 w-full flex-col gap-8 md:gap-10 ${className}`.trim()}>{children}</div>;
}
